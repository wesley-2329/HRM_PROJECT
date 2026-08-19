const mongoose = require('mongoose');

const PfRuleMasterSchema = new mongoose.Schema({
  pfRuleId: { type: String, required: true, unique: true },
  pfWageCap: { type: Number, default: 15000 },
  employeeRate: { type: Number, default: 12 }, // 12%
  employerPfRate: { type: Number, default: 3.67 }, // 3.67%
  employerEpsRate: { type: Number, default: 8.33 }, // 8.33%
  edliRate: { type: Number, default: 0.5 }, // 0.5%
  adminChargeRate: { type: Number, default: 0.5 }, // 0.5%
  vpfAllowed: { type: Boolean, default: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('PfRuleMaster', PfRuleMasterSchema);
