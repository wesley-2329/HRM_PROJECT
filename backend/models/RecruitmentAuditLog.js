const mongoose = require('mongoose');

const RecruitmentAuditLogSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    default: 'Recruitment & Onboarding'
  },
  entityType: {
    type: String,
    required: true // 'Requisition', 'Position', 'Budget', 'Candidate', 'Resume', 'TalentPool', 'Cost'
  },
  entityId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'HOLD', 'SEND_BACK', 'ASSIGN', 'OFFER_RELEASE', 'JOINED'],
    required: true
  },
  performedByUserId: {
    type: String,
    default: 'EMP-001'
  },
  performedByName: {
    type: String,
    default: 'Admin User'
  },
  performedByRole: {
    type: String,
    default: 'HR Admin'
  },
  previousState: {
    type: Object,
    default: null
  },
  newState: {
    type: Object,
    default: null
  },
  comments: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('RecruitmentAuditLog', RecruitmentAuditLogSchema);
