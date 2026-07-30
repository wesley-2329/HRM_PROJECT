const mongoose = require('mongoose');

const ApprovalHistorySchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalAssignment', required: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  processName: { type: String, required: true },
  levelNumber: { type: Number, required: true },
  approverId: { type: String, required: true },
  approverName: { type: String, required: true },
  approverRole: { type: String, required: true },
  action: { type: String, enum: ['Approved', 'Rejected', 'Escalated', 'Delegated'], required: true },
  comments: { type: String, default: '' },
  oldStatus: { type: String, default: '' },
  newStatus: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalHistory', ApprovalHistorySchema);
