const mongoose = require('mongoose');

const LwfRuleMasterSchema = new mongoose.Schema({
  lwfRuleId: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  frequency: { type: String, enum: ['Monthly', 'Half-Yearly', 'Annual'], default: 'Half-Yearly' },
  employeeContribution: { type: Number, default: 20 },
  employerContribution: { type: Number, default: 40 },
  deductionMonths: [{ type: String }], // e.g. ['June', 'December']
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('LwfRuleMaster', LwfRuleMasterSchema);
