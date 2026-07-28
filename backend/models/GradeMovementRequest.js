const mongoose = require('mongoose');

const GradeMovementApprovalHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  actorName: { type: String, required: true },
  comments: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

const GradeMovementAuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorName: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const GradeMovementRequestSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: { type: String, required: true },
  currentGrade: { type: String, required: true },
  proposedGrade: { type: String, required: true },
  currentBand: { type: String, required: true },
  proposedBand: { type: String, required: true },
  reason: { type: String, required: true },
  effectiveDate: { type: Date, required: true },
  attachmentUrl: { type: String, default: '' },

  status: {
    type: String,
    enum: ['Pending Approval', 'Approved', 'Rejected', 'Hold'],
    default: 'Pending Approval'
  },
  approvedBy: { type: String, default: '' },
  remarks: { type: String, default: '' },

  approvalHistory: [GradeMovementApprovalHistorySchema],
  auditLog: [GradeMovementAuditLogSchema]
}, { timestamps: true });

module.exports = mongoose.model('GradeMovementRequest', GradeMovementRequestSchema);
