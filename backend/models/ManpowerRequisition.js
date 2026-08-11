const mongoose = require('mongoose');

const ApprovalStepSchema = new mongoose.Schema({
  step: { type: Number, required: true },
  role: { type: String, required: true },
  approverId: { type: String, default: '' },
  approverName: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Hold', 'Send Back'], 
    default: 'Pending' 
  },
  comments: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
}, { _id: true });

const ManpowerRequisitionSchema = new mongoose.Schema({
  reqNumber: {
    type: String,
    required: true,
    unique: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  reportingManagerId: {
    type: String,
    default: ''
  },
  reportingManagerName: {
    type: String,
    default: ''
  },
  grade: {
    type: String,
    default: 'Grade A'
  },
  designation: {
    type: String,
    default: ''
  },
  costCenter: {
    type: String,
    default: 'CC-101'
  },
  employmentType: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Contractor', 'Intern'],
    default: 'Full-Time'
  },
  vacancyCount: {
    type: Number,
    required: true,
    default: 1
  },
  annualCtcPerPosition: {
    type: Number,
    required: true,
    default: 0
  },
  totalBudgetEstimated: {
    type: Number,
    default: 0
  },
  targetHireDate: {
    type: Date,
    required: true
  },
  justification: {
    type: String,
    default: ''
  },
  priorityLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: [
      'Draft', 
      'Submitted', 
      'Manager Approved', 
      'HR Verified', 
      'Finance Verified', 
      'Management Approved', 
      'Approved', 
      'Rejected', 
      'Hold', 
      'Send Back',
      'Fulfilled'
    ],
    default: 'Submitted'
  },
  currentApprovalStep: {
    type: Number,
    default: 1
  },
  approvals: [ApprovalStepSchema],
  assignedRecruiterId: {
    type: String,
    default: ''
  },
  assignedRecruiterName: {
    type: String,
    default: ''
  },
  assignedDate: {
    type: Date,
    default: null
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

ManpowerRequisitionSchema.pre('save', function (next) {
  if (this.annualCtcPerPosition && this.vacancyCount) {
    this.totalBudgetEstimated = this.annualCtcPerPosition * this.vacancyCount;
  }
  next();
});

module.exports = mongoose.model('ManpowerRequisition', ManpowerRequisitionSchema);
