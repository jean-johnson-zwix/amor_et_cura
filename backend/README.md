# Amor et Cura — AI Backend

FastAPI backend deployed on Render. Provides two ephemeral AI endpoints powered by **Gemini 1.5 Flash**.
No files are ever written to disk — all processing is in-memory only.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/ai/photo-to-intake` | Image of paper form → structured intake JSON |
| POST | `/ai/voice-to-note` | Audio recording → structured clinical case note |

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
4. Add all the env files as the environment variable 
5. Render will auto-detect `render.yaml` and configure the rest.

---

## Privacy Design

- **Ephemeral processing**: uploaded files are read into memory via `await file.read()` and passed directly to the LLM Module. They are never written to disk.
- **PII-safe logs**: logs record only metadata (content type, program count, character count). Client names, addresses, and other PII are never logged.
- **No database**: this service is stateless. Persistence lives in your case management system, not here.

---

## Accepted File Types

| Endpoint | Accepted types |
|----------|---------------|
| `/ai/photo-to-intake` | `image/jpeg`, `image/png`, `image/webp`, `image/heic` |
| `/ai/voice-to-note` | `audio/mpeg` (mp3), `audio/wav`, `audio/ogg`, `audio/webm`, `audio/mp4` |