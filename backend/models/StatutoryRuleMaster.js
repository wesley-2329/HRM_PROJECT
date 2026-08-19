const mongoose = require('mongoose');

const StatutoryRuleMasterSchema = new mongoose.Schema({
  ruleId: { type: String, required: true, unique: true },
  ruleName: { type: String, required: true },
  actName: { type: String, required: true },
  wageCeiling: { type: Number, default: 15000 },
  employeeRatePercentage: { type: Number, default: 12 },
  employerRatePercentage: { type: Number, default: 12 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('StatutoryRuleMaster', StatutoryRuleMasterSchema);
