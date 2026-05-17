-- =====================
-- ATTENDANCE TABLE
-- =====================
CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late', 'excused')) NOT NULL DEFAULT 'absent',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, attendance_date)
);

-- =====================
-- ATTENDANCE SHEET (For bulk marking)
-- =====================
CREATE TABLE IF NOT EXISTS attendance_sheets (
  id BIGSERIAL PRIMARY KEY,
  sheet_date DATE NOT NULL UNIQUE,
  exam_type VARCHAR(50) CHECK (exam_type IN ('JEE', 'NEET', 'MHT-CET')),
  class_level VARCHAR(20),
  marked_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_sheets_date ON attendance_sheets(sheet_date);
