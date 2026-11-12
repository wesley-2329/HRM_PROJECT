const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// The only file types we accept and serve. The type is decided by extension, never by what the
// uploader claims, so an uploaded .html/.svg can never run as a page on our origin.
const UPLOAD_TYPES = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};
const UPLOAD_MAX_BYTES = 4 * 1024 * 1024; // stays below Vercel's 4.5 MB body limit

const uploadFileFilter = (req, file, cb) => {
  if (UPLOAD_TYPES[path.extname(file.originalname).toLowerCase()]) return cb(null, true);
  const err = new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG and WEBP files are allowed.');
  err.status = 400;
  cb(err);
};

const setSafeHeaders = (res, name) => {
  const type = UPLOAD_TYPES[path.extname(name).toLowerCase()];
  res.set('Content-Type', type || 'application/octet-stream');
  res.set('X-Content-Type-Options', 'nosniff');
  if (!type || !type.startsWith('image/')) res.set('Content-Disposition', 'attachment');
};

// Vercel's /tmp is wiped between invocations, so every upload is also kept in MongoDB GridFS
// (same approach as the vault) and served back at its usual /uploads/<name> URL.
const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });

// Copy a multer disk file into GridFS under its public name, e.g. "resumes/resume-123.pdf"
const saveUpload = (file, name) => new Promise((resolve, reject) => {
  fs.createReadStream(file.path)
    .pipe(bucket().openUploadStream(name, { contentType: file.mimetype }))
    .on('finish', resolve)
    .on('error', reject);
});

// GET /uploads/* — used after express.static, so it only runs when the file is not on local disk
const serveUpload = async (req, res) => {
  const name = req.params[0];
  const file = mongoose.connection.readyState === 1
    ? await bucket().find({ filename: name }).sort({ uploadDate: -1 }).limit(1).next()
    : null;
  if (!file) return res.status(404).json({ message: 'File not found' });
  setSafeHeaders(res, name);
  bucket().openDownloadStream(file._id)
    .on('error', () => res.headersSent ? res.end() : res.status(404).json({ message: 'File not found' }))
    .pipe(res);
};

module.exports = { saveUpload, serveUpload, uploadFileFilter, setSafeHeaders, UPLOAD_MAX_BYTES };
