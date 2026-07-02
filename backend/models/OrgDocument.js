const mongoose = require('mongoose');

const OrgDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['SOP', 'Policy', 'Chart', 'Compliance', 'Department'],
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  uploadedBy: {
    type: String,
    required: true
  },
  versions: [{
    version: { type: Number },
    filePath: { type: String },
    changeSummary: { type: String },
    uploadedBy: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('OrgDocument', OrgDocumentSchema);
