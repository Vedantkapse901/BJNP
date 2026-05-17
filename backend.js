import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const app = express();
const PORT = 5174; // Backend on different port, Vite proxies to it

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// B2 API Configuration
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;
const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_MASTER_KEY = process.env.B2_MASTER_KEY;
const B2_BUCKET_ID = process.env.B2_BUCKET_ID;

let b2AuthToken = null;
let b2ApiUrl = null;
let b2DownloadUrl = null;

// Initialize B2 Authorization
async function initializeB2() {
  return new Promise(async (resolve, reject) => {
    try {
      const auth = Buffer.from(`${B2_KEY_ID}:${B2_MASTER_KEY}`).toString('base64');
      const response = await fetch('https://api001.backblazeb2.com/b2api/v2/b2_authorize_account', {
        headers: { Authorization: `Basic ${auth}` },
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'B2 authorization failed');
      }

      b2AuthToken = data.authorizationToken;
      b2ApiUrl = data.apiUrl;
      b2DownloadUrl = data.downloadUrl;

      console.log('✅ B2 Authorization successful');
      resolve();
    } catch (error) {
      console.error('❌ B2 Authorization failed:', error);
      reject(error);
    }
  });
}

// Upload to B2
app.post('/api/upload-to-b2', async (req, res) => {
  try {
    const { file, folder, fileName, contentType } = req.body;

    if (!file || !fileName) {
      return res.status(400).json({ error: 'Missing file or fileName' });
    }

    if (!b2AuthToken) {
      await initializeB2();
    }

    // Step 1: Get upload URL
    const getUrlResponse = await fetch(`${b2ApiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        Authorization: b2AuthToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bucketId: B2_BUCKET_ID }),
    });

    const urlData = await getUrlResponse.json();
    const uploadUrl = urlData.uploadUrl;
    const uploadAuthToken = urlData.authorizationToken;

    // Step 2: Upload file
    const fileBuffer = Buffer.from(file, 'base64');
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: uploadAuthToken,
        'X-Bz-File-Name': `${folder}${fileName}`,
        'Content-Type': contentType || 'application/octet-stream',
        'X-Bz-Content-Sha1': 'do_not_verify',
      },
      body: fileBuffer,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(uploadData.error || 'Upload failed');
    }

    // Return proxy URL (use backend to avoid CORS issues)
    const b2Url = `${b2DownloadUrl}/file/${B2_BUCKET_NAME}/${uploadData.fileName}`;
    const proxyUrl = `/api/download?path=${encodeURIComponent(uploadData.fileName)}`;

    res.json({
      success: true,
      fileName: uploadData.fileName,
      fileId: uploadData.fileId,
      contentSha1: uploadData.contentSha1,
      downloadUrl: proxyUrl,
      publicUrl: proxyUrl,
      b2Url: b2Url, // Include direct B2 URL for reference
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download proxy (if needed)
app.get('/api/download', async (req, res) => {
  try {
    const { path } = req.query;
    if (!path) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    // Ensure B2 is initialized
    if (!b2AuthToken) {
      await initializeB2();
    }

    const fileUrl = `${b2DownloadUrl}/file/${B2_BUCKET_NAME}/${path}`;
    const response = await fetch(fileUrl, {
      headers: {
        'Authorization': b2AuthToken,
      },
    });

    if (!response.ok) {
      console.error(`Download failed: ${response.status}`, await response.text());
      return res.status(response.status).json({ error: `File not found (${response.status})` });
    }

    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(await response.buffer());
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend server running on port 5174' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  try {
    await initializeB2();
    console.log('✅ B2 initialized and ready for uploads/downloads');
  } catch (error) {
    console.error('❌ Failed to initialize B2:', error);
  }
});
