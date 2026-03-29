# Amor et Cura — AI Backend

FastAPI backend deployed on Render. Provides three ephemeral AI endpoints powered by **Gemini 2.0 Flash**, **Groq Whisper**, and **Llama 3.3 70B**.
No files are ever written to disk — all processing is in-memory only.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/ai/photo-to-intake` | Image of English paper form → structured intake JSON |
| POST | `/ai/voice-to-note` | Audio recording → structured clinical case note (Markdown) |
| POST | `/ai/multilingual-intake` | Image of form in any language → structured intake JSON with language detection |

---

## AI Features

### Photo-to-Intake (`/ai/photo-to-intake`)

Accepts a photo of a paper intake form and returns structured JSON for pre-populating the client registration form. Staff review and confirm before the record is created.

**Model:** Gemini 2.0 Flash (vision) → Gemini 1.5 Flash (fallback)

**Extracted fields:** `first_name`, `last_name`, `dob` (YYYY-MM-DD), `phone`, `email`, `address`, `programs[]`

**Accepted types:** `image/jpeg`, `image/png`, `image/webp`, `image/heic`

---

### Voice-to-Case Notes (`/ai/voice-to-note`)

Accepts an audio recording and returns a structured, formatted case note in Markdown. Two-step pipeline:

1. **Transcription** — Groq Whisper (`whisper-large-v3-turbo`)
2. **Structuring** — Groq Llama 3.3 70B → Gemini 2.0 Flash (fallback)

**Output format:**
```
### Summary of Visit
### Observations
### Action Plan & Referrals
```

Audio is never stored. Only the structured note text is returned.

**Accepted types:** `audio/mpeg` (mp3), `audio/wav`, `audio/ogg`, `audio/webm`, `audio/mp4`

---

### Multilingual Intake (`/ai/multilingual-intake`)

Accepts a photo of an intake form written in any language. Detects the language, extracts fields, and normalizes program names to English.

**Model:** Gemini 2.0 Flash (vision) → Gemini 1.5 Flash (fallback)

**Extracted fields:** `detected_language` (ISO 639-1), `first_name`, `last_name`, `english_name` (transliteration for non-Latin scripts), `dob`, `phone`, `email`, `address`, `programs[]`, `notes`

**Accepted types:** `image/jpeg`, `image/png`, `image/webp`, `image/heic`

> **Note (FR-AI-17):** Caching of translated form labels is not yet implemented in this service. This is a planned enhancement.

---

## Local Development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload
```

Visit `http://localhost:8000/docs` for the auto-generated Swagger UI.

---

## Deploying to Render

1. Push this repo to GitHub.
2. In the Render dashboard → **New Web Service** → connect your repo.
3. Set **Root Directory** to `backend`.
4. Add the following environment variables (see `.env` for keys needed): `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `CEREBRAS_API_KEY`, `SAMBANOVA_API_KEY`.
5. Render will auto-detect `render.yaml` and configure the rest.

---

## Privacy Design

- **Ephemeral processing**: uploaded files are read into memory via `await file.read()` and passed directly to the LLM module. They are never written to disk.
- **PII-safe logs**: logs record only metadata (content type, program count, character count). Client names, addresses, and other PII are never logged.
- **No audio retention**: audio files are processed and discarded; only the transcript and structured note are returned.
- **No database**: this service is stateless. Persistence lives in your case management system, not here.

---

## Requirements Coverage

| Requirement | Description | Status |
|-------------|-------------|--------|
| FR-AI-1 | Upload photo of paper intake form | Backend endpoint ready |
| FR-AI-2 | Extract fields via vision AI | Complete — Gemini 2.0 Flash |
| FR-AI-3 | Return data for staff review before saving | Complete — JSON returned for frontend confirmation |
| FR-AI-13 | Accept audio from service entry form | Backend endpoint ready |
| FR-AI-14 | Transcribe and structure audio into case note | Complete — Whisper + Llama 3.3 70B |
| FR-AI-15 | No audio storage; transcript only | Complete — in-memory processing, no disk writes |
| FR-AI-16 | Multilingual form extraction (EN/ES minimum) | Complete — any language via `/ai/multilingual-intake` |
| FR-AI-17 | Cache translated form labels | Not yet implemented |
