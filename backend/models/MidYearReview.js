const mongoose = require('mongoose');

const MidYearReviewSchema = new mongoose.Schema({
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
  reviewPeriod: {
    type: String,
    default: 'Mid-Year Review FY 2026-27'
  },

  // Self Review
  selfGoalAchievement: { type: String, default: '' },
  selfKpiAchievement: { type: String, default: '' },
  selfRating: { type: Number, default: 4 },
  keyAchievements: { type: String, default: '' },
  majorChallenges: { type: String, default: '' },
  trainingCompleted: { type: String, default: '' },
  developmentNeeds: { type: String, default: '' },
  employeeComments: { type: String, default: '' },
  employeeSubmittedAt: { type: Date, default: null },

  // Manager Review
  managerRating: { type: Number, default: 4 },
  strengths: { type: String, default: '' },
  improvementAreas: { type: String, default: '' },
  developmentRecommendations: { type: String, default: '' },
  coachingRecommendations: { type: String, default: '' },
  managerComments: { type: String, default: '' },
  managerReviewedAt: { type: Date, default: null },

  // Development Plan
  developmentPlan: [{
    skillGap: { type: String, default: '' },
    trainingRequired: { type: String, default: '' },
    mentorName: { type: String, default: '' },
    expectedImprovement: { type: String, default: '' },
    targetDate: { type: Date, default: null },
    status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' }
  }],

  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Manager Reviewed', 'HR Monitored', 'Completed'],
    default: 'Submitted'
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('MidYearReview', MidYearReviewSchema);
