import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db: Database.Database | null = null;

function resolveDbPath(): string {
  const fromEnv = process.env.TELEGRAM_DB_PATH?.trim();
  if (fromEnv) return fromEnv;
  return path.join(process.cwd(), 'data', 'builder-bot.sqlite');
}

export function getSqlite(): Database.Database {
  if (db) return db;

  const dbPath = resolveDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

function migrate(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    database
      .prepare(`SELECT name FROM schema_migrations`)
      .all()
      .map((row) => String((row as { name: string }).name)),
  );

  const migrations: { name: string; sql: string }[] = [
    {
      name: '001_telegram_builder_bot',
      sql: `
        CREATE TABLE IF NOT EXISTS chats (
          chat_id INTEGER PRIMARY KEY,
          title TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS token_profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chat_id INTEGER NOT NULL,
          ticker TEXT NOT NULL,
          name TEXT NOT NULL,
          mint TEXT,
          description TEXT NOT NULL DEFAULT '',
          created_by_user_id INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'candidate'
            CHECK (status IN ('candidate', 'voting', 'trending', 'closed')),
          vote_count INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          trending_at TEXT,
          FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE,
          UNIQUE (chat_id, ticker)
        );

        CREATE INDEX IF NOT EXISTS idx_token_profiles_status
          ON token_profiles(status);
        CREATE INDEX IF NOT EXISTS idx_token_profiles_chat
          ON token_profiles(chat_id);

        CREATE TABLE IF NOT EXISTS votes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token_id INTEGER NOT NULL,
          telegram_user_id INTEGER NOT NULL,
          username TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (token_id) REFERENCES token_profiles(id) ON DELETE CASCADE,
          UNIQUE (token_id, telegram_user_id)
        );

        CREATE INDEX IF NOT EXISTS idx_votes_token ON votes(token_id);
      `,
    },
    {
      name: '002_registered_bots',
      sql: `
        CREATE TABLE IF NOT EXISTS registered_bots (
          id TEXT PRIMARY KEY,
          telegram_bot_id INTEGER NOT NULL UNIQUE,
          username TEXT NOT NULL DEFAULT '',
          first_name TEXT NOT NULL DEFAULT '',
          token TEXT NOT NULL,
          webhook_secret TEXT NOT NULL,
          label TEXT NOT NULL DEFAULT '',
          active INTEGER NOT NULL DEFAULT 1,
          webhook_url TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_registered_bots_active
          ON registered_bots(active);
      `,
    },
    {
      name: '003_token_media_socials_buys',
      sql: `
        CREATE TABLE IF NOT EXISTS announced_trades (
          tx_hash TEXT PRIMARY KEY,
          token_id INTEGER NOT NULL,
          usd_amount REAL NOT NULL,
          announced_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (token_id) REFERENCES token_profiles(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_token_profiles_mint
          ON token_profiles(mint);
        CREATE INDEX IF NOT EXISTS idx_announced_trades_token
          ON announced_trades(token_id);
      `,
    },
    {
      name: '004_token_chain',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_token_profiles_chain
          ON token_profiles(chain);
      `,
    },
    {
      name: '005_reputation_ledger',
      sql: `
        CREATE TABLE IF NOT EXISTS reputation_passports (
          wallet TEXT PRIMARY KEY,
          display_name TEXT NOT NULL DEFAULT '',
          builder_xp INTEGER NOT NULL DEFAULT 0,
          contributions_count INTEGER NOT NULL DEFAULT 0,
          level_name TEXT NOT NULL DEFAULT 'Rookie Builder',
          passport_json TEXT NOT NULL DEFAULT '{}',
          progress_json TEXT NOT NULL DEFAULT '{}',
          verified INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_reputation_xp
          ON reputation_passports(builder_xp DESC);
        CREATE INDEX IF NOT EXISTS idx_reputation_updated
          ON reputation_passports(updated_at DESC);

        CREATE TABLE IF NOT EXISTS project_upvotes (
          project_id TEXT NOT NULL,
          wallet TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          PRIMARY KEY (project_id, wallet)
        );

        CREATE INDEX IF NOT EXISTS idx_project_upvotes_project
          ON project_upvotes(project_id);
      `,
    },
    {
      name: '006_radar_and_scout',
      sql: `
        CREATE TABLE IF NOT EXISTS radar_score_snapshots (
          day_key TEXT NOT NULL,
          project_id TEXT NOT NULL,
          overall INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (day_key, project_id)
        );

        CREATE INDEX IF NOT EXISTS idx_radar_snapshots_day
          ON radar_score_snapshots(day_key);

        CREATE TABLE IF NOT EXISTS scout_submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          wallet TEXT NOT NULL,
          mission_id TEXT NOT NULL,
          project_id TEXT NOT NULL,
          analysis TEXT NOT NULL,
          evidence_url TEXT NOT NULL DEFAULT '',
          reward_xp INTEGER NOT NULL DEFAULT 0,
          early_call INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(wallet, mission_id)
        );

        CREATE INDEX IF NOT EXISTS idx_scout_submissions_created
          ON scout_submissions(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_scout_submissions_wallet
          ON scout_submissions(wallet);
        CREATE INDEX IF NOT EXISTS idx_scout_submissions_project
          ON scout_submissions(project_id);
      `,
    },
  ];

  const mark = database.prepare(
    `INSERT INTO schema_migrations (name) VALUES (?)`,
  );

  for (const m of migrations) {
    if (applied.has(m.name)) continue;
    database.exec('BEGIN');
    try {
      if (m.name === '003_token_media_socials_buys') {
        addColumnIfMissing(database, 'token_profiles', 'logo_url', 'TEXT');
        addColumnIfMissing(database, 'token_profiles', 'banner_url', 'TEXT');
        addColumnIfMissing(database, 'token_profiles', 'website', 'TEXT');
        addColumnIfMissing(database, 'token_profiles', 'twitter', 'TEXT');
        addColumnIfMissing(database, 'token_profiles', 'telegram_url', 'TEXT');
        addColumnIfMissing(database, 'token_profiles', 'discord', 'TEXT');
        addColumnIfMissing(
          database,
          'token_profiles',
          'big_buy_usd',
          'REAL NOT NULL DEFAULT 1000',
        );
        addColumnIfMissing(
          database,
          'token_profiles',
          'serving_bot_key',
          "TEXT NOT NULL DEFAULT 'platform'",
        );
        addColumnIfMissing(
          database,
          'chats',
          'serving_bot_key',
          "TEXT NOT NULL DEFAULT 'platform'",
        );
      }
      if (m.name === '004_token_chain') {
        addColumnIfMissing(
          database,
          'token_profiles',
          'chain',
          "TEXT NOT NULL DEFAULT 'solana'",
        );
      }
      database.exec(m.sql);
      mark.run(m.name);
      database.exec('COMMIT');
      console.log(`[sqlite] applied migration ${m.name}`);
    } catch (err) {
      database.exec('ROLLBACK');
      throw err;
    }
  }
}

function addColumnIfMissing(
  database: Database.Database,
  table: string,
  column: string,
  typeSql: string,
): void {
  const cols = database.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  if (cols.some((c) => c.name === column)) return;
  database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeSql}`);
}

export function closeSqlite(): void {
  if (db) {
    db.close();
    db = null;
  }
}
