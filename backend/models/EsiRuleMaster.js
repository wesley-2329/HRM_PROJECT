const mongoose = require('mongoose');

const EsiRuleMasterSchema = new mongoose.Schema({
  esiRuleId: { type: String, required: true, unique: true },
  esiWageCap: { type: Number, default: 21000 },
  employeeRate: { type: Number, default: 0.75 }, // 0.75%
  employerRate: { type: Number, default: 3.25 }, // 3.25%
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('EsiRuleMaster', EsiRuleMasterSchema);
