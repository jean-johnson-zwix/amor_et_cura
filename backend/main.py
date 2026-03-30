import json
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import EmbedRequest, ClientSummaryRequest
from dotenv import load_dotenv
load_dotenv()
from intelligence.llm import call_llm, call_llm_vision, transcribe_audio
from intelligence.llm_config import PHOTO_INTAKE_EXTRACTION, NOTE_STRUCTURING, MULTILINGUAL_INTAKE, CLIENT_SUMMARY
from intelligence.prompts import (
    INTAKE_SYSTEM_PROMPT,
    VOICE_NOTE_SYSTEM_PROMPT,
    MULTILINGUAL_INTAKE_SYSTEM_PROMPT,
    CLIENT_SUMMARY_GENERATOR_SYSTEM_PROMPT,
)
from intelligence.embedding import embed_text
from data.supabase import fetch_client_context

# ── Logging setup (PII-safe: never log names/addresses) ──────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("amor_et_cura")

app = FastAPI(
    title="Amor et Cura AI Backend",
    description="Ephemeral AI processing for intake forms and case notes. No files are persisted.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _ai_error_message(exc: Exception) -> str:
    """Return a caseworker-friendly error message based on the exception."""
    msg = str(exc)
    if "429" in msg or "Too Many Requests" in msg:
        return (
            "The AI service is temporarily over capacity. "
            "Please wait about 30 seconds and try again. "
            "If this keeps happening, try uploading a clearer photo or contact your supervisor."
        )
    if "OPENROUTER_API_KEY" in msg or "GEMINI_API_KEY" in msg:
        return (
            "The AI feature is not configured yet. "
            "Please ask your system administrator to set up the AI service."
        )
    if "404" in msg or "Not Found" in msg:
        return (
            "The AI service is temporarily unavailable due to a configuration issue. "
            "Please contact your supervisor."
        )
    return (
        "The AI service is temporarily unavailable. "
        "Please try again in a moment. "
        "If the problem persists, you can fill in the form manually."
    )


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "amor-et-cura-backend"}


# ── Endpoint 1: Photo → Intake JSON ──────────────────────────────────────────
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}

@app.post("/ai/photo-to-intake")
async def photo_to_intake(file: UploadFile = File(...)):
    """
    Accepts an image of a paper intake form (English).
    Returns extracted client fields as JSON.
    Files are processed entirely in memory — never written to disk.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported image type '{file.content_type}'. Use JPEG, PNG, WEBP, or HEIC.",
        )

    logger.info("photo-to-intake: received file | content_type=%s", file.content_type)

    image_bytes = await file.read()

    try:
        raw_text = call_llm_vision(
            image_bytes=image_bytes,
            image_mime_type=file.content_type,
            system_prompt=INTAKE_SYSTEM_PROMPT,
            user_prompt="Extract all intake form fields from this image.",
            task=PHOTO_INTAKE_EXTRACTION,
        )
    except Exception as e:
        logger.error("photo-to-intake: AI call failed: %s", repr(e))
        raise HTTPException(status_code=503, detail=_ai_error_message(e))

    try:
        intake_data = json.loads(raw_text)
    except json.JSONDecodeError:
        logger.error("photo-to-intake: JSON parse failed")
        raise HTTPException(status_code=422, detail="Could not parse AI response as JSON.")

    # PII-safe log: only log program count, not names or addresses
    program_count = len(intake_data.get("programs") or [])
    logger.info("photo-to-intake: extraction complete | programs_found=%d", program_count)

    return {"intake": intake_data}

# ── Endpoint 2: Voice → Structured Case Note ─────────────────────────────────
ALLOWED_AUDIO_TYPES = {"audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4"}

@app.post("/ai/voice-to-note")
async def voice_to_note(file: UploadFile = File(...)):
    """
    Accepts an audio recording of a caseworker's verbal notes.
    Transcribes via Groq Whisper, then structures into a clinical case note (Markdown).
    Files are processed entirely in memory — never written to disk.
    """
    content_type = file.content_type or "audio/mpeg"
    if content_type in ("audio/mp3", "audio/mpeg"):
        content_type = "audio/mpeg"

    if content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported audio type '{file.content_type}'. Use MP3, WAV, OGG, WEBM, or MP4.",
        )

    logger.info("voice-to-note: received file | content_type=%s", content_type)

    audio_bytes = await file.read()

    try:
        transcript = transcribe_audio(
            audio_bytes=audio_bytes,
            audio_mime_type=content_type,
        )
    except Exception as e:
        logger.error("voice-to-note: transcription failed: %s", repr(e))
        raise HTTPException(status_code=503, detail=_ai_error_message(e))

    logger.info("voice-to-note: transcription complete | char_count=%d", len(transcript))

    try:
        structured_note = call_llm(
            system_prompt=VOICE_NOTE_SYSTEM_PROMPT,
            user_prompt=transcript,
            task=NOTE_STRUCTURING,
        )
    except Exception as e:
        logger.error("voice-to-note: note structuring failed: %s", repr(e))
        raise HTTPException(status_code=503, detail=_ai_error_message(e))

    logger.info("voice-to-note: note generated | char_count=%d", len(structured_note))

    return {"structured_note": structured_note.strip()}


# ── Endpoint 3: Multilingual Photo → Intake JSON ─────────────────────────────
@app.post("/ai/multilingual-intake")
async def multilingual_intake(file: UploadFile = File(...)):
    """
    Accepts an image of an intake form written in any language.
    Returns extracted client fields with automatic language detection.
    Files are processed entirely in memory — never written to disk.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported image type '{file.content_type}'. Use JPEG, PNG, WEBP, or HEIC.",
        )

    logger.info("multilingual-intake: received file | content_type=%s", file.content_type)

    image_bytes = await file.read()

    try:
        raw_text = call_llm_vision(
            image_bytes=image_bytes,
            image_mime_type=file.content_type,
            system_prompt=MULTILINGUAL_INTAKE_SYSTEM_PROMPT,
            user_prompt="Extract all intake form fields from this image and detect the language.",
            task=MULTILINGUAL_INTAKE,
        )
    except Exception as e:
        logger.error("multilingual-intake: AI call failed: %s", repr(e))
        raise HTTPException(status_code=503, detail=_ai_error_message(e))

    try:
        intake_data = json.loads(raw_text)
    except json.JSONDecodeError:
        logger.error("multilingual-intake: JSON parse failed")
        raise HTTPException(status_code=422, detail="Could not parse AI response as JSON.")

    # PII-safe log
    lang = intake_data.get("detected_language", "unknown")
    program_count = len(intake_data.get("programs") or [])
    logger.info(
        "multilingual-intake: extraction complete | language=%s programs_found=%d",
        lang, program_count,
    )

    return {"intake": intake_data}

