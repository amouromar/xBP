import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("bp.db");

export async function initializeDatabase() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bp_logs (
      id TEXT PRIMARY KEY NOT NULL,
      systolic INTEGER NOT NULL,
      diastolic INTEGER NOT NULL,
      pulse INTEGER,
      createdAt TEXT NOT NULL,
      source TEXT,
      notes TEXT
    );
  `);
}