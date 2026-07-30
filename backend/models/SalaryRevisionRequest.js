const mongoose = require('mongoose');

const SalaryRevisionApprovalHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  actorName: { type: String, required: true },
  comments: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

const SalaryRevisionAuditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorName: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const SalaryRevisionRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true }, // Format: SRV-2026-XXXX
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  currentDepartment: { type: String, required: true },
  currentDesignation: { type: String, required: true },
  currentGrade: { type: String, default: 'A1' },
  currentManagerId: { type: String, default: '' },
  currentManagerName: { type: String, default: '' },

  revisionType: {
    type: String,
    enum: [
      'Annual Increment',
      'Promotion',
      'Confirmation',
      'Transfer',
      'Market Correction',
      'Special Adjustment',
      'Retention Increase',
      'Other'
    ],
    required: true
  },
  effectiveDate: { type: Date, required: true },
  reason: { type: String, required: true },
  attachmentUrl: { type: String, default: '' },

  // Component breakdown
  currentCtc: { type: Number, default: 0 },
  currentGross: { type: Number, default: 0 },
  currentBasic: { type: Number, default: 0 },
  currentAllowances: { type: Number, default: 0 },

  revisedCtc: { type: Number, required: true },
  revisedGross: { type: Number, default: 0 },
  revisedBasic: { type: Number, default: 0 },
  revisedAllowances: { type: Number, default: 0 },

  incrementAmount: { type: Number, required: true },
  incrementPercentage: { type: Number, required: true },

  status: {
    type: String,
    enum: ['Pending Verification', 'Pending Approval', 'Approved', 'Rejected', 'Hold', 'Sent Back'],
    default: 'Pending Verification'
  },
  letterUrl: { type: String, default: '' },

  // Acknowledgement details
  acknowledged: { type: Boolean, default: false },
  acceptanceDate: { type: Date },

  approvalHistory: [SalaryRevisionApprovalHistorySchema],
  auditLog: [SalaryRevisionAuditSchema]
}, { timestamps: true });

module.exports = mongoose.model('SalaryRevisionRequest', SalaryRevisionRequestSchema);
