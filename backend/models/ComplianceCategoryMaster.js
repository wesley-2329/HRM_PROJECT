const mongoose = require('mongoose');

const ComplianceCategoryMasterSchema = new mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  categoryCode: { type: String, required: true },
  categoryName: { type: String, required: true }, // Social Security, State Tax, Employee Welfare, Safety & Health
  description: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ComplianceCategoryMaster', ComplianceCategoryMasterSchema);
