const mongoose = require('mongoose');

const FullFinalSettlementSchema = new mongoose.Schema({
  settlementId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  lastWorkingDay: { type: Date, required: true },
  
  // Earnings
  pendingSalary: { type: Number, default: 0 },
  leaveEncashmentAmount: { type: Number, default: 0 },
  leaveEncashmentDays: { type: Number, default: 0 },
  gratuityAmount: { type: Number, default: 0 },
  bonusAmount: { type: Number, default: 0 },
  incentiveAmount: { type: Number, default: 0 },
  totalEarnings: { type: Number, required: true, default: 0 },
  
  // Deductions & Recoveries
  noticePayRecovery: { type: Number, default: 0 },
  loanRecovery: { type: Number, default: 0 },
  advanceRecovery: { type: Number, default: 0 },
  assetDamageRecovery: { type: Number, default: 0 },
  statutoryDeductions: { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },
  totalDeductions: { type: Number, required: true, default: 0 },
  
  // Net
  netSettlementAmount: { type: Number, required: true, default: 0 },
  
  // Workflow & Status
  clearanceVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['Draft', 'HR Approved', 'Payroll Approved', 'Finance Approved', 'Settlement Locked', 'Paid'], default: 'Draft' },
  paymentReference: { type: String, default: '' },
  paymentDate: { type: Date },
  organizationId: { type: String, default: 'ORG-001' },
  createdBy: { type: String, default: 'Payroll Executive' }
}, { timestamps: true });

module.exports = mongoose.model('FullFinalSettlement', FullFinalSettlementSchema);
