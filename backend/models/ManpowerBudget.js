const mongoose = require('mongoose');

const ManpowerBudgetSchema = new mongoose.Schema({
  budgetId: { type: String, required: true, unique: true },
  financialYear: { type: String, required: true },
  company: { type: String, default: 'Enterprise Corp' },
  businessUnit: { type: String, default: 'Engineering' },
  branch: { type: String, default: 'HQ Bangalore' },
  department: { type: String, required: true },
  costCenter: { type: String, required: true },
  grade: { type: String, default: 'G-3' },
  designation: { type: String, required: true },
  employmentType: { type: String, default: 'Full Time' },
  currentHeadcount: { type: Number, required: true, default: 0 },
  approvedHeadcount: { type: Number, required: true, default: 0 },
  proposedHeadcount: { type: Number, required: true, default: 0 },
  vacancyCount: { type: Number, default: 0 },
  avgMonthlySalary: { type: Number, required: true, default: 0 },
  annualSalaryBudget: { type: Number, required: true, default: 0 },
  recruitmentBudget: { type: Number, default: 0 },
  replacementBudget: { type: Number, default: 0 },
  incrementBudget: { type: Number, default: 0 },
  promotionBudget: { type: Number, default: 0 },
  justification: { type: String, default: '' },
  remarks: { type: String, default: '' },
  status: { type: String, enum: ['Draft', 'Submitted', 'Approved', 'Rejected'], default: 'Draft' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ManpowerBudget', ManpowerBudgetSchema);
