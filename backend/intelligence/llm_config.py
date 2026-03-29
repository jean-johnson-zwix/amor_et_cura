from typing import Dict, Any, List, Tuple

# LLM Task Directory
PHOTO_INTAKE_EXTRACTION = "photo_intake_extraction"
AUDIO_TRANSCRIPTION     = "audio_transcription"
NOTE_STRUCTURING        = "note_structuring"
MULTILINGUAL_INTAKE     = "multilingual_intake"

PROVIDER_TIMEOUTS = {
    "gemini":     45,
    "groq":       30,
    "sambanova":  60,
    "openrouter": 90,
}

LLM_TASK_CONFIGS: Dict[str, Dict[str, Any]] = {
    PHOTO_INTAKE_EXTRACTION: {
        # Vision task: extract structured fields from a photo of a paper intake form.
        # Gemini 2.0 Flash has top-tier vision, fast response, and generous free tier.
        "description": "Extract structured intake fields from a photo of a paper form (vision)",
        "provider": "gemini",
        "model": "gemini-2.0-flash",
        "fallbacks": [
            ("gemini", "gemini-1.5-flash"),
        ],
        "max_tokens": 1024,
        "temperature": 0.0,
        "response_format": "json",
    },
    AUDIO_TRANSCRIPTION: {
        # Groq-hosted Whisper: fastest speech-to-text with near-identical accuracy to large-v3.
        # This task is handled by _call_groq_audio (not the chat completions path).
        "description": "Transcribe caseworker verbal notes to text via Groq Whisper",
        "provider": "groq",
        "model": "whisper-large-v3-turbo",
        "fallbacks": [
            ("groq", "whisper-large-v3"),
        ],
        "max_tokens": 0,    # N/A for Whisper
        "temperature": 0.0,
        "response_format": "text",
    },
    NOTE_STRUCTURING: {
        # Format a raw transcript into a structured clinical case note (Markdown).
        # Groq llama-3.3-70b delivers excellent quality at very high throughput.
        "description": "Format a raw transcript into a structured clinical case note",
        "provider": "groq",
        "model": "llama-3.3-70b-versatile",
        "fallbacks": [
            ("gemini", "gemini-2.0-flash"),
            ("sambanova", "Meta-Llama-3.3-70B-Instruct"),
        ],
        "max_tokens": 2048,
        "temperature": 0.2,
        "response_format": "text",
    },
    MULTILINGUAL_INTAKE: {
        # Vision task: extract intake fields from forms in any language, with language detection.
        # Gemini 2.0 Flash has class-leading multilingual and vision capabilities.
        "description": "Extract intake fields from forms in any language, with language detection",
        "provider": "gemini",
        "model": "gemini-2.0-flash",
        "fallbacks": [
            ("gemini", "gemini-1.5-flash"),
        ],
        "max_tokens": 1024,
        "temperature": 0.0,
        "response_format": "json",
    },
}


def get_llm_task_config(task_name: str) -> Dict[str, Any]:
    try:
        return LLM_TASK_CONFIGS[task_name]
    except KeyError as e:
        raise ValueError(f"Unknown LLM task config: {task_name}") from e