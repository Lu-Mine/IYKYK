import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export interface QuizSettings {
  allowRepeat: boolean;
  showAnalysis: boolean;
  shuffleQuestions: boolean;
}

export interface QuizRow {
  id: string;
  user_id: string;
  host_name: string | null;
  title: string;
  description: string | null;
  questions: string;
  host_scores: string;
  settings: string;
  secret: string;
  device_info: string | null;
  created_at: string;
}

export interface ResponseRow {
  id: string;
  response_id: string;
  quiz_id: string;
  participant_name: string;
  participant_scores: string;
  answers: string;
  submitted_at: string;
  created_at: string;
  device_info: string | null;
  ip: string | null;
  browser_id: string | null;
}

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  allowRepeat: true,
  showAnalysis: true,
  shuffleQuestions: false,
};

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  host_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  questions TEXT NOT NULL,
  host_scores TEXT NOT NULL,
  settings TEXT NOT NULL,
  secret TEXT NOT NULL,
  device_info TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes (user_id);

CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY,
  response_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  participant_scores TEXT NOT NULL,
  answers TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  device_info TEXT,
  ip TEXT DEFAULT '',
  browser_id TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_responses_quiz_id ON responses (quiz_id);
CREATE INDEX IF NOT EXISTS idx_responses_quiz_dedup ON responses (quiz_id, participant_name, browser_id, ip);
`;

const globalWithSqlite = globalThis as typeof globalThis & {
  _iykykDb?: Database.Database;
};

export function getDbPath(): string {
  return process.env.DB_PATH || '/var/lib/iykyk/iykyk.db';
}

export function getDb(): Database.Database {
  if (globalWithSqlite._iykykDb) {
    return globalWithSqlite._iykykDb;
  }

  const dbPath = getDbPath();
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.exec(SCHEMA_SQL);

  globalWithSqlite._iykykDb = db;
  return db;
}

export function closeDb(): void {
  if (globalWithSqlite._iykykDb) {
    globalWithSqlite._iykykDb.close();
    globalWithSqlite._iykykDb = undefined;
  }
}

export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function findQuizById(db: Database.Database, quizId: string): QuizRow | undefined {
  return db
    .prepare('SELECT * FROM quizzes WHERE id = ? OR user_id = ? LIMIT 1')
    .get(quizId, quizId) as QuizRow | undefined;
}

export function extractClientIp(req: any): string {
  return (req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '')
    .toString()
    .split(',')[0]
    .trim();
}

export function hasExistingResponse(
  db: Database.Database,
  quizIds: string[],
  participantName?: string,
  browserId?: string,
  ip?: string
): boolean {
  const uniqueQuizIds = Array.from(new Set(quizIds.filter(Boolean)));
  if (uniqueQuizIds.length === 0) return false;

  const orClauses: string[] = [];
  const orParams: string[] = [];
  if (participantName) {
    orClauses.push('participant_name = ?');
    orParams.push(participantName);
  }
  if (browserId) {
    orClauses.push('browser_id = ?');
    orParams.push(browserId);
  }
  if (ip) {
    orClauses.push('ip = ?');
    orParams.push(ip);
  }

  if (orClauses.length === 0) return false;

  const quizPlaceholders = uniqueQuizIds.map(() => '?').join(', ');
  const sql = `SELECT 1 FROM responses WHERE quiz_id IN (${quizPlaceholders}) AND (${orClauses.join(' OR ')}) LIMIT 1`;
  const row = db.prepare(sql).get(...uniqueQuizIds, ...orParams);
  return !!row;
}
