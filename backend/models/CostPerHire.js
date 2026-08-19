const mongoose = require('mongoose');

const CostPerHireSchema = new mongoose.Schema({
  cphId: { type: String, required: true, unique: true },
  recruitmentBudgetId: { type: String, default: '' },
  source: { type: String, required: true }, // Job Portal, Agency, Referral, Campus, Social Media
  hiresCount: { type: Number, required: true, default: 1 },
  totalCost: { type: Number, required: true, default: 0 },
  costPerHire: { type: Number, required: true, default: 0 },
  successRate: { type: Number, default: 90.0 }, // percentage
  timeToHireDays: { type: Number, default: 25 },
  roi: { type: Number, default: 3.5 }, // multiplier
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('CostPerHire', CostPerHireSchema);
