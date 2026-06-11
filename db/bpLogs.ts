import { db } from "./index";
import { BloodPressureReading } from "@/types";

/* =========================
   CREATE
========================= */
export async function insertBpLog(reading: BloodPressureReading) {
  await db.runAsync(
    `
    INSERT INTO bp_logs (
      id,
      systolic,
      diastolic,
      pulse,
      createdAt,
      source,
      notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      reading.id,
      reading.systolic,
      reading.diastolic,
      reading.pulse ?? null,
      reading.createdAt,
      reading.source ?? null,
      reading.notes ?? null,
    ]
  );
}

/* =========================
   READ (ALL)
========================= */
export async function getAllBpLogs() {
  return db.getAllAsync<BloodPressureReading>(`
    SELECT *
    FROM bp_logs
    ORDER BY createdAt DESC
  `);
}

/* =========================
   READ (BY ID)
========================= */
export async function getBpLogById(id: string) {
  return db.getFirstAsync<BloodPressureReading>(
    `
    SELECT *
    FROM bp_logs
    WHERE id = ?
    `,
    [id]
  );
}

/* =========================
   READ (BY DAY)
   (IMPORTANT for your UI)
========================= */
export async function getBpLogsByDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return db.getAllAsync<BloodPressureReading>(
    `
    SELECT *
    FROM bp_logs
    WHERE createdAt BETWEEN ? AND ?
    ORDER BY createdAt DESC
    `,
    [start.toISOString(), end.toISOString()]
  );
}

/* =========================
   READ (BY RANGE - week/month)
========================= */
export async function getBpLogsByRange(start: Date, end: Date) {
  return db.getAllAsync<BloodPressureReading>(
    `
    SELECT *
    FROM bp_logs
    WHERE createdAt BETWEEN ? AND ?
    ORDER BY createdAt DESC
    `,
    [start.toISOString(), end.toISOString()]
  );
}

/* =========================
   UPDATE
========================= */
export async function updateBpLog(
  id: string,
  updates: Partial<Omit<BloodPressureReading, "id">>
) {
  await db.runAsync(
    `
    UPDATE bp_logs
    SET
      systolic = COALESCE(?, systolic),
      diastolic = COALESCE(?, diastolic),
      pulse = COALESCE(?, pulse),
      notes = COALESCE(?, notes)
    WHERE id = ?
    `,
    [
      updates.systolic ?? null,
      updates.diastolic ?? null,
      updates.pulse ?? null,
      updates.notes ?? null,
      id,
    ]
  );
}

/* =========================
   DELETE
========================= */
export async function deleteBpLog(id: string) {
  await db.runAsync(
    `
    DELETE FROM bp_logs
    WHERE id = ?
    `,
    [id]
  );
}

/* =========================
   OPTIONAL: CLEAR ALL
========================= */
export async function clearBpLogs() {
  await db.runAsync(`DELETE FROM bp_logs`);
}