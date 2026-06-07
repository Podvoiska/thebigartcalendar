# DB schema (snapshot)

> **Maintained from [src/db/schema.ts](../../src/db/schema.ts)** — the code is authoritative. Refresh this file when the schema changes; `npm run db:push` applies the schema to Neon, `npm run db:studio` browses it. Don't rely on this over the code.

## `events`
| Column | Type | Notes |
|---|---|---|
| `id` | text PK | `hash(sourceUrl + title + startDate)` |
| `title` | text NOT NULL | |
| `type` | text NOT NULL | gallery · fair · workshop · performance · auction |
| `start_date` | date NOT NULL | |
| `end_date` | date | |
| `start_time` / `end_time` | text | "HH:MM" |
| `venue` / `city` / `country` / `address` | text | |
| `description` | text | |
| `image_url` | text | scraped (often a hotlink) |
| `tickets_url` | text | |
| `price` | text | e.g. "€40", "Free" |
| `tags` | text[] | |
| `source_url` | text NOT NULL | |
| `source_name` | text NOT NULL | |
| `external_id` | text | |
| `scraped_at` | timestamptz NOT NULL, default `now()` | |
| **`status`** | text NOT NULL, default `'published'` | published · hidden · pending — see [curation](../product/event-curation.md) |
| **`image_url_override`** | text | wins over `image_url` at read time |
| **`title_override`** | text | display-only |
| **`description_override`** | text | |
| **`curated_at`** | timestamptz | last manual edit |

**Blog `posts` table:** not yet created — planned in [exec-plans/active/admin-and-content-platform.md](../exec-plans/active/admin-and-content-platform.md).
