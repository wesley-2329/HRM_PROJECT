const mongoose = require('mongoose');

const SalaryBudgetSchema = new mongoose.Schema({
  salaryBudgetId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  costCenter: { type: String, required: true },
  grade: { type: String, required: true },
  baseSalary: { type: Number, required: true, default: 0 },
  allowances: { type: Number, default: 0 },
  bonuses: { type: Number, default: 0 },
  TotalSalaryCost: { type: Number, required: true, default: 0 },
  financialYear: { type: String, required: true },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('SalaryBudget', SalaryBudgetSchema);
