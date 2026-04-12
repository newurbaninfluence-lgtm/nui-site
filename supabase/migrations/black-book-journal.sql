-- black-book-journal.sql
-- Tables for The Black Book creative journal PWA

-- ── Journal entries ──
CREATE TABLE IF NOT EXISTS journal_entries (
  id            bigserial PRIMARY KEY,
  date          date NOT NULL DEFAULT CURRENT_DATE,
  text          text NOT NULL,
  tags          text[] DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS journal_entries_date_idx ON journal_entries(date DESC);

-- ── Sketches (stored as base64 data URLs) ──
CREATE TABLE IF NOT EXISTS journal_sketches (
  id            bigserial PRIMARY KEY,
  name          text DEFAULT 'Untitled',
  data_url      text NOT NULL,
  created_at    timestamptz DEFAULT now()
);

-- ── Mood board items ──
CREATE TABLE IF NOT EXISTS journal_boards (
  id            bigserial PRIMARY KEY,
  name          text DEFAULT 'Untitled Board',
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journal_board_items (
  id            bigserial PRIMARY KEY,
  board_id      bigint REFERENCES journal_boards(id) ON DELETE CASCADE,
  src           text NOT NULL,
  x             real DEFAULT 50,
  y             real DEFAULT 50,
  w             real DEFAULT 200,
  h             real DEFAULT 200,
  label         text,
  created_at    timestamptz DEFAULT now()
);

-- ── Client notes ──
CREATE TABLE IF NOT EXISTS journal_client_notes (
  id            bigserial PRIMARY KEY,
  client        text NOT NULL,
  text          text NOT NULL,
  created_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS journal_client_notes_client_idx ON journal_client_notes(client);

-- ── RLS: service role only for now ──
ALTER TABLE journal_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_sketches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_boards       ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_board_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_full" ON journal_entries      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_full" ON journal_sketches     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_full" ON journal_boards       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_full" ON journal_board_items  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_full" ON journal_client_notes FOR ALL USING (true) WITH CHECK (true);
