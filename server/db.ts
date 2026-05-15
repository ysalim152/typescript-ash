import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

export interface DatabaseSchema {
  users: {
    id: number;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    created_at: string;
    updated_at: string;
  };
  activities: {
    id: number;
    name: string;
    description: string | null;
    image_url: string | null;
    color: string;
    created_at: string;
    updated_at: string;
  };
  sessions: {
    id: number;
    activity_id: number;
    coach_id: number | null;
    title: string;
    description: string | null;
    session_date: string;
    duration_minutes: number | null;
    location: string | null;
    max_participants: number | null;
    created_at: string;
    updated_at: string;
  };
  session_registrations: {
    id: number;
    session_id: number;
    user_id: number;
    status: string;
    registered_at: string;
  };
  contacts: {
    id: number;
    name: string;
    email: string;
    message: string;
    created_at: string;
  };
}

const sqliteDb = new Database(path.join(dataDir, 'database.sqlite'));
sqliteDb.pragma('journal_mode = wal');

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({ database: sqliteDb }),
  log: ['query', 'error']
});
