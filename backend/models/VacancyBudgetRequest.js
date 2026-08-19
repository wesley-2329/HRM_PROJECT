const mongoose = require('mongoose');

const VacancyBudgetRequestSchema = new mongoose.Schema({
  budgetRequestNumber: {
    type: String,
    required: true,
    unique: true
  },
  reqNumber: {
    type: String,
    default: ''
  },
  positionTitle: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  costCenter: {
    type: String,
    required: true
  },
  annualCtcBudget: {
    type: Number,
    required: true
  },
  recruitmentCostBudget: {
    type: Number,
    default: 0
  },
  totalFinancialImpact: {
    type: Number,
    default: 0
  },
  allocatedBudget: {
    type: Number,
    default: 0
  },
  utilizedBudget: {
    type: Number,
    default: 0
  },
  budgetAvailability: {
    type: String,
    enum: ['Available', 'Exceeded', 'Near Threshold'],
    default: 'Available'
  },
  financeApprovalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Hold'],
    default: 'Pending'
  },
  managementApprovalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Hold'],
    default: 'Pending'
  },
  overallStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Hold'],
    default: 'Pending'
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

VacancyBudgetRequestSchema.pre('save', function (next) {
  this.totalFinancialImpact = (this.annualCtcBudget || 0) + (this.recruitmentCostBudget || 0);
  next();
});

module.exports = mongoose.model('VacancyBudgetRequest', VacancyBudgetRequestSchema);
