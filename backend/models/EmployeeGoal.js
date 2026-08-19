const mongoose = require('mongoose');

const GoalProgressHistorySchema = new mongoose.Schema({
  achievementValue: { type: String, default: '' },
  achievementPct: { type: Number, default: 0 },
  status: { type: String, default: 'In Progress' },
  evidenceUrl: { type: String, default: '' },
  employeeComments: { type: String, default: '' },
  managerComments: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
}, { _id: true });

const GoalRevisionHistorySchema = new mongoose.Schema({
  originalGoal: { type: String, default: '' },
  revisedGoal: { type: String, default: '' },
  originalTarget: { type: String, default: '' },
  revisedTarget: { type: String, default: '' },
  reason: { type: String, default: '' },
  requestedBy: { type: String, default: '' },
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  requestedAt: { type: Date, default: Date.now }
}, { _id: true });

const EmployeeGoalSchema = new mongoose.Schema({
  goalCode: {
    type: String,
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
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
  reportingManagerId: {
    type: String,
    default: ''
  },
  reportingManagerName: {
    type: String,
    default: ''
  },
  appraisalCycleId: {
    type: String,
    required: true
  },
  kraId: {
    type: String,
    default: ''
  },
  kraName: {
    type: String,
    required: true
  },
  kpiId: {
    type: String,
    default: ''
  },
  kpiName: {
    type: String,
    default: ''
  },
  target: {
    type: String,
    required: true
  },
  weightage: {
    type: Number,
    required: true,
    default: 20
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'High'
  },
  successCriteria: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  achievementValue: {
    type: String,
    default: '0'
  },
  achievementPct: {
    type: Number,
    default: 0
  },
  goalStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'On Track', 'At Risk', 'Completed', 'Delayed'],
    default: 'In Progress'
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected', 'Return for Modification'],
    default: 'Submitted'
  },
  employeeComments: {
    type: String,
    default: ''
  },
  managerComments: {
    type: String,
    default: ''
  },
  progressHistory: [GoalProgressHistorySchema],
  revisionHistory: [GoalRevisionHistorySchema],
  is_active: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeGoal', EmployeeGoalSchema);
