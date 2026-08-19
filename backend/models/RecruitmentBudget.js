const mongoose = require('mongoose');

const RecruitmentBudgetSchema = new mongoose.Schema({
  recruitmentBudgetId: { type: String, required: true, unique: true },
  hiringRequestRef: { type: String, default: '' },
  recruitmentType: { type: String, enum: ['Executive', 'Lateral', 'Campus', 'Volume', 'Contract'], default: 'Lateral' },
  budgetCategory: { type: String, default: 'Recruitment & Sourcing' },
  proposedBudget: { type: Number, required: true, default: 0 },
  approvedBudget: { type: Number, default: 0 },
  forecastBudget: { type: Number, default: 0 },
  utilizedBudget: { type: Number, default: 0 },
  remainingBudget: { type: Number, default: 0 },
  justification: { type: String, default: '' },
  remarks: { type: String, default: '' },
  status: { type: String, enum: ['Draft', 'Submitted', 'Approved', 'Rejected'], default: 'Approved' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('RecruitmentBudget', RecruitmentBudgetSchema);
