const mongoose = require('mongoose');

const BudgetApprovalSchema = new mongoose.Schema({
  approvalId: { type: String, required: true, unique: true },
  budgetId: { type: String, required: true },
  approvalStage: { type: String, enum: ['Department Review', 'HR Review', 'Finance Review', 'Management Approval', 'Final Release'], default: 'Department Review' },
  approverRole: { type: String, required: true },
  approverId: { type: String, default: '' },
  approverName: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Escalated'], default: 'Pending' },
  comments: { type: String, default: '' },
  actionDate: { type: Date },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('BudgetApproval', BudgetApprovalSchema);
