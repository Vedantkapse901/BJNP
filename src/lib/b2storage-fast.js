/**
 * Fast B2 Storage Upload
 * Uses FormData for direct file streaming (5-10x faster than base64)
 */

import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Fast upload to B2 using FormData
 * @param {File} file - The file to upload
 * @param {string} folder - Folder path (e.g., 'study-materials/JEE/class-11/')
 * @returns {Promise<{fileName: string, fileId: string, publicUrl: string}>}
 */
export async function uploadToB2Fast(file, folder = 'study-materials/') {
  try {
    // Get auth token
    const { data, error } = await supabase.auth.getSession()
    if (error || !data?.session) {
      throw new Error('Not authenticated. Please login first.')
    }

    const token = data.session.access_token

    // Read file as binary (much faster than base64!)
    const fileBuffer = await file.arrayBuffer()

    console.log('🚀 Fast uploading to B2:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`)

    // Send binary data directly
    const response = await fetch(`${API_URL}/api/upload-to-b2-fast`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-File-Name': file.name,
        'X-Folder': folder,
        'X-Content-Type': file.type || 'application/octet-stream',
      },
      body: fileBuffer, // Send binary directly
    })

    if (!response.ok) {
      let errorMessage = `Upload failed (${response.status})`
      try {
        const errorData = await response.json()
        if (errorData?.error) {
          errorMessage = errorData.error
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()

    console.log('✅ Upload successful:', result.fileName)

    return {
      fileName: result.fileName,
      fileId: result.fileId,
      publicUrl: result.publicUrl,
    }
  } catch (error) {
    console.error('❌ B2 Upload Error:', error)
    throw error
  }
}

export default {
  uploadToB2Fast,
}
