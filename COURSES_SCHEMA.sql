-- Migration: Add courses management columns to courses table
-- This script adds all necessary columns for the courses marketplace system

-- Add new columns to courses table
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS exam_type TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS subject TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS instructor TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS demo_video_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS what_you_learn TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS display_position TEXT DEFAULT 'Regular',
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 99,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty_level ON courses(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_courses_display_order ON courses(display_order);
CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating);

-- Update RLS policy to allow authenticated users to manage courses
DROP POLICY IF EXISTS "Allow authenticated users to read courses" ON courses;
DROP POLICY IF EXISTS "Allow authenticated users to insert courses" ON courses;
DROP POLICY IF EXISTS "Allow authenticated users to update courses" ON courses;
DROP POLICY IF EXISTS "Allow authenticated users to delete courses" ON courses;

CREATE POLICY "Allow authenticated users to read courses"
  ON courses FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert courses"
  ON courses FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update courses"
  ON courses FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete courses"
  ON courses FOR DELETE
  USING (auth.role() = 'authenticated');
