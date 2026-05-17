import { B2_BUCKET_NAME, setCorsHeaders } from './lib/helpers.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    console.log('📥 Downloading from B2:', filePath);

    // Construct direct B2 public URL (bucket is public, no auth needed!)
    const fileUrl = `https://f005.backblazeb2.com/file/${B2_BUCKET_NAME}/${filePath}`;

    console.log('🔗 B2 URL:', fileUrl);

    // Fetch file from B2 (no authorization needed for public buckets)
    const fileResponse = await fetch(fileUrl);

    if (!fileResponse.ok) {
      console.error(`❌ B2 returned ${fileResponse.status}`);
      return res.status(fileResponse.status).json({ error: 'File not found' });
    }

    // Get file info
    const contentType = fileResponse.headers.get('content-type') || 'application/pdf';
    const contentLength = fileResponse.headers.get('content-length');

    // Set download headers
    const fileName = filePath.split('/').pop(); // Get filename from path
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    console.log('✅ Sending file:', fileName);

    // Stream the file
    const buffer = await fileResponse.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ error: error.message || 'Download failed' });
  }
}
