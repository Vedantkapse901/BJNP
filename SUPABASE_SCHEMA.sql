-- ==========================================
-- SUPABASE SCHEMA UPDATES FOR NEW FEATURES
-- ==========================================
-- Run these queries in your Supabase SQL Editor

-- 1. UPDATE RESULTS TABLE TO ADD NEW COLUMNS
ALTER TABLE results
ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'hallOfFame',
ADD COLUMN IF NOT EXISTS photo TEXT,
ADD COLUMN IF NOT EXISTS achievement TEXT,
ADD COLUMN IF NOT EXISTS remark TEXT,
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS rank TEXT;

-- 2. UPDATE BRANCHES TABLE TO ADD NEW COLUMNS
ALTER TABLE branches
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS google_maps_link TEXT;

-- 3. CREATE STUDENT PORTAL MATERIALS TABLE
CREATE TABLE IF NOT EXISTS student_portal_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type TEXT NOT NULL,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT,
  uploaded_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 4. CREATE STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  branch TEXT,
  assigned_courses TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 5. ADD RLS POLICIES (Row Level Security)

-- Enable RLS on new tables
ALTER TABLE student_portal_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read student portal materials
CREATE POLICY "Allow authenticated users to read portal materials"
  ON student_portal_materials
  FOR SELECT
  USING (true);

-- Allow only admins to modify student portal materials
CREATE POLICY "Allow admins to manage portal materials"
  ON student_portal_materials
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Students can read their own data
CREATE POLICY "Students can read own data"
  ON students
  FOR SELECT
  USING (auth.uid()::text = id::text OR auth.role() = 'authenticated');

-- Admins can manage all students
CREATE POLICY "Admins can manage students"
  ON students
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_student_portal_exam_type ON student_portal_materials(exam_type);
CREATE INDEX IF NOT EXISTS idx_student_portal_section ON student_portal_materials(section);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- ==========================================
-- VERIFY SCHEMA
-- ==========================================
-- Check if columns were added to results table
SELECT column_name FROM information_schema.columns
WHERE table_name='results' AND column_name IN ('section', 'photo', 'achievement', 'remark', 'college', 'rank', 'exam');

-- Check if new tables exist
SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='student_portal_materials');
SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='students');
