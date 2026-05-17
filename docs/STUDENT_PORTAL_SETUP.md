# Student Portal Setup Guide

## Overview
The student portal allows students to log in with username/password and view study materials specific to their course (JEE/NEET/MHT-CET) and class level (11th/12th).

## Database Setup

### 1. Create `students` Table

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

### 2. Create `study_materials` Table

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

## Features

### Student Login (`/student-login`)
- Students enter username and password
- Credentials validated against `students` table
- Successful login stores student info in sessionStorage
- Redirects to `/student-portal`

### Student Portal (`/student-portal`)
- Displays student name and course info
- Shows course-specific emojis (📐 for JEE, 🔬 for NEET, 📊 for MHT-CET)
- Displays all study materials filtered by:
  - Student's course
  - Student's class level
- Each material shows:
  - Title
  - File size (MB)
  - Download button
- Logout button to clear session and return to login

### Admin Panel Study Materials Section
- Course and class level selector
- Upload PDF materials
- View uploaded materials
- Delete materials
- Display materials in grid format
- Preview PDF links

## Data Flow

1. **Admin uploads materials** → Stored in `study_materials` table with course and class_level
2. **Student logs in** → Credentials validated against `students` table
3. **Student info stored** → sessionStorage contains student's course and class_level
4. **Materials filtered** → App fetches materials matching student's course and class
5. **Student sees materials** → StudentDashboard displays filtered PDFs

## Course-Class Combinations

The system supports 6 combinations:

| Course | 11th | 12th |
|--------|------|------|
| JEE | ✓ | ✓ |
| NEET | ✓ | ✓ |
| MHT-CET | ✓ | ✓ |

## File Upload Handling

**Current Implementation:**
- Uses browser Blob URLs (temporary)
- PDFs stored locally during session

**Production Implementation Needed:**
- Integrate with B2 Cloud Storage (similar to slides)
- Upload function should be added to StudyMaterialsManagement.jsx
- Store public URL in database

## Security Notes

⚠️ **Current Implementation:**
- Passwords stored as plain text (for development)
- Session-based authentication only (no persistent login)

**Production Implementation Should:**
- Hash passwords using bcrypt
- Implement secure session tokens
- Add Row Level Security (RLS) policies
- Use HTTPS for all connections

## Testing Checklist

- [ ] Create test student account in `students` table
- [ ] Upload sample PDFs in admin panel
- [ ] Login with student credentials
- [ ] Verify materials appear correctly
- [ ] Test logout functionality
- [ ] Verify other students can't access different course materials
- [ ] Test with different course and class combinations

## File References

- **Frontend:**
  - `/src/pages/StudentLogin.jsx` - Login form
  - `/src/pages/StudentPortal.jsx` - Portal wrapper
  - `/src/components/StudentDashboard.jsx` - Main dashboard UI

- **Admin:**
  - `/src/components/AdminPanel.supabase.jsx` - Admin panel integration
  - `/src/components/StudyMaterialsManagement.jsx` - Admin materials upload UI

- **Hooks:**
  - `/src/hooks/useSupabaseData.js` - `useStudyMaterials()` and `useStudents()`

- **Routing:**
  - `/src/components/AnimatedRoutes.jsx` - Routes for `/student-login` and `/student-portal`

## Next Steps

1. Execute SQL migrations to create tables
2. Create test student accounts in admin panel
3. Upload sample PDFs via admin Study Materials section
4. Test student login flow
5. Implement B2 Cloud Storage integration for PDF uploads
6. Add password hashing and session security
