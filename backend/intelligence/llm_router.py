"""
DB-backed LLM task config loader.

get_db_task_config(task_slug) -> dict compatible with llm_config.py output
  - Queries ai_task_configs JOIN ai_models, ordered by priority
  - Also fetches ai_tasks.system_prompt and org_settings for variable injection
  - Results cached for CACHE_TTL seconds (default 5 min)
  - Raises TaskDisabledError if all configs for the task are inactive
  - Raises RuntimeError for connectivity issues (caller falls back to static config)
"""

import os
import time
import logging
import httpx
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

CACHE_TTL = 300  # 5 minutes

# Per-task config cache
_task_cache: Dict[str, Dict[str, Any]] = {}
_task_cache_at: Dict[str, float] = {}

# Org settings cache
_org_cache: Optional[Dict[str, str]] = None
_org_cache_at: float = 0.0


class TaskDisabledError(Exception):
    """Raised when all ai_task_configs for a task have is_active=False."""

    def __init__(self, task_slug: str, display_name: str = ""):
        self.task_slug = task_slug
        self.display_name = display_name or task_slug
        super().__init__(
            f"'{self.display_name}' is currently disabled by your administrator."
        )


def _supabase() -> tuple[str, dict]:
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set")
    return url, {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def _fetch_org() -> Dict[str, str]:
    """Fetch org_name and org_mission; cached for CACHE_TTL seconds."""
    global _org_cache, _org_cache_at
    now = time.monotonic()
    if _org_cache is not None and (now - _org_cache_at) < CACHE_TTL:
        return _org_cache
    try:
        url, headers = _supabase()
        with httpx.Client(timeout=5) as http:
            res = http.get(
                f"{url}/rest/v1/org_settings",
                headers=headers,
                params={"select": "org_name,org_mission", "limit": "1"},
            )
            if res.is_success:
                rows = res.json()
                if rows:
                    _org_cache = {
                        "org_name":    rows[0].get("org_name") or "Our Organization",
                        "org_mission": rows[0].get("org_mission") or "",
                    }
                    _org_cache_at = now
                    return _org_cache
    except Exception as exc:
        logger.warning("llm_router: org_settings fetch failed: %s", repr(exc))
    return {"org_name": "Our Organization", "org_mission": ""}


def _inject(prompt: Optional[str], org: Dict[str, str]) -> Optional[str]:
    """Replace {{org_name}} and {{org_mission}} placeholders in a prompt."""
    if not prompt:
        return prompt
    return (
        prompt
        .replace("{{org_name}}", org["org_name"])
        .replace("{{org_mission}}", org["org_mission"])
    )


def get_db_task_config(task_slug: str) -> Dict[str, Any]:
    """
    Load task config from Supabase.

    Returns a dict with keys:
        provider, model, fallbacks, temperature, max_tokens,
        response_format, system_prompt

    Raises:
        TaskDisabledError  – all configs for this task are inactive
        RuntimeError       – DB unreachable or task not found
                             (caller should fall back to llm_config.py)
    """
    now = time.monotonic()
    cached = _task_cache.get(task_slug)
    if cached is not None and (now - _task_cache_at.get(task_slug, 0)) < CACHE_TTL:
        if not cached.get("_active", True):
            raise TaskDisabledError(task_slug, cached.get("_display_name", task_slug))
        return cached

    url, headers = _supabase()

    with httpx.Client(timeout=5) as http:
        # ── Fetch task row ────────────────────────────────────────────────
        task_res = http.get(
            f"{url}/rest/v1/ai_tasks",
            headers=headers,
            params={"slug": f"eq.{task_slug}", "select": "display_name,system_prompt", "limit": "1"},
        )
        if not task_res.is_success:
            raise RuntimeError(f"ai_tasks fetch failed: HTTP {task_res.status_code}")
        tasks = task_res.json()
        if not tasks:
            raise RuntimeError(f"Task {task_slug!r} not found in ai_tasks")

        display_name = tasks[0].get("display_name", task_slug)
        system_prompt = tasks[0].get("system_prompt")

        # ── Check disabled: fetch all configs (active + inactive) ─────────
        all_res = http.get(
            f"{url}/rest/v1/ai_task_configs",
            headers=headers,
            params={"task_slug": f"eq.{task_slug}", "select": "is_active", "order": "priority.asc"},
        )
        if not all_res.is_success:
            raise RuntimeError(f"ai_task_configs fetch failed: HTTP {all_res.status_code}")
        all_cfgs = all_res.json()

        if all_cfgs and all(not c.get("is_active", True) for c in all_cfgs):
            _task_cache[task_slug] = {"_active": False, "_display_name": display_name}
            _task_cache_at[task_slug] = now
            raise TaskDisabledError(task_slug, display_name)

        # ── Fetch active configs with model data ──────────────────────────
        cfg_res = http.get(
            f"{url}/rest/v1/ai_task_configs",
            headers=headers,
            params={
                "task_slug": f"eq.{task_slug}",
                "is_active": "eq.true",
                "select": "priority,temperature,max_tokens,response_format,ai_models(provider,model_id)",
                "order": "priority.asc",
            },
        )
        if not cfg_res.is_success:
            raise RuntimeError(f"ai_task_configs (active) fetch failed: HTTP {cfg_res.status_code}")
        configs = cfg_res.json()

    if not configs:
        raise RuntimeError(f"No active configs found for task {task_slug!r}")

    primary = configs[0]
    primary_model = primary.get("ai_models") or {}

    fallbacks = [
        (c["ai_models"]["provider"], c["ai_models"]["model_id"])
        for c in configs[1:]
        if c.get("ai_models")
    ]

    org = _fetch_org()
    result: Dict[str, Any] = {
        "provider":        primary_model.get("provider", "gemini"),
        "model":           primary_model.get("model_id", ""),
        "fallbacks":       fallbacks,
        "temperature":     primary.get("temperature", 0.1),
        "max_tokens":      primary.get("max_tokens", 1024),
        "response_format": primary.get("response_format", "text"),
        "system_prompt":   _inject(system_prompt, org),
        "_active":         True,
        "_display_name":   display_name,
    }

    _task_cache[task_slug] = result
    _task_cache_at[task_slug] = now
    logger.debug("llm_router: loaded config for task=%s model=%s", task_slug, result["model"])
    return result


def invalidate_cache(task_slug: Optional[str] = None) -> None:
    """Evict one task (or all tasks + org settings) from the in-memory cache."""
    global _org_cache, _org_cache_at
    if task_slug:
        _task_cache.pop(task_slug, None)
        _task_cache_at.pop(task_slug, None)
    else:
        _task_cache.clear()
        _task_cache_at.clear()
        _org_cache = None
        _org_cache_at = 0.0
