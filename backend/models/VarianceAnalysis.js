const mongoose = require('mongoose');

const VarianceAnalysisSchema = new mongoose.Schema({
  varianceId: { type: String, required: true, unique: true },
  budgetId: { type: String, required: true },
  department: { type: String, required: true },
  costCenter: { type: String, required: true },
  category: { type: String, required: true },
  plannedBudget: { type: Number, required: true, default: 0 },
  actualExpense: { type: Number, required: true, default: 0 },
  variance: { type: Number, default: 0 },
  varianceType: { type: String, enum: ['Favorable', 'Unfavorable'], default: 'Favorable' },
  rootCause: { type: String, default: '' },
  actionPlan: { type: String, default: '' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('VarianceAnalysis', VarianceAnalysisSchema);
