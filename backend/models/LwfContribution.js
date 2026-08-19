const mongoose = require('mongoose');

const LwfContributionSchema = new mongoose.Schema({
  contributionId: { type: String, required: true, unique: true },
  period: { type: String, required: true }, // e.g. Jun 2026 or H1-2026
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  state: { type: String, required: true },
  employeeShare: { type: Number, required: true, default: 20 },
  employerShare: { type: Number, required: true, default: 40 },
  totalContribution: { type: Number, required: true, default: 60 },
  challanId: { type: String, default: '' },
  status: { type: String, enum: ['Calculated', 'Paid'], default: 'Calculated' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('LwfContribution', LwfContributionSchema);
