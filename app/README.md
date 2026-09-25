# app/

This is where the web app (UI/UX) lives.

- Drop the Next.js (or other) frontend project here directly, e.g. `app/web/` or straight into `app/` if it's the only project.
- - The app talks to two things: Supabase (auth + direct reads via RLS) and the n8n `KH · core` workflow's webhooks (`/kh-ask`, `/kh-organise-note`) for anything that needs the service-role key.
  - - Keep secrets out of this folder — use environment variables / your deploy platform's secret store, never commit a `.env` with real keys.
    - 
