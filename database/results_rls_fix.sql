-- Fix: admin can add/edit/delete results (Hall of Fame) after Supabase Auth login
-- Run once in Supabase SQL Editor

-- Allow authenticated admins via profiles (matches AdminPanel login)
DROP POLICY IF EXISTS "Only admins can manage results" ON results;

CREATE POLICY "Authenticated admins manage results"
ON results
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND COALESCE(p.is_active, true) = true
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND COALESCE(p.is_active, true) = true
  )
  OR EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'admin'
  )
);

-- Ensure columns used by Results admin exist
ALTER TABLE results
  ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'hallOfFame',
  ADD COLUMN IF NOT EXISTS photo TEXT,
  ADD COLUMN IF NOT EXISTS achievement TEXT,
  ADD COLUMN IF NOT EXISTS remark TEXT,
  ADD COLUMN IF NOT EXISTS college TEXT,
  ADD COLUMN IF NOT EXISTS rank TEXT,
  ADD COLUMN IF NOT EXISTS exam TEXT;

-- Link logged-in auth user to users table (legacy RLS on other tables)
INSERT INTO public.users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email IN ('admin@biyanis.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
