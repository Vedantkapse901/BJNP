import {
  authorizeB2,
  b2ApiCall,
  B2_BUCKET_ID,
  B2_BUCKET_NAME,
  setCorsHeaders
} from './lib/helpers.js';

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

    console.log('🔑 Generating signed URL for:', filePath);

    // Authorize with B2
    const auth = await authorizeB2();

    // Generate signed authorization URL valid for 7 days (604800 seconds)
    const validDurationSeconds = 7 * 24 * 60 * 60; // 7 days

    const signedUrlData = await b2ApiCall('POST', 'b2_get_download_authorization', auth, {
      bucketId: B2_BUCKET_ID,
      fileNamePrefix: filePath,
      validDurationInSeconds: validDurationSeconds,
    });

    // Construct signed URL with authorization
    const signedUrl = `${auth.downloadUrl}/file/${encodeURIComponent(B2_BUCKET_NAME)}/${encodeURIComponent(filePath)}?Authorization=${encodeURIComponent(signedUrlData.authorizationToken)}`;

    console.log('✓ Signed URL generated successfully');

    res.json({
      success: true,
      signedUrl,
      expiresIn: validDurationSeconds,
      fileName: filePath.split('/').pop(),
    });
  } catch (error) {
    console.error('❌ Signed URL generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate signed URL' });
  }
}
