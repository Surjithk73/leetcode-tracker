-- ============================================================
-- Phase 9 Migration: Pre-Assigned Questions, Snippets & Flashcards
-- Run this in Supabase SQL Editor to update your existing database
-- ============================================================

-- Add new columns to questions table
ALTER TABLE questions 
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS flashcard_touch integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS flashcard_next_review date;

-- Create snippets table
CREATE TABLE IF NOT EXISTS snippets (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title              text NOT NULL,
  content_markdown   text NOT NULL DEFAULT '',
  created_at         timestamptz DEFAULT now(),
  touch_number       integer NOT NULL DEFAULT 1 CHECK (touch_number IN (1, 2, 3)),
  next_review_date   date
);

-- Enable RLS on snippets
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

-- Create policy for snippets
CREATE POLICY "allow all snippets" ON snippets FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Done! Your database is now ready for Phase 9 features.
-- ============================================================
