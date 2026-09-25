# NoteHive

The Claude Design screens (`../Landing.dc.html`, `../S1–S4 *.dc.html`, `../NoteHive Design System.dc.html`) built as a Next.js 16 app on the PRD stack (`../uploads/prd.txt`, section 8).

**Docs:** [Architecture](docs/ARCHITECTURE.md) (how the codebase is organised) · [Code flows](docs/FLOWS.md) (what happens, file by file, for each user action).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. With the default `USE_MOCKS=true`, **Continue with Google** signs you in as the demo user Aman Verma, who has seeded groups, notes and answers taken from the designs. Try asking:

- "How should I chunk PDFs for RAG?" gives a full answer, with peer credits and a Join group button.
- "What is LoRA and when should I use it?" gives a partly covered answer.
- "How do I run agents on a phone offline?" gives the no-coverage state.

Set `ASK_RATE_LIMIT_PER_HOUR=1` to see the rate-limited state.

## Screens

| Design | Route |
|---|---|
| Landing | `/` (signed out) |
| S1 Sign in | `/signin?reason=ended\|cancelled\|failed`, `/auth/continuing`, shared-note gate at `/notes/<id>` when signed out |
| S2 Home / Ask | `/` (signed in) |
| S3 Answer | `/ask/new?q=…` (two-stage loading), `/ask/<id>` |
| S4 Note editor | `/notes/new`, `/notes/<id>/edit`, and inline under every answer |

These screens were not in the design project. They are built from design-system components: My notes `/notes`, Note `/notes/<id>`, Group `/groups/<id>`, Create group and Join with code dialogs, `/join/<code>`, and Profile `/profile`.

## Structure

- `src/app/globals.css`: NoteHive tokens (light and dark), copied from the design system and mapped to Tailwind (`bg-surface`, `text-ink-2`, `border-line`, `bg-accent-soft`, …).
- `src/lib/data/`: one `DataSource` interface, with two implementations: `mock.ts` (in-memory) and `supabase.ts` (RLS enforced).
- `src/lib/ask.ts`: the answer engine. It calls n8n `ask`, validated with zod, or a mock of WF-1 that respects scope and read rules.
- `src/app/api/ask`, `src/app/api/notes/[id]/organise`: the server routes from PRD section 10. Errors use the 10.1 format.
- `src/lib/actions.ts`: server actions for notes, groups and profile.
- `src/proxy.ts`: the auth gate (FR-AUTH-03) and Supabase session refresh.
- `supabase/migrations/0001_init.sql`: the schema, functions, triggers and RLS from PRD section 9. `supabase/seed.sql` holds the categories and groups.

## Going live

1. Create a Supabase project. Run the migration, then the seed. Enable the Google provider with the redirect URL `<site>/auth/callback`.
2. In n8n, the "KH · core" workflow needs the webhooks `kh-ask` and `kh-organise-note` (PRD section 11). Both receive the `x-webhook-secret` header. You can rename them with `N8N_ASK_WEBHOOK` / `N8N_ORGANISE_WEBHOOK`.
3. Copy `.env.example` to `.env.local`, fill in the values, and set `USE_MOCKS=false`.

Sign-in is Google only, as in the designs. This intentionally departs from the PRD's magic link.
