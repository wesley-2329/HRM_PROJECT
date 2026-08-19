const mongoose = require('mongoose');

const HeadcountPlanningSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true },
  manpowerBudgetId: { type: String, default: '' },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  type: { type: String, enum: ['New Position', 'Replacement', 'Internal Transfer', 'Promotion', 'Retirement Forecast', 'Attrition Forecast', 'Position Freeze', 'Position Release'], default: 'New Position' },
  count: { type: Number, required: true, default: 1 },
  targetMonth: { type: String, default: 'Q3' },
  costImpact: { type: Number, default: 0 },
  status: { type: String, enum: ['Planned', 'Approved', 'Frozen', 'Filled', 'Cancelled'], default: 'Planned' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('HeadcountPlanning', HeadcountPlanningSchema);
