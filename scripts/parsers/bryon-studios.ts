import { extractEventsFromHtml } from '../lib/extract';
import { upsertEvents } from '../lib/upsert';

const URL = 'https://www.bryonstudios.com/collections/events-and-workshops';

export async function run(): Promise<void> {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  // Shopify shows this when a collection has no products
  if (html.includes('No products found') || html.includes('"productCount":0')) {
    console.log('[Bryon Studios] Collection empty — no events to scrape');
    return;
  }

  const events = await extractEventsFromHtml(html, {
    sourceName: 'Bryon Studios',
    defaultCountry: 'United Kingdom',
  });

  console.log(`[Bryon Studios] ${events.length} upcoming event(s) found`);
  await upsertEvents(events);
}
