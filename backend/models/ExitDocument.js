const mongoose = require('mongoose');

const ExitDocumentSchema = new mongoose.Schema({
  documentId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  employeeId: { type: String, required: true },
  documentType: { type: String, enum: ['Relieving Letter', 'Experience Letter', 'Full & Final Statement', 'No Due Certificate'], required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  version: { type: Number, default: 1 },
  generatedBy: { type: String, default: 'HR Manager' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ExitDocument', ExitDocumentSchema);
