const mongoose = require('mongoose');

const StatutoryDocumentCategoryMasterSchema = new mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  categoryName: { type: String, required: true }, // Challans, Returns, Registration Certificates, Labour Licenses, Notices, Inspection Reports
  description: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('StatutoryDocumentCategoryMaster', StatutoryDocumentCategoryMasterSchema);
