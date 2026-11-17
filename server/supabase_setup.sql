-- ═══════════════════════════════════════════════════════════════════════════
--  GeoPress – Supabase Schema Setup
--  Run this entire script in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Users table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  firstname     TEXT        NOT NULL,
  lastname      TEXT        NOT NULL,
  email         TEXT        UNIQUE NOT NULL,
  password      TEXT        NOT NULL,
  gender        TEXT        DEFAULT 'Other'
                            CHECK (gender IN ('Male', 'Female', 'Other')),
  city          TEXT        NOT NULL,
  profile_image TEXT        DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Auto-update updated_at on row change ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON public.users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. Enable Row Level Security ──────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow the service-role key (used by the backend) full access
-- Users cannot access the table directly from the client SDK
DROP POLICY IF EXISTS "Service role full access" ON public.users;
CREATE POLICY "Service role full access"
  ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── 4. Storage bucket for profile images ─────────────────────────────────────
-- Creates a public 'avatars' bucket (images are readable by anyone via URL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow the backend (service role) to upload files
DROP POLICY IF EXISTS "Service role upload avatars" ON storage.objects;
CREATE POLICY "Service role upload avatars"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'avatars');

-- Allow public read of avatars
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- ── Done ──────────────────────────────────────────────────────────────────────
-- After running this, copy your project's URL and service_role key into server/.env
