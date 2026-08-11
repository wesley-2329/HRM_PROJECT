const mongoose = require('mongoose');

const PositionApprovalRequestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    required: true,
    unique: true
  },
  positionTitle: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  reportingManager: {
    type: String,
    default: ''
  },
  costCenter: {
    type: String,
    default: 'CC-101'
  },
  currentHeadcount: {
    type: Number,
    default: 0
  },
  proposedHeadcount: {
    type: Number,
    required: true,
    default: 1
  },
  annualCtcBudget: {
    type: Number,
    default: 0
  },
  justification: {
    type: String,
    default: ''
  },
  orgValidationStatus: {
    type: String,
    enum: ['Valid', 'Department Exceeded', 'Grade Cap Exceeded', 'Validation Pending'],
    default: 'Valid'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Hold'],
    default: 'Pending'
  },
  approverId: {
    type: String,
    default: ''
  },
  approverName: {
    type: String,
    default: ''
  },
  approvalDate: {
    type: Date,
    default: null
  },
  comments: {
    type: String,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  created_by: {
    type: String,
    default: 'System'
  },
  updated_by: {
    type: String,
    default: 'System'
  }
}, { timestamps: true });

module.exports = mongoose.model('PositionApprovalRequest', PositionApprovalRequestSchema);
