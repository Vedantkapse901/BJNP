# Vercel Deployment Guide - Full Stack on One Domain

## ✅ What's Been Done

Your project is now configured to run **both frontend AND backend** on Vercel:

1. **Frontend**: React app built with Vite → served from `/`
2. **Backend**: Node.js API → served from `/api/*`
3. **Same Domain**: `yourdomain.com/` and `yourdomain.com/api/health`

## 📁 New File Structure

```
api/
├── health.js                 (GET /api/health)
├── get-signed-url.js         (GET /api/get-signed-url)
├── download.js               (GET /api/download)
├── upload-to-b2.js           (POST /api/upload-to-b2)
└── lib/
    └── helpers.js            (Shared utilities)

vercel.json                    (Updated with API rewrites)
.env.local                     (VITE_API_URL changed to /api)
```

## 🚀 Deployment Steps

### Step 1: Verify Files Locally

```bash
# Test frontend
npm run dev

# In another terminal, the API should work at:
# http://localhost:3000/api/health
```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Add Vercel serverless API functions"
git push origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repository
4. **Settings** tab:
   - Build Command: `npm run build` ✓ (already set)
   - Output Directory: `dist` ✓ (already set)

5. **Environment Variables** tab - Add these:
   ```
   SUPABASE_URL=https://ghwmgerawbzyyzgybzwi.supabase.co
   VITE_SUPABASE_URL=https://ghwmgerawbzyyzgybzwi.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   B2_KEY_ID=26d8b01eb813
   B2_MASTER_KEY=005738025403fd5d1f20cb4cbeff63865d6b9cc7ea
   B2_BUCKET_NAME=Biyanisclasseswebsite
   B2_BUCKET_ID=b2361d486b90c15e9bd80113
   
   VITE_GEMINI_API_KEY= (leave empty if not using)
   ```

6. Click **"Deploy"**

## 🧪 Testing After Deployment

Once deployed, test these endpoints:

```bash
# Health check
curl https://yourdomain.com/api/health

# Get signed URL (for downloads)
curl "https://yourdomain.com/api/get-signed-url?path=study-materials%2FJEE%2Ffile.pdf" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Download a file
curl "https://yourdomain.com/api/download?path=study-materials%2FJEE%2Ffile.pdf"
```

## ⚙️ Environment Setup for Vercel

Copy your `.env.local` values to Vercel Environment Variables:

| Key | Value | Source |
|-----|-------|--------|
| `SUPABASE_URL` | `https://ghwmgerawbzyyzgybzwi.supabase.co` | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service key | Supabase Settings → API |
| `B2_KEY_ID` | Your B2 key | B2 Settings |
| `B2_MASTER_KEY` | Your B2 master key | B2 Settings |
| `B2_BUCKET_NAME` | Biyanisclasseswebsite | B2 Bucket |
| `B2_BUCKET_ID` | Your bucket ID | B2 Bucket |

## 📝 Important Notes

1. **No localhost references**: API now uses `/api` relative path
2. **Single domain**: Frontend and backend on same URL
3. **Serverless functions**: Each API file is an independent serverless function
4. **Cold starts**: First request might be slow (1-2 sec) due to cold start
5. **File size limits**: Vercel has 4.5MB payload limit per request (can upload larger files in chunks)

## 🔄 Local Development

For local development, everything still works the same:

```bash
npm run dev:all
# Frontend: http://localhost:3000
# API: http://localhost:3000/api/*
```

The relative path `/api` works for both local and production!

## ❌ Troubleshooting

### "Cannot find module" errors
- Run `npm install` again
- Ensure `package.json` has all dependencies

### API returning 404
- Check that all files are in `/api` folder
- Verify `vercel.json` rewrites are correct
- Check Function logs in Vercel Dashboard

### CORS errors
- Headers are already set in `helpers.js`
- Make sure requests include `Content-Type` header

### File upload fails
- Check B2 credentials in environment variables
- Verify token is valid (7 day expiry)

## 🎯 Next Steps

1. Push code to GitHub
2. Deploy to Vercel
3. Monitor logs in Vercel Dashboard
4. Share your domain: `https://yourdomain.com`

---

**Need help?** Check Vercel's documentation: https://vercel.com/docs
