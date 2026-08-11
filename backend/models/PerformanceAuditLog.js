const mongoose = require('mongoose');

const PerformanceAuditLogSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    default: 'Appraisal, Increments & PIP'
  },
  entityType: {
    type: String,
    required: true // 'AppraisalCycle', 'RatingScale', 'Competency', 'Template', 'Goal', 'MidYearReview', 'AnnualReview', 'Calibration', 'Promotion', 'Increment', 'PIP'
  },
  entityId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'SUBMIT', 'APPROVE', 'REJECT', 'HOLD', 'REOPEN', 'CALIBRATE', 'PAYROLL_UPDATE', 'PIP_UPDATE'],
    required: true
  },
  performedByUserId: {
    type: String,
    default: 'EMP-1002'
  },
  performedByName: {
    type: String,
    default: 'System Admin'
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

module.exports = mongoose.model('PerformanceAuditLog', PerformanceAuditLogSchema);
