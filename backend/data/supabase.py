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

    logger.info(
        "fetch_client_context: client_id=%s visits=%d", client_id, len(visits)
    )
    return {"demographics": demographics, "visits": visits}
