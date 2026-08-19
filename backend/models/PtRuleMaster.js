const mongoose = require('mongoose');

const PtRuleMasterSchema = new mongoose.Schema({
  ptRuleId: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  minGrossSalary: { type: Number, default: 15000 },
  maxGrossSalary: { type: Number, default: 9999999 },
  ptAmountMonthly: { type: Number, default: 200 },
  ptAmountFeb: { type: Number, default: 300 }, // Special amount for Feb if applicable (e.g. Maharashtra)
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('PtRuleMaster', PtRuleMasterSchema);
