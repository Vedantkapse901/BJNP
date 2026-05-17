# Student Portal Database Schema

## Tables Required

### 1. students
```sql
CREATE TABLE students (
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
```

### 2. study_materials (Updated)
```sql
CREATE TABLE study_materials (
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
```

## Course-Class Combinations (6 Total)
1. JEE - 11th (course: 'JEE', class_level: 11)
2. JEE - 12th (course: 'JEE', class_level: 12)
3. NEET - 11th (course: 'NEET', class_level: 11)
4. NEET - 12th (course: 'NEET', class_level: 12)
5. MHT-CET - 11th (course: 'MHT-CET', class_level: 11)
6. MHT-CET - 12th (course: 'MHT-CET', class_level: 12)

## Data Flow
1. Admin uploads PDF via admin panel, selects course and class level
2. Student logs in with username/password
3. System retrieves student's course and class level from DB
4. System filters study_materials by student's course and class level
5. Student sees only their relevant materials
