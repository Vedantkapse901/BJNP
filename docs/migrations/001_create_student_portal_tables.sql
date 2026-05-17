-- Migration: Create Student Portal Tables
-- Description: Creates students and study_materials tables for the student portal feature
-- Date: 2026-05-12

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  course VARCHAR(50) NOT NULL, -- 'JEE', 'NEET', 'MHT-CET'
  class_level INTEGER NOT NULL, -- 11 or 12
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create study_materials table
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  course VARCHAR(50) NOT NULL, -- 'JEE', 'NEET', 'MHT-CET'
  class_level INTEGER NOT NULL, -- 11 or 12
  pdf_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_students_username ON students(username);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_study_materials_course_class ON study_materials(course, class_level);

-- Sample data (optional - for testing)
-- Insert test student
INSERT INTO students (username, password, name, email, course, class_level)
VALUES
  ('demo', 'demo123', 'Demo Student', 'demo@example.com', 'JEE', 11)
ON CONFLICT (username) DO NOTHING;

-- Insert sample study materials
INSERT INTO study_materials (title, course, class_level, pdf_url, file_size, display_order)
VALUES
  ('Physics Chapter 1', 'JEE', 11, 'https://example.com/physics1.pdf', 2500000, 0),
  ('Chemistry Chapter 1', 'JEE', 11, 'https://example.com/chemistry1.pdf', 3000000, 1),
  ('Biology Chapter 1', 'NEET', 11, 'https://example.com/biology1.pdf', 2800000, 0),
  ('MHT-CET Physics', 'MHT-CET', 12, 'https://example.com/mhtcet_physics.pdf', 4000000, 0)
ON CONFLICT DO NOTHING;
