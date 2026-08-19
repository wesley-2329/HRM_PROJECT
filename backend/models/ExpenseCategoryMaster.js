const mongoose = require('mongoose');

const ExpenseCategoryMasterSchema = new mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  categoryName: { type: String, required: true },
  moduleScope: { type: String, default: 'General HR' }, // Payroll, Welfare, Recruitment, Training, Overtime
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ExpenseCategoryMaster', ExpenseCategoryMasterSchema);
