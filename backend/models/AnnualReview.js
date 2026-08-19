const mongoose = require('mongoose');

const CompetencyAssessmentSchema = new mongoose.Schema({
  competencyId: { type: String, default: '' },
  competencyName: { type: String, required: true },
  competencyType: { type: String, default: 'Core' },
  weightage: { type: Number, default: 20 },
  selfRating: { type: Number, default: 4 },
  managerRating: { type: Number, default: 4 },
  finalRating: { type: Number, default: 4 },
  comments: { type: String, default: '' }
}, { _id: false });

const AnnualReviewSchema = new mongoose.Schema({
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
  grade: {
    type: String,
    default: 'Grade A'
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
    default: 'Annual Review FY 2026-27'
  },

  // Self Appraisal
  selfKraAchievement: { type: String, default: '' },
  selfKpiAchievement: { type: String, default: '' },
  keyAccomplishments: { type: String, default: '' },
  majorChallenges: { type: String, default: '' },
  innovations: { type: String, default: '' },
  careerAspirations: { type: String, default: '' },
  selfComments: { type: String, default: '' },
  selfSubmittedAt: { type: Date, default: null },

  // Manager Assessment
  managerKraScore: { type: Number, default: 85 }, // 0-100
  managerKpiScore: { type: Number, default: 85 }, // 0-100
  managerCompetencyScore: { type: Number, default: 85 }, // 0-100
  managerBehaviourScore: { type: Number, default: 85 }, // 0-100
  managerRating: { type: Number, default: 4.2 }, // 1-5 scale
  strengths: { type: String, default: '' },
  improvementAreas: { type: String, default: '' },
  careerPotential: { type: String, default: 'High Potential' },
  managerComments: { type: String, default: '' },
  managerAssessedAt: { type: Date, default: null },

  // Competency assessments array
  competencyAssessments: [CompetencyAssessmentSchema],

  // Automated Calculation Engine outputs
  calculatedOverallScore: { type: Number, default: 86.5 }, // 0-100%
  weightedKraScore: { type: Number, default: 34 },
  weightedKpiScore: { type: Number, default: 25.5 },
  weightedCompetencyScore: { type: Number, default: 17 },
  weightedBehaviourScore: { type: Number, default: 8.5 },

  // Final Rating & Category
  finalRating: { type: Number, default: 4.3 },
  performanceCategory: {
    type: String,
    enum: ['Outstanding', 'Exceeds Expectations', 'Meets Expectations', 'Needs Improvement', 'Unsatisfactory'],
    default: 'Exceeds Expectations'
  },

  // Calibration
  calibrationProposedRating: { type: Number, default: 4.3 },
  calibrationFinalRating: { type: Number, default: 4.3 },
  calibrationRemarks: { type: String, default: '' },
  calibratedBy: { type: String, default: '' },

  // Recommended Triggers
  recommendedAction: {
    type: String,
    enum: ['None', 'Promotion', 'Increment', 'PIP', 'Promotion & Increment'],
    default: 'Increment'
  },

  // Employee Sign-off
  acknowledgedByEmployee: { type: Boolean, default: false },
  employeeAcknowledgementDate: { type: Date, default: null },
  employeeAcknowledgementComments: { type: String, default: '' },

  status: {
    type: String,
    enum: [
      'Cycle Opened',
      'Self-Appraisal Submitted',
      'Manager Evaluation Completed',
      'Calibrated',
      'HR Validated',
      'Management Approved',
      'Published & Acknowledged',
      'Completed'
    ],
    default: 'Manager Evaluation Completed'
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

AnnualReviewSchema.pre('save', function (next) {
  // Automated performance calculation engine fallback math
  const kraScore = this.managerKraScore || 85;
  const kpiScore = this.managerKpiScore || 85;
  const compScore = this.managerCompetencyScore || 85;
  const behScore = this.managerBehaviourScore || 85;

  this.weightedKraScore = Math.round((kraScore * 0.40) * 10) / 10;
  this.weightedKpiScore = Math.round((kpiScore * 0.30) * 10) / 10;
  this.weightedCompetencyScore = Math.round((compScore * 0.20) * 10) / 10;
  this.weightedBehaviourScore = Math.round((behScore * 0.10) * 10) / 10;

  this.calculatedOverallScore = Math.round((this.weightedKraScore + this.weightedKpiScore + this.weightedCompetencyScore + this.weightedBehaviourScore) * 10) / 10;

  if (this.calculatedOverallScore >= 90) {
    this.performanceCategory = 'Outstanding';
    this.finalRating = 5.0;
  } else if (this.calculatedOverallScore >= 75) {
    this.performanceCategory = 'Exceeds Expectations';
    this.finalRating = 4.2;
  } else if (this.calculatedOverallScore >= 60) {
    this.performanceCategory = 'Meets Expectations';
    this.finalRating = 3.5;
  } else if (this.calculatedOverallScore >= 45) {
    this.performanceCategory = 'Needs Improvement';
    this.finalRating = 2.5;
  } else {
    this.performanceCategory = 'Unsatisfactory';
    this.finalRating = 1.5;
  }
  next();
});

module.exports = mongoose.model('AnnualReview', AnnualReviewSchema);
