const mongoose = require('mongoose');

const FinancialClearanceSchema = new mongoose.Schema({
  finClearanceId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  employeeId: { type: String, required: true },
  loanOutstanding: { type: Number, default: 0 },
  salaryAdvanceOutstanding: { type: Number, default: 0 },
  travelAdvanceOutstanding: { type: Number, default: 0 },
  otherRecoveries: { type: Number, default: 0 },
  totalFinancialDeduction: { type: Number, default: 0 },
  isCleared: { type: Boolean, default: false },
  clearedBy: { type: String, default: 'Finance Executive' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('FinancialClearance', FinancialClearanceSchema);
