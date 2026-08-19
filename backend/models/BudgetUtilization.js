const mongoose = require('mongoose');

const BudgetUtilizationSchema = new mongoose.Schema({
  utilizationId: { type: String, required: true, unique: true },
  budgetId: { type: String, required: true },
  department: { type: String, required: true },
  costCenter: { type: String, required: true },
  expenseType: { type: String, required: true }, // Payroll, Overtime, Recruitment, Welfare, Training
  amount: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now },
  referenceId: { type: String, default: '' },
  status: { type: String, enum: ['Posted', 'Pending', 'Reversed'], default: 'Posted' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('BudgetUtilization', BudgetUtilizationSchema);
