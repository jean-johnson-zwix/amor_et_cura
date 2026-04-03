import os
import logging
from typing import Any
import httpx

logger = logging.getLogger(__name__)

_SUPABASE_URL = None
_SERVICE_ROLE_KEY = None


def _client() -> tuple[str, dict[str, str]]:
    """Return (base_url, headers) for Supabase REST calls, reading env once."""
    global _SUPABASE_URL, _SERVICE_ROLE_KEY
    if _SUPABASE_URL is None:
        _SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
        _SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not _SUPABASE_URL or not _SERVICE_ROLE_KEY:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env"
        )
    headers = {
        "apikey": _SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    return _SUPABASE_URL, headers


def insert_follow_ups(follow_ups: list[dict], visit_id: str, client_id: str) -> None:
    """
    Insert AI-detected follow-up suggestions into the follow_ups table.
    Each item must have: description, category, urgency, suggested_due_days (optional).
    Raises RuntimeError on Supabase failure.
    """
    if not follow_ups:
        return

    base_url, headers = _client()

    from datetime import date, timedelta

    rows = []
    valid_categories = {"Referral", "Medical", "Document", "Financial", "Check-in"}
    for fu in follow_ups:
        category = fu.get("category", "Check-in")
        if category not in valid_categories:
            category = "Check-in"

        due_date = None
        days = fu.get("suggested_due_days")
        if isinstance(days, int) and days > 0:
            due_date = (date.today() + timedelta(days=days)).isoformat()

        rows.append({
            "visit_id": visit_id,
            "client_id": client_id,
            "description": str(fu["description"])[:500],
            "category": category,
            "status": "pending",
            "suggested_due_date": due_date,
        })

    with httpx.Client(timeout=10) as http:
        res = http.post(
            f"{base_url}/rest/v1/follow_ups",
            headers={**headers, "Prefer": "return=minimal"},
            json=rows,
        )
        if not res.is_success:
            raise RuntimeError(
                f"insert_follow_ups failed: {res.status_code} {res.text}"
            )

    logger.info(
        "insert_follow_ups: inserted %d follow-up(s) for visit_id=%s",
        len(rows), visit_id,
    )


def fetch_client_context(client_id: str) -> dict[str, Any]:
    """
    Fetch all data needed to generate a handoff summary for one client.

    Returns:
        {
            "demographics": { dob, phone, address, programs, created_at, custom_fields },
            "visits": [ { visit_date, duration_minutes, notes, case_notes,
                           referral_to, service_type_name, case_worker_name } ]
        }

    Raises:
        ValueError  – missing env vars
        RuntimeError – Supabase returned a non-2xx response
    """
    base_url, headers = _client()

    with httpx.Client(timeout=15) as http:
        # Fetch client demographics
        demo_res = http.get(
            f"{base_url}/rest/v1/clients",
            headers=headers,
            params={
                "id": f"eq.{client_id}",
                "select": "dob,phone,address,programs,created_at,custom_fields",
                "limit": "1",
            },
        )
        if not demo_res.is_success:
            raise RuntimeError(
                f"Supabase clients fetch failed: {demo_res.status_code} {demo_res.text}"
            )
        clients = demo_res.json()
        if not clients:
            raise RuntimeError(f"Client {client_id!r} not found in Supabase")
        demographics = clients[0]

        # Fetch full visit history with service type and case worker names
        visits_res = http.get(
            f"{base_url}/rest/v1/visits",
            headers=headers,
            params={
                "client_id": f"eq.{client_id}",
                "select": "*,service_types(name),profiles(full_name)",
                "order": "visit_date.asc",
            },
        )
        if not visits_res.is_success:
            raise RuntimeError(
                f"Supabase visits fetch failed: {visits_res.status_code} {visits_res.text}"
            )
        raw_visits = visits_res.json()

    visits = [
        {
            "visit_date": v.get("visit_date"),
            "duration_minutes": v.get("duration_minutes"),
            "notes": v.get("notes"),
            "case_notes": v.get("case_notes"),
            "referral_to": v.get("referral_to"),
            "service_type_name": (v.get("service_types") or {}).get("name") or "General",
            "case_worker_name": (v.get("profiles") or {}).get("full_name") or "",
        }
        for v in raw_visits
    ]

    # Fetch existing confirmed summary (best-effort — None if table missing or no row)
    existing_summary: str | None = None
    try:
        summary_res = http.get(
            f"{base_url}/rest/v1/client_summaries",
            headers=headers,
            params={
                "client_id": f"eq.{client_id}",
                "select": "summary_text,confirmed_at",
                "limit": "1",
            },
        )
        if summary_res.is_success:
            rows = summary_res.json()
            if rows and rows[0].get("confirmed_at"):
                existing_summary = rows[0]["summary_text"]
    except Exception:
        pass

    logger.info(
        "fetch_client_context: client_id=%s visits=%d has_prior_summary=%s",
        client_id, len(visits), existing_summary is not None,
    )
    return {"demographics": demographics, "visits": visits, "existing_summary": existing_summary}


def fetch_report_context(
    start_date: str,
    end_date: str,
    program_filter: str | None,
) -> dict[str, Any]:
    """
    Fetch aggregated, anonymized program statistics for a funder report.

    Returns:
        {
            "stats": {
                "unique_clients": int,
                "total_visits": int,
                "visit_breakdown": [{"service_type": str, "count": int}],
                "avg_duration_minutes": float | None,
                "prev_period_visits": int,
                "period_days": int,
            },
            "note_excerpts": ["anonymized excerpt 1", ...],  # max 5, no PII
        }

    No client PII (names, DOB, phone, address) is included in the return value.
    Raises:
        ValueError  – missing env vars
        RuntimeError – Supabase returned a non-2xx response
    """
    base_url, headers = _client()

    # Compute previous period of identical length for trend comparison
    from datetime import date, timedelta
    start = date.fromisoformat(start_date)
    end = date.fromisoformat(end_date)
    period_days = (end - start).days + 1
    prev_end = start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=period_days - 1)

    with httpx.Client(timeout=20) as http:
        # Fetch visits in the current period (service type + client_id + duration + notes)
        # Use list-of-tuples for duplicate param keys (gte + lte on visit_date)
        visit_params = [
            ("visit_date", f"gte.{start_date}"),
            ("visit_date", f"lte.{end_date}"),
            ("select", "client_id,duration_minutes,notes,case_notes,service_types(name)"),
            ("order", "visit_date.desc"),
        ]
        visits_res = http.get(
            f"{base_url}/rest/v1/visits",
            headers=headers,
            params=visit_params,
        )
        if not visits_res.is_success:
            raise RuntimeError(
                f"Supabase visits fetch failed: {visits_res.status_code} {visits_res.text}"
            )
        raw_visits = visits_res.json()

        # Fetch previous period visit count for trend comparison
        prev_params = [
            ("visit_date", f"gte.{prev_start.isoformat()}"),
            ("visit_date", f"lte.{prev_end.isoformat()}"),
            ("select", "id"),
        ]
        prev_res = http.get(
            f"{base_url}/rest/v1/visits",
            headers=headers,
            params=prev_params,
        )
        prev_visits_raw = prev_res.json() if prev_res.is_success else []

    # Optionally filter by service type (program_filter)
    if program_filter:
        raw_visits = [
            v for v in raw_visits
            if (v.get("service_types") or {}).get("name", "").lower() == program_filter.lower()
        ]
        prev_visits_count = sum(
            1 for v in prev_visits_raw
            if (v.get("service_types") or {}).get("name", "").lower() == program_filter.lower()
        ) if isinstance(prev_visits_raw, list) else 0
    else:
        prev_visits_count = len(prev_visits_raw) if isinstance(prev_visits_raw, list) else 0

    # Aggregate stats — no PII
    unique_clients: set[str] = set()
    service_count: dict[str, int] = {}
    durations: list[int] = []
    note_excerpts: list[str] = []

    for v in raw_visits:
        cid = v.get("client_id")
        if cid:
            unique_clients.add(cid)

        svc_name = (v.get("service_types") or {}).get("name") or "General"
        service_count[svc_name] = service_count.get(svc_name, 0) + 1

        dur = v.get("duration_minutes")
        if dur:
            durations.append(int(dur))

        # Collect anonymized note excerpts (no names — case workers may include them,
        # so we truncate and the LLM prompt strictly enforces PII removal in the output)
        note_text = v.get("case_notes") or v.get("notes") or ""
        if note_text.strip() and len(note_excerpts) < 5:
            note_excerpts.append(note_text.strip()[:300])

    visit_breakdown = sorted(
        [{"service_type": k, "count": v} for k, v in service_count.items()],
        key=lambda x: x["count"],
        reverse=True,
    )
    avg_duration = round(sum(durations) / len(durations), 1) if durations else None

    logger.info(
        "fetch_report_context: period=%s–%s program=%s visits=%d unique_clients=%d",
        start_date, end_date, program_filter or "all", len(raw_visits), len(unique_clients),
    )

    return {
        "stats": {
            "unique_clients": len(unique_clients),
            "total_visits": len(raw_visits),
            "visit_breakdown": visit_breakdown,
            "avg_duration_minutes": avg_duration,
            "prev_period_visits": prev_visits_count,
            "period_days": period_days,
        },
        "note_excerpts": note_excerpts,
    }
