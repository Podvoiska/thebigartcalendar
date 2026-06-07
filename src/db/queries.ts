import { asc, eq } from 'drizzle-orm';
import { db } from './index';
import { events } from './schema';

export async function getAllEvents() {
  return db
    .select()
    .from(events)
    .where(eq(events.status, 'published'))
    .orderBy(asc(events.startDate));
}
