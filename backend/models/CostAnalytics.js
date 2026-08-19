const mongoose = require('mongoose');

const CostAnalyticsSchema = new mongoose.Schema({
  analyticsId: { type: String, required: true, unique: true },
  financialYear: { type: String, required: true },
  department: { type: String, required: true },
  costCenter: { type: String, required: true },
  category: { type: String, required: true },
  budgetAmount: { type: Number, required: true, default: 0 },
  actualCost: { type: Number, required: true, default: 0 },
  varianceAmount: { type: Number, default: 0 },
  variancePercentage: { type: Number, default: 0 },
  metricDate: { type: Date, default: Date.now },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('CostAnalytics', CostAnalyticsSchema);
