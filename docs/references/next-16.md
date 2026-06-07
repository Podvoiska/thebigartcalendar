# Next.js 16 notes

**This is not the Next.js in your training data.** APIs, conventions, and file structure differ. Before writing Next code, read the relevant guide under `node_modules/next/dist/docs/` (e.g. `01-app/01-getting-started/`, `01-app/03-api-reference/03-file-conventions/`).

Specifics confirmed and relied on here:
- **Route handlers** (`src/app/**/route.ts`) use the Web `Request`/`Response` APIs. `POST` is never cached. Read JSON via `await request.json()`, headers via `request.headers`. Dynamic `context.params` is a **Promise** (`await params`). No `bodyParser` config needed. (Example: the upload route.)
- **Caching:** route handlers aren't cached by default. The calendar page reads the DB at request time, so curation edits appear on the next render. If ISR/caching is added later, you must explicitly revalidate after edits.
- **tsconfig `target` is below es2018** — runtime-level regex flags like `/s` (dotAll) fail typecheck. Use `[\s\S]` instead of `.` with `/s`. (`next build` runs `tsc`, so this fails the build, not just the editor.)
- **`next/image` remote images** need `images.remotePatterns` in `next.config.ts`. Currently the app uses plain `<img>`, so no patterns are configured yet (see tech-debt).

Versions: Next **16.2.6**, React **19.2.4** (Turbopack dev).
