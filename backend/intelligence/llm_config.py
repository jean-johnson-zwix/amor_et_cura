from typing import Dict, Any

# LLM Task Directory
PHOTO_INTAKE_EXTRACTION = "photo_intake_extraction"
AUDIO_TRANSCRIPTION     = "audio_transcription"
NOTE_STRUCTURING        = "note_structuring"
MULTILINGUAL_INTAKE     = "multilingual_intake"
CLIENT_SUMMARY          = "client_summary"
FUNDER_REPORT           = "funder_report"
FOLLOW_UP_EXTRACTION    = "follow_up_extraction"

# Timeouts for different providers in seconds
PROVIDER_TIMEOUTS = {
    "gemini":     45,
    "groq":       30,
    "sambanova":  60,
    "openrouter": 90,
}

LLM_TASK_CONFIGS: Dict[str, Dict[str, Any]] = {
    PHOTO_INTAKE_EXTRACTION: {
        "description": "Extract structured intake fields from a photo (vision)",
        "provider": "gemini",
        "model": "gemini-3.1-flash-image-preview", # Nano Banana 2 for 2026
        "fallbacks": [("gemini", "gemini-2.5-flash")],
        "max_tokens": 1024,
        "temperature": 0.0,
        "response_format": "json",
    },
    AUDIO_TRANSCRIPTION: {
        "description": "Transcribe caseworker verbal notes via Groq Whisper",
        "provider": "groq",
        "model": "whisper-large-v3-turbo",
        "fallbacks": [("groq", "whisper-large-v3")],
        "max_tokens": 0,
        "temperature": 0.0,
        "response_format": "text",
    },
    NOTE_STRUCTURING: {
        "description": "Format a raw transcript into a structured clinical case note",
        "provider": "groq",
        "model": "llama-3.3-70b-versatile",
        "fallbacks": [
            ("gemini", "gemini-2.5-flash"), 
            ("gemini", "gemini-3-flash-preview")
        ],
        "max_tokens": 2048,
        "temperature": 0.2,
        "response_format": "text",
    },
    MULTILINGUAL_INTAKE: {
        "description": "Extract intake fields from forms in any language",
        "provider": "gemini",
        "model": "gemini-3.1-flash-image-preview", #
        "fallbacks": [("gemini", "gemini-3.1-flash-lite-preview")],
        "max_tokens": 1024,
        "temperature": 0.0,
        "response_format": "json",
    },
    CLIENT_SUMMARY: {
        "description": "Synthesize client demographics and visit history into a clinical handoff brief",
        "provider": "gemini",
        "model": "gemini-2.5-flash",
        "fallbacks": [
            ("groq", "llama-3.3-70b-versatile"),
            ("gemini", "gemini-3-flash-preview"),
        ],
        "max_tokens": 3000,
        "temperature": 0.2,
        "response_format": "text",
    },
    FUNDER_REPORT: {
        "description": "Generate a professional grant narrative from aggregated program statistics",
        "provider": "gemini",
        "model": "gemini-3.1-pro-preview",  # Highest reasoning — grant writing requires professional voice
        "fallbacks": [
            ("gemini", "gemini-2.5-flash"),
            ("groq", "llama-3.3-70b-versatile"),
        ],
        "max_tokens": 4000,
        "temperature": 0.3,
        "response_format": "text",
    },
    FOLLOW_UP_EXTRACTION: {
        "description": "Extract implied follow-up actions from a clinical case note",
        "provider": "gemini",
        "model": "gemini-2.5-flash",
        "fallbacks": [
            ("groq", "llama-3.3-70b-versatile"),
            ("gemini", "gemini-3-flash-preview"),
        ],
        "max_tokens": 1024,
        "temperature": 0.1,
        "response_format": "json",
    },
}

def get_llm_task_config(task_name: str) -> Dict[str, Any]:
    try:
        return LLM_TASK_CONFIGS[task_name]
    except KeyError as e:
        raise ValueError(f"Unknown LLM task config: {task_name}") from e