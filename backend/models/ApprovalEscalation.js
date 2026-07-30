const mongoose = require('mongoose');

const ApprovalEscalationSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalAssignment', required: true },
  levelNumber: { type: Number, required: true },
  originalApproverId: { type: String, required: true },
  originalApproverName: { type: String, default: '' },
  escalatedToId: { type: String, required: true },
  escalatedToName: { type: String, default: '' },
  escalatedAt: { type: Date, default: Date.now },
  reason: { type: String, default: 'SLA Breached' },
  status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalEscalation', ApprovalEscalationSchema);
