const mongoose = require('mongoose');

const ResignationApprovalSchema = new mongoose.Schema({
  approvalId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  stage: { type: String, enum: ['Manager Review', 'HR Review', 'Final Approval'], required: true },
  approverId: { type: String, required: true },
  approverName: { type: String, required: true },
  approverRole: { type: String, required: true },
  recommendRetention: { type: Boolean, default: false },
  retentionRemarks: { type: String, default: '' },
  recommendedLwd: { type: Date },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'On Hold'], default: 'Pending' },
  comments: { type: String, default: '' },
  actionDate: { type: Date },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ResignationApproval', ResignationApprovalSchema);
