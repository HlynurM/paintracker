// ─── Sleep Repository ─────────────────────────────────────────────────────────
// Stub for the sleep feature — built later. Types are defined now so nothing
// in the db layer needs to change when we add sleep logging.

import { db } from '@/db/db'
import type { SleepRecord } from '@/types/sleep'

export async function saveSleepRecord(record: SleepRecord): Promise<void> {
  await db.sleepRecords.put(record)
}

export async function getSleepRecordByDate(date: string): Promise<SleepRecord | undefined> {
  return db.sleepRecords.get(date)
}

export async function getSleepRecordsInRange(
  fromDate: string,
  toDate: string
): Promise<SleepRecord[]> {
  return db.sleepRecords.where('date').between(fromDate, toDate).toArray()
}

export async function deleteSleepRecord(id: string): Promise<void> {
  await db.sleepRecords.delete(id)
}
