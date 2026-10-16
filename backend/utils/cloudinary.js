const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary with environment variables or fallback credentials provided
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'puunyxrp',
  api_key: process.env.CLOUDINARY_API_KEY || '457413265115121',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'N8qrXc5vQIpWlrwdH5a1khUGaFY',
  secure: true
});

/**
 * Upload an image file from local path to Cloudinary
 * @param {string} filePath - Absolute or relative path to uploaded temp file
 * @param {string} [publicId] - Optional custom public ID
 * @returns {Promise<{url: string, secure_url: string, public_id: string}|null>}
 */
const uploadToCloudinary = async (filePath, publicId) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      console.warn('[Cloudinary] Source file does not exist:', filePath);
      return null;
    }

    const options = {
      folder: 'hrorbit_avatars',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    };

    if (publicId) {
      options.public_id = publicId;
      options.overwrite = true;
    }

    const result = await cloudinary.uploader.upload(filePath, options);

    // Clean up temporary local file after successful upload to prevent disk bloat
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.warn('[Cloudinary] Temp file cleanup notice:', cleanupErr.message);
    }

    return result;
  } catch (error) {
    console.error('[Cloudinary Upload Error]', error.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary
};
