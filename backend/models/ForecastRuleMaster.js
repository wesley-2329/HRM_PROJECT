const mongoose = require('mongoose');

const ForecastRuleMasterSchema = new mongoose.Schema({
  ruleId: { type: String, required: true, unique: true },
  ruleName: { type: String, required: true }, // e.g. Linear Growth, Seasonal Peak, Inflation Adjust, Headcount Proportional
  ruleType: { type: String, default: 'Linear' },
  multiplier: { type: Number, default: 1.05 },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ForecastRuleMaster', ForecastRuleMasterSchema);
