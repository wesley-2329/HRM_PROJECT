const mongoose = require('mongoose');

const PromotionApprovalHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  actorName: { type: String, required: true },
  comments: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

const PromotionAuditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorName: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const PromotionRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true }, // Format: PRM-2026-XXXX
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  currentDepartment: { type: String, required: true },
  currentDesignation: { type: String, required: true },
  currentGrade: { type: String, required: true },
  currentManagerId: { type: String, default: '' },
  currentManagerName: { type: String, default: '' },
  joiningDate: { type: Date },
  currentLocation: { type: String, default: 'Head Office' },

  // Proposed details
  proposedDesignation: { type: String, required: true },
  proposedGrade: { type: String, required: true },
  proposedDepartment: { type: String, default: '' },
  proposedManagerId: { type: String, default: '' },
  proposedManagerName: { type: String, default: '' },
  effectiveDate: { type: Date, required: true },

  // Recommendation details
  justification: { type: String, required: true },
  performanceSummary: { type: String, default: '' },
  keyAchievements: { type: String, default: '' },
  attachmentUrl: { type: String, default: '' },

  // Salary revision details
  currentSalary: { type: Number, default: 0 },
  proposedSalary: { type: Number, default: 0 },

  // System validation
  eligibilityChecked: {
    confirmationStatus: { type: String, default: 'Confirmed' },
    probationStatus: { type: String, default: 'Completed' },
    servicePeriodMonths: { type: Number, default: 12 },
    performanceRating: { type: String, default: 'A' },
    disciplinaryRecords: { type: String, default: 'None' },
    activeStatus: { type: Boolean, default: true }
  },

  status: {
    type: String,
    enum: ['Pending Verification', 'Pending Approval', 'Under Management Review', 'Approved', 'Rejected', 'Hold', 'Sent Back'],
    default: 'Pending Verification'
  },
  promotionLetterUrl: { type: String, default: '' },
  
  // Acknowledgement details
  acknowledged: { type: Boolean, default: false },
  acceptanceDate: { type: Date },

  approvalHistory: [PromotionApprovalHistorySchema],
  auditLog: [PromotionAuditSchema]
}, { timestamps: true });

module.exports = mongoose.model('PromotionRequest', PromotionRequestSchema);
