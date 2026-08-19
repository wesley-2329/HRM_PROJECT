const mongoose = require('mongoose');

const SettlementRuleMasterSchema = new mongoose.Schema({
  ruleId: { type: String, required: true, unique: true },
  ruleName: { type: String, required: true },
  gratuityMinYears: { type: Number, default: 5 },
  gratuityFormulaDays: { type: Number, default: 15 },
  leaveEncashmentMaxDays: { type: Number, default: 30 },
  noticePayRecoveryRate: { type: Number, default: 1.0 }, // Monthly salary per month
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('SettlementRuleMaster', SettlementRuleMasterSchema);
