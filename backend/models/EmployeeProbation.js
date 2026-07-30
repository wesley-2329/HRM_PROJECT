const mongoose = require('mongoose');

const KpiItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  target: { type: String, required: true },
  weight: { type: Number, default: 0 }
});

const ProbationReviewSchema = new mongoose.Schema({
  goalAchievement: { type: String, default: '' },
  attendanceReview: { type: String, default: '' },
  behaviorReview: { type: String, default: '' },
  managerComments: { type: String, default: '' },
  recommendation: { 
    type: String, 
    enum: ['Confirm', 'Extend Probation', 'Transfer', 'Separation', ''],
    default: ''
  },
  reviewDate: { type: Date },
  completedBy: { type: String, default: '' }
});

const ProbationDecisionSchema = new mongoose.Schema({
  action: { 
    type: String, 
    enum: ['Confirm', 'Extend Probation', 'Transfer', 'Separation', ''],
    default: ''
  },
  remarks: { type: String, default: '' },
  effectiveDate: { type: Date },
  approvedBy: { type: String, default: '' },
  letterUrl: { type: String, default: '' },
  extensionDays: { type: Number, default: 0 }
});

const ProbationHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedBy: { type: String, required: true },
  notes: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

const ProbationAuditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorName: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const EmployeeProbationSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  employeeName: { type: String, required: true },
  employeeCode: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  
  employeeCategory: {
    type: String,
    enum: ['Permanent', 'Probationer', 'Trainee', 'Contract', 'Consultant'],
    default: 'Probationer'
  },
  probationDuration: {
    type: Number, // 30, 60, 90, 180 Days
    default: 90
  },
  probationEndDate: { type: Date, required: true },
  reportingManagerId: { type: String, required: true },
  reportingManagerName: { type: String, required: true },
  
  status: {
    type: String,
    enum: ['Under Probation', 'Review Pending', 'Confirmed', 'Extended', 'Separated'],
    default: 'Under Probation'
  },

  kpis: [KpiItemSchema],
  review: { type: ProbationReviewSchema, default: () => ({}) },
  decision: { type: ProbationDecisionSchema, default: () => ({}) },
  
  approvalHistory: [ProbationHistorySchema],
  lifecycleHistory: [ProbationHistorySchema],
  auditLog: [ProbationAuditSchema]
}, { timestamps: true });

module.exports = mongoose.model('EmployeeProbation', EmployeeProbationSchema);
