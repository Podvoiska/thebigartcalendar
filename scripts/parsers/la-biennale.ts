import { extractEventsFromHtml, stripHtml } from '../lib/extract';
import { upsertEvents } from '../lib/upsert';

const BASE = 'https://www.labiennale.org';
const AGENDA_URL = `${BASE}/en/agenda`;

// The agenda paginates via ?page=N with 5 entries per page.
// We walk pages until one returns no new content.
async function fetchAllAgendaPages(): Promise<string> {
  const pages: string[] = [];
  let page = 0;

  while (true) {
    const url = page === 0 ? AGENDA_URL : `${AGENDA_URL}?sector=All&place=All&year=All&month=All&day=All&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) break;
    const html = await res.text();
    const text = stripHtml(html);

    // Stop when the page has no event dates (Drupal agenda entries always contain a year)
    if (page > 0 && !text.includes('2026') && !text.includes('2027')) break;

    pages.push(`[page ${page}]\n${text}`);
    page++;

    // Safety cap — avoid infinite loops if the site changes structure
    if (page > 20) break;

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  return pages.join('\n\n---\n\n');
}

export async function run(): Promise<void> {
  console.log('[La Biennale] Fetching paginated agenda…');
  const combined = await fetchAllAgendaPages();

  const events = await extractEventsFromHtml(
    combined,
    {
      sourceName: 'La Biennale di Venezia',
      defaultCity: 'Venice',
      defaultCountry: 'Italy',
      defaultVenue: 'La Biennale di Venezia',
    },
    { maxChars: 120_000 },
  );

  console.log(`[La Biennale] ${events.length} upcoming event(s) found`);
  await upsertEvents(events);
}
