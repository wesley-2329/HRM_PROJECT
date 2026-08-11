const mongoose = require('mongoose');

const PipObjectiveSchema = new mongoose.Schema({
  objectiveName: { type: String, required: true },
  target: { type: String, required: true },
  measurement: { type: String, default: '' },
  weightage: { type: Number, default: 25 },
  successCriteria: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  achievementPct: { type: Number, default: 0 },
  status: { type: String, enum: ['Not Started', 'In Progress', 'On Track', 'At Risk', 'Completed'], default: 'In Progress' }
}, { _id: true });

const PipPeriodicReviewSchema = new mongoose.Schema({
  reviewDate: { type: Date, default: Date.now },
  managerFeedback: { type: String, required: true },
  employeeComments: { type: String, default: '' },
  evidenceUrl: { type: String, default: '' },
  rating: { type: String, enum: ['Satisfactory Progress', 'Needs Accelerated Effort', 'Unsatisfactory'], default: 'Satisfactory Progress' },
  reviewedBy: { type: String, default: 'Reporting Manager' }
}, { _id: true });

const PipRecordSchema = new mongoose.Schema({
  pipCode: {
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  durationDays: {
    type: Number,
    default: 60
  },
  performanceGap: {
    type: String,
    required: true
  },
  expectedPerformance: {
    type: String,
    required: true
  },
  actionPlan: {
    type: String,
    required: true
  },
  reviewFrequency: {
    type: String,
    enum: ['Weekly', 'Bi-Weekly', 'Monthly'],
    default: 'Bi-Weekly'
  },
  objectives: [PipObjectiveSchema],
  periodicReviews: [PipPeriodicReviewSchema],
  outcome: {
    type: String,
    enum: ['In Progress', 'Successfully Completed', 'Extended', 'Unsuccessful', 'Closed'],
    default: 'In Progress'
  },
  extensionReason: { type: String, default: '' },
  newEndDate: { type: Date, default: null },
  employeeAcknowledged: { type: Boolean, default: false },
  acknowledgedDate: { type: Date, default: null },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('PipRecord', PipRecordSchema);
