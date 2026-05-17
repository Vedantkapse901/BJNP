# B2 Cloud Storage Setup for Study Materials

## Overview
Study materials (PDFs) are automatically uploaded to B2 Cloud Storage when admins add them via the admin panel. No manual upload needed!

## Setup Steps

### 1. Create B2 Account (if you don't have one)
- Go to https://www.backblaze.com/b2/cloud-storage.html
- Sign up for free account (10 GB free per month)
- Confirm email

### 2. Create B2 Bucket
1. Login to B2 console
2. Click **"Create a Bucket"**
3. Enter bucket name: `study-materials` (or your preference)
4. Choose **Public** for file access type (so students can download)
5. Click **"Create Bucket"**

### 3. Get B2 API Credentials
1. In B2 console, go to **Account → Application Keys**
2. Click **"Create Application Key"**
3. Settings:
   - Name: `Biyanis App Key`
   - Allow access to: Select your bucket
   - Type: `Master key` or `Restricted key` (restricted is safer)
4. Copy these values:
   - **Application Key ID** (looks like: `001234567890abc`)
   - **Application Key** (looks like: `K001abc123...`)

### 4. Configure Supabase Storage to Use B2

In your Supabase project:

**Option A: Using Supabase Storage with B2 Backend** (Recommended)
1. Go to Supabase console
2. Go to **Storage** section
3. Create new bucket: `study-materials`
4. In bucket settings, configure B2 as backend:
   - Account ID: Your B2 account ID
   - Application Key: From step 3
   - Bucket name: `study-materials`

**Option B: Using B2 Directly** (Advanced)
Update `useSupabaseStorage()` in your code to use B2 API directly instead of Supabase storage.

### 5. Set Up CORS (if needed)
If students get CORS errors downloading from B2:
1. In B2 bucket settings
2. Add CORS rule:
```json
{
  "corsRules": [
    {
      "allowedHeaders": ["*"],
      "allowedOperations": ["b2_download_file_by_id", "b2_get_file_info"],
      "allowedOrigins": ["https://yourdomain.com"],
      "exposeHeaders": ["x-bz-content-sha1"],
      "maxAgeSeconds": 3600
    }
  ]
}
```

## How It Works Now

### When Admin Uploads Material:

1. **Admin selects course & class**
   ```
   Course: JEE
   Class: 11th
   ```

2. **Admin uploads PDF**
   - Clicks "Upload to B2" button
   - File automatically uploads to B2

3. **B2 path created automatically:**
   ```
   study-materials/JEE/class-11/1234567890_physics_notes.pdf
   ```

4. **B2 returns public URL:**
   ```
   https://f001.backblazeb2.com/file/study-materials/JEE/class-11/1234567890_physics_notes.pdf
   ```

5. **URL saved to database**
   - Database stores B2 public URL
   - URL is permanent (not temporary!)

6. **Student downloads**
   - Student logs in
   - Sees materials for their course/class
   - Clicks download → downloads directly from B2
   - Works forever (B2 URL never expires)

## Folder Structure in B2

After uploading materials, your B2 bucket will look like:

```
study-materials/
├── JEE/
│   ├── class-11/
│   │   ├── 1715556000_physics_chapter1.pdf
│   │   ├── 1715556100_chemistry_chapter1.pdf
│   │   └── 1715556200_math_chapter1.pdf
│   └── class-12/
│       ├── 1715556300_physics_chapter2.pdf
│       └── 1715556400_chemistry_chapter2.pdf
├── NEET/
│   ├── class-11/
│   │   └── 1715556500_biology_notes.pdf
│   └── class-12/
│       └── 1715556600_biology_advanced.pdf
└── MHT-CET/
    ├── class-11/
    │   └── 1715556700_mhtcet_physics.pdf
    └── class-12/
        └── 1715556800_mhtcet_chemistry.pdf
```

## Monitoring & Management

### View B2 Storage Usage
1. B2 console → Dashboard
2. Shows:
   - Storage used (GB)
   - Files uploaded
   - Download bandwidth

### Delete Old Materials
1. Go to admin panel → Study Materials
2. Select course/class
3. Click trash icon next to material
4. Automatically deleted from both database AND B2

### Cost Estimate
- 10 GB storage (B2): Free
- 100 GB downloads (B2): Free per month
- Typical student portal: < 1 GB storage, < 10 GB downloads monthly = **FREE**

## Troubleshooting

### Upload shows error
- Check internet connection
- Verify B2 bucket name in code
- Check B2 API credentials are correct
- Check file is valid PDF

### Students can't download
- Verify B2 bucket is set to **Public**
- Check CORS settings
- Verify URL in database is complete

### Files not appearing in B2
- Check B2 console directly
- Verify bucket name matches code
- Wait a few seconds (B2 has slight delay)

## Code Integration

The upload happens automatically here:
```javascript
// File: src/components/StudyMaterialsManagement.jsx
// Function: handleAddMaterial()
// Line: ~50-90

// Process:
1. Admin clicks "Upload to B2"
2. generateB2Path() creates path
3. uploadFile() sends to B2
4. uploadResult.url returned
5. URL saved to database
6. Material appears in list
```

## Security Notes

⚠️ **Important:**
- B2 bucket is **PUBLIC** (for student downloads)
- Material URLs are predictable but require knowing exact path
- Consider adding authentication if needed (future feature)
- Monitor B2 bandwidth to prevent unauthorized access

## Cost Saving Tips

1. **Compress PDFs** before uploading (reduces storage)
2. **Delete old versions** when updating materials
3. **Share common materials** across classes when possible
4. Monitor B2 dashboard monthly for usage spikes

## Support

- B2 Documentation: https://www.backblaze.com/b2/docs/
- Upload issues: Check B2 bucket settings
- Download issues: Check CORS and bucket permissions
