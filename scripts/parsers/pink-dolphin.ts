import { extractEventsFromHtml } from '../lib/extract';
import { upsertEvents } from '../lib/upsert';

const URL = 'https://pinkdolphinlisbon.com/pages/eventsandcreativeworkshops';

export async function run(): Promise<void> {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const events = await extractEventsFromHtml(html, {
    sourceName: 'Pink Dolphin Lisbon',
    defaultCity: 'Lisbon',
    defaultCountry: 'Portugal',
    defaultVenue: 'Pink Dolphin',
    defaultAddress: 'Rua Poço dos Negros 37, Lisbon',
  });

  console.log(`[Pink Dolphin] ${events.length} upcoming event(s) found`);
  await upsertEvents(events);
}
