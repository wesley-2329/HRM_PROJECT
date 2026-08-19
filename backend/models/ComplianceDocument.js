const mongoose = require('mongoose');

const ComplianceDocumentSchema = new mongoose.Schema({
  docId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['Challan Receipt', 'Return Receipt', 'Registration Certificate', 'Labour License', 'Government Notice', 'Inspection Report', 'Compliance Certificate'], required: true },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: String, default: 'Compliance Officer' },
  version: { type: Number, default: 1 },
  expiryDate: { type: Date },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ComplianceDocument', ComplianceDocumentSchema);
