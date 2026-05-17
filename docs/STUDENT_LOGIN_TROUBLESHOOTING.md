# Student Login Troubleshooting Guide

## Problem: "Invalid credentials" error when logging in

### Step 1: Check Browser Console (F12)

Open browser → Press **F12** → Click **Console** tab

Look for these messages:

**If you see:** ✅
```
📚 Available students: [Array(1)]
Number of students: 1
🔍 Login attempt: {username: "demo"}
📚 Searching in students: [Array(1)]
✅ Login successful!
```
→ Login should work! Try again.

**If you see:** ❌
```
⚠️ No students found! Check if database migration was run.
Number of students: 0
```
→ **Database migration not run yet!** (See Step 2 below)

**If you see:** ❌
```
❌ No match found!
Available usernames: []
No students in database! Run migration first.
```
→ **Students table is empty!** (See Step 2 below)

---

### Step 2: Run Database Migration

1. Go to Supabase Console → **SQL Editor**
2. Click **New Query**
3. Paste this SQL:

```sql
-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  course VARCHAR(50) NOT NULL,
  class_level INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create demo account
INSERT INTO students (username, password, name, email, course, class_level)
VALUES ('demo', 'demo123', 'Demo Student', 'demo@example.com', 'JEE', 11)
ON CONFLICT (username) DO NOTHING;

-- Create more test accounts (optional)
INSERT INTO students (username, password, name, email, course, class_level) VALUES
('neet_student', 'password123', 'Neet Student', 'neet@example.com', 'NEET', 12),
('mht_student', 'password123', 'MHT Student', 'mht@example.com', 'MHT-CET', 11)
ON CONFLICT (username) DO NOTHING;
```

4. Click **Run**
5. You should see: `✅ Success. No rows returned.`

---

### Step 3: Verify Data Was Inserted

Still in SQL Editor, run this query:

```sql
SELECT username, course, class_level FROM students;
```

You should see:
```
| username      | course   | class_level |
|---------------|----------|-------------|
| demo          | JEE      | 11          |
| neet_student  | NEET     | 12          |
| mht_student   | MHT-CET  | 11          |
```

---

### Step 4: Reload App & Try Login

1. Close browser dev tools (F12)
2. **Hard refresh** page: Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
3. Go to `/student-login`
4. Enter: 
   - Username: `demo`
   - Password: `demo123`
5. Click **Login**

---

## If Still Not Working

### Check 1: App.jsx is loading students

Open browser console, you should see:
```
✅ Data loaded from Supabase successfully
```

If you see:
```
⚠️ Using fallback data. Supabase connection not available.
```

→ **Supabase not connected!** Check your Supabase credentials.

---

### Check 2: AdminPanel can see students

1. Go to `/admin`
2. Login with admin credentials
3. Click **"Manage Students"** tab
4. You should see your demo account listed

If not listed → Migration didn't work

---

### Check 3: Verify students table exists

In Supabase console → **Table Editor**

You should see:
- `students` table in the left sidebar
- Table should have rows with your demo account

If table doesn't exist → Run migration again

---

## Common Issues & Solutions

### Issue: "Database connection error"
**Solution:** 
- Check Supabase URL and key are correct in code
- Check internet connection
- Verify Supabase project is active

### Issue: Username exists but still "Invalid credentials"
**Solution:**
- Check password is EXACTLY correct (case-sensitive)
- Check for extra spaces: `demo ` vs `demo`
- Verify in database: 
  ```sql
  SELECT username, password FROM students WHERE username = 'demo';
  ```

### Issue: Can create students in admin but can't login
**Solution:**
- Hard refresh browser (Ctrl+Shift+R)
- Wait 2-3 seconds for AppContext to load
- Check browser console for errors
- Try different username/password

### Issue: Multiple students in database, only one can login
**Solution:**
- Check that each has unique username
- Check passwords are stored correctly
- Verify course and class_level are valid

---

## Quick Test Checklist

- [ ] Ran SQL migration
- [ ] students table exists in Supabase
- [ ] demo account is in students table
- [ ] App.jsx shows "Data loaded from Supabase"
- [ ] StudentLogin console shows "Available students: [Array]"
- [ ] Can login with demo / demo123
- [ ] Redirected to /student-portal
- [ ] See student name and course info

---

## Login Credentials for Testing

| Username | Password | Course | Class |
|----------|----------|--------|-------|
| demo | demo123 | JEE | 11 |
| neet_student | password123 | NEET | 12 |
| mht_student | password123 | MHT-CET | 11 |

(Insert these via migration SQL above)

---

## Next Step: Upload Materials

After login works, you can:
1. Go to `/admin`
2. Click **Study Materials** tab
3. Select course/class matching a student
4. Upload PDF
5. Login as that student
6. See the PDF in dashboard

---

## Still Stuck?

Check these in order:
1. Browser console (F12) → Console tab
2. Supabase console → Table Editor
3. Supabase console → SQL Editor (run test query)
4. Network tab (F12) → check API calls to Supabase

The debug messages will tell you exactly what's wrong!
