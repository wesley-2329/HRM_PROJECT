const fs = require('fs');
const mongoose = require('mongoose');

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
  res.set('Content-Type', file.contentType || 'application/octet-stream');
  bucket().openDownloadStream(file._id)
    .on('error', () => res.headersSent ? res.end() : res.status(404).json({ message: 'File not found' }))
    .pipe(res);
};

module.exports = { saveUpload, serveUpload };
