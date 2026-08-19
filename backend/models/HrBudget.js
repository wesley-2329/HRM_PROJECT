const mongoose = require('mongoose');

const HrBudgetSchema = new mongoose.Schema({
  budgetId: { type: String, required: true, unique: true },
  financialYear: { type: String, required: true },
  company: { type: String, default: 'Enterprise Corp' },
  businessUnit: { type: String, default: 'Global HR' },
  branch: { type: String, default: 'HQ Bangalore' },
  department: { type: String, required: true },
  costCenter: { type: String, required: true },
  budgetCategory: { type: String, required: true }, // Manpower, Recruitment, Welfare, Training, Operations
  budgetType: { type: String, default: 'Operational' },
  proposedBudget: { type: Number, required: true, default: 0 },
  approvedBudget: { type: Number, default: 0 },
  forecastBudget: { type: Number, default: 0 },
  utilizedBudget: { type: Number, default: 0 },
  remainingBudget: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Submitted', 'Department Review', 'HR Review', 'Finance Review', 'Approved', 'Rejected', 'Revised', 'Frozen'], default: 'Draft' },
  remarks: { type: String, default: '' },
  version: { type: Number, default: 1 },
  isReadOnly: { type: Boolean, default: false },
  organizationId: { type: String, default: 'ORG-001' },
  createdBy: { type: String, default: 'System' },
  updatedBy: { type: String, default: 'System' }
}, { timestamps: true });

module.exports = mongoose.model('HrBudget', HrBudgetSchema);
