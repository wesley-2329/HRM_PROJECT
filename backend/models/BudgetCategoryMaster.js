const mongoose = require('mongoose');

const BudgetCategoryMasterSchema = new mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  categoryCode: { type: String, required: true },
  categoryName: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' },
  createdBy: { type: String, default: 'System' },
  updatedBy: { type: String, default: 'System' }
}, { timestamps: true });

module.exports = mongoose.model('BudgetCategoryMaster', BudgetCategoryMasterSchema);
