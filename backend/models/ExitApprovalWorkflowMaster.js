const mongoose = require('mongoose');

const ExitApprovalWorkflowMasterSchema = new mongoose.Schema({
  workflowId: { type: String, required: true, unique: true },
  workflowName: { type: String, required: true },
  approverRoles: [{ type: String }], // ['Reporting Manager', 'HR Manager', 'Payroll Executive', 'Finance Manager']
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ExitApprovalWorkflowMaster', ExitApprovalWorkflowMasterSchema);
