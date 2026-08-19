const mongoose = require('mongoose');

const BudgetApprovalMatrixMasterSchema = new mongoose.Schema({
  matrixId: { type: String, required: true, unique: true },
  matrixName: { type: String, required: true },
  module: { type: String, default: 'HR Budgeting' },
  minAmount: { type: Number, default: 0 },
  maxAmount: { type: Number, default: 10000000 },
  approverRoles: [{ type: String }], // ['Department Head', 'HR Manager', 'Finance Manager', 'Management']
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('BudgetApprovalMatrixMaster', BudgetApprovalMatrixMasterSchema);
