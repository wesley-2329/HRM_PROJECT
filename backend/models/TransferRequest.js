const mongoose = require('mongoose');

const TransferApprovalSchema = new mongoose.Schema({
  status: { type: String, required: true },
  actorName: { type: String, required: true },
  comments: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

const TransferAuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorName: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const TransferRequestSchema = new mongoose.Schema({
  transferNumber: { type: String, required: true, unique: true }, // Format: TRN-2026-XXXX
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  currentDepartment: { type: String, required: true },
  currentDesignation: { type: String, required: true },
  currentLocation: { type: String, default: '' },
  currentManagerId: { type: String, default: '' },
  currentManagerName: { type: String, default: '' },

  transferType: {
    type: String,
    enum: [
      'Promotion Transfer',
      'Lateral Transfer',
      'Temporary Transfer',
      'Permanent Transfer',
      'Inter-Department Transfer',
      'Cost Center Transfer',
      'Organization Restructure',
      'Inter Department Transfer',
      'Inter Location Transfer',
      'Reporting Manager Change',
      'Functional Transfer'
    ],
    required: true
  },
  transferReason: { type: String, required: true },
  effectiveDate: { type: Date, required: true },
  remarks: { type: String, default: '' },
  attachmentUrl: { type: String, default: '' },

  status: {
    type: String,
    enum: ['Pending Recommendation', 'Pending Approval', 'Under HR Review', 'Approved', 'Rejected', 'Sent Back'],
    default: 'Pending Recommendation'
  },

  // Target values (Processing Screen)
  newDepartment: { type: String, default: '' },
  newLocation: { type: String, default: '' },
  newManagerId: { type: String, default: '' },
  newManagerName: { type: String, default: '' },
  newCostCenter: { type: String, default: '' },
  newGrade: { type: String, default: '' },
  transferLetterUrl: { type: String, default: '' },

  approvalHistory: [TransferApprovalSchema],
  auditLog: [TransferAuditLogSchema]
}, { timestamps: true });

module.exports = mongoose.model('TransferRequest', TransferRequestSchema);
