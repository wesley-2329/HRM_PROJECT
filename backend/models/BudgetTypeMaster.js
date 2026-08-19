const mongoose = require('mongoose');

const BudgetTypeMasterSchema = new mongoose.Schema({
  typeId: { type: String, required: true, unique: true },
  typeCode: { type: String, required: true },
  typeName: { type: String, required: true }, // e.g. Operational, Capital, Strategic, Project
  description: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' },
  createdBy: { type: String, default: 'System' }
}, { timestamps: true });

module.exports = mongoose.model('BudgetTypeMaster', BudgetTypeMasterSchema);
