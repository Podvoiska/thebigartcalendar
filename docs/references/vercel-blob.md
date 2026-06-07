# Vercel Blob & image hosting

Canonical reference for the image pipeline and its environment variables.

## Store
- Public store **`thebigartcalendar-images`** (`store_PN4cabQKOP1baqWD`, region `iad1`), linked to the `thebigartcalendar` Vercel project.
- `@vercel/blob` is a dependency; `put()` reads `BLOB_READ_WRITE_TOKEN` from the environment.

## Upload route — `POST /api/admin/upload`
Source: [src/app/api/admin/upload/route.ts](../../src/app/api/admin/upload/route.ts).
- **Auth:** `Authorization: Bearer <ADMIN_UPLOAD_TOKEN>` (else `401`).
- **Body (JSON):** `{ data: <base64 | data-URL>, contentType?, filename?, folder? }`. `folder` ∈ `{events, blog, uploads}`, default `events`.
- **Guards:** images only (else `415`); max ~4 MB decoded (else `413`).
- **Returns:** `{ url, pathname, contentType }` — store `url` in `events.image_url_override` (or use for blog images).
- **Size limit:** on Vercel, request bodies are capped ~4.5 MB and base64 inflates payloads ~33%, so keep source images **< ~3 MB**. For larger files, move to Blob client uploads (see [tech-debt](../exec-plans/tech-debt.md)).

## Environment variables
| Var | Where it's set | Notes |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | All Vercel envs + local | Added by `vercel blob create-store`. Rotate in Vercel → Storage → Blob. |
| `ADMIN_UPLOAD_TOKEN` | Local + Vercel **Prod & Dev** | `openssl rand -hex 32`. Preview not set (see tech-debt). |
| `DATABASE_URL`, `ANTHROPIC_API_KEY` | Vercel **Prod & Preview** + local | **NOT** in Vercel Development. |

## ⚠️ `.env.local` clobber (important)
`vercel env pull` (default target = **development**) and `vercel blob create-store` (which pulls as a side effect) **overwrite the entire `.env.local`** with the chosen environment's variables. Because `DATABASE_URL`/`ANTHROPIC_API_KEY` aren't in Development, a dev pull silently deletes them.
- **Never** `vercel env pull` straight onto `.env.local` while it holds local-only keys. Pull to a temp file and extract what you need (`grep '^KEY=' tmp >> .env.local`), then delete the temp.
- Or add `DATABASE_URL` + `ANTHROPIC_API_KEY` to Vercel's **Development** env so dev pulls are non-destructive.
- Pulled values are written **double-quoted** — strip quotes for shell use (`| tr -d '"'`); Next's dotenv parser strips them at runtime.
- Don't keep `VERCEL_OIDC_TOKEN` in `.env.local` — it's short-lived and confuses `vercel blob` subcommands (pass `--rw-token` for those).

## Rotating `ADMIN_UPLOAD_TOKEN`
1. Regenerate: `openssl rand -hex 32`.
2. Update `.env.local` and Vercel: `vercel env add ADMIN_UPLOAD_TOKEN <env> --value <v> --yes --force` (per env).
3. Update the Retool secret ([retool.md](retool.md)).
