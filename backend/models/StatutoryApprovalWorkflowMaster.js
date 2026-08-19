const mongoose = require('mongoose');

const StatutoryApprovalWorkflowMasterSchema = new mongoose.Schema({
  workflowId: { type: String, required: true, unique: true },
  workflowName: { type: String, required: true }, // e.g. Challan Payment Approval, Return Filing Approval
  statutoryType: { type: String, required: true },
  approverRoles: [{ type: String }], // ['Payroll Executive', 'Finance Executive', 'Compliance Officer', 'Finance Manager']
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('StatutoryApprovalWorkflowMaster', StatutoryApprovalWorkflowMasterSchema);