@app.post("/ai/client-summary")
async def client_summary(req: ClientSummaryRequest):
    """
    Accepts a client_id, fetches demographics and visit history directly from Supabase,
    and returns a structured clinical handoff summary generated by the LLM.
    Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the backend environment.
    """
    logger.info("client-summary: fetching context | client_id=%s", req.client_id)
    try:
        context = fetch_client_context(req.client_id)
    except ValueError as e:
        # Missing env vars
        raise HTTPException(status_code=500, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    d = context["demographics"]
    visits = context["visits"]

    # Build the demographics block
    programs = ", ".join(d.get("programs") or []) or "None recorded"
    demo_lines = [
        f"Date of Birth: {d.get('dob') or 'Unknown'}",
        f"Programs enrolled: {programs}",
        f"Phone: {d.get('phone') or '—'}",
        f"Address: {d.get('address') or '—'}",
        f"Registered: {d.get('created_at', '')[:10]}",
    ]
    if d.get("custom_fields"):
        for k, v in d["custom_fields"].items():
            if v:
                demo_lines.append(f"{k}: {v}")

    demo_block = "\n".join(demo_lines)

    # Build the visit history block
    if not visits:
        visit_block = "No visits recorded."
    else:
        visit_parts = []
        for v in visits:
            lines = [f"[{v.get('visit_date', 'Unknown date')}] {v.get('service_type_name', 'General')}"]
            if v.get("case_worker_name"):
                lines[0] += f" (by {v['case_worker_name']})"
            if v.get("duration_minutes"):
                lines[0] += f" — {v['duration_minutes']} min"
            if v.get("case_notes"):
                lines.append(f"  Case Notes: {v['case_notes']}")
            if v.get("notes"):
                lines.append(f"  Notes: {v['notes']}")
            if v.get("referral_to"):
                lines.append(f"  Referral: {v['referral_to']}")
            visit_parts.append("\n".join(lines))
        visit_block = "\n\n".join(visit_parts)

    user_prompt = f"""## Client Demographics
{demo_block}

## Visit History ({len(visits)} visit{"s" if len(visits) != 1 else ""})
{visit_block}"""

    logger.info(
        "client-summary: generating | visits=%d demo_chars=%d",
        len(visits), len(demo_block),
    )

    try:
        summary = call_llm(
            system_prompt=CLIENT_SUMMARY_GENERATOR_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            task=CLIENT_SUMMARY,
        )
    except Exception as e:
        logger.error("client-summary: LLM call failed: %s", repr(e))
        raise HTTPException(status_code=503, detail=_ai_error_message(e))

    from datetime import datetime, timezone
    return {"summary": summary.strip(), "generated_at": datetime.now(timezone.utc).isoformat()}


@app.post("/ai/embed")
async def embed(req: EmbedRequest):
    """
    Accepts a text string and returns a 768-dimensional embedding vector
    using Gemini text-embedding-004. Used by the frontend to embed case notes
    on save and to embed search queries for semantic search.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=422, detail="text must not be empty.")

    logger.info("embed: generating embedding | char_count=%d", len(req.text))

    try:
        vector = embed_text(req.text.strip())
    except Exception as e:
        logger.error("embed: failed: %s", repr(e))
        raise HTTPException(status_code=503, detail=_ai_error_message(e))

    return {"embedding": vector, "dims": len(vector)}