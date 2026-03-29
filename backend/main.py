import json
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from intelligence.llm import call_llm, call_llm_vision, transcribe_audio
from intelligence.llm_config import PHOTO_INTAKE_EXTRACTION, NOTE_STRUCTURING, MULTILINGUAL_INTAKE
from intelligence.prompts import (
    INTAKE_SYSTEM_PROMPT,
    VOICE_NOTE_SYSTEM_PROMPT,
    MULTILINGUAL_INTAKE_SYSTEM_PROMPT,
)

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
        raise HTTPException(status_code=503, detail="AI service unavailable. Please try again.")

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
        raise HTTPException(status_code=503, detail="Transcription service unavailable. Please try again.")

    logger.info("voice-to-note: transcription complete | char_count=%d", len(transcript))

    try:
        structured_note = call_llm(
            system_prompt=VOICE_NOTE_SYSTEM_PROMPT,
            user_prompt=transcript,
            task=NOTE_STRUCTURING,
        )
    except Exception as e:
        logger.error("voice-to-note: note structuring failed: %s", repr(e))
        raise HTTPException(status_code=503, detail="Note structuring service unavailable. Please try again.")

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
        raise HTTPException(status_code=503, detail="AI service unavailable. Please try again.")

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
