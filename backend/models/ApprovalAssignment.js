const mongoose = require('mongoose');

const AssignmentLevelSchema = new mongoose.Schema({
  levelNumber: { type: Number, required: true },
  approverRole: { type: String, required: true },
  approvalType: { type: String, enum: ['Single', 'Multiple'], default: 'Single' },
  assignedApprovers: [{ type: String }],
  approvedBy: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Skipped'], default: 'Pending' },
  decisionDate: { type: Date },
  comments: { type: String, default: '' },
  slaDays: { type: Number, default: 3 },
  dueDate: { type: Date }
});

const ApprovalAssignmentSchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  transactionSource: { type: String, required: true },
  processName: { type: String, required: true },
  requesterId: { type: String, required: true },
  requesterName: { type: String, required: true },
  requesterDept: { type: String, required: true },
  requesterRole: { type: String, required: true },
  levels: [AssignmentLevelSchema],
  currentLevel: { type: Number, default: 1 },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Escalated', 'Overdue'], default: 'Pending' },
  matrixVersion: { type: Number, default: 1 },
  matrixId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalMatrix' }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalAssignment', ApprovalAssignmentSchema);
