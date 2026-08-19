const mongoose = require('mongoose');

const EsiContributionSchema = new mongoose.Schema({
  contributionId: { type: String, required: true, unique: true },
  wageMonth: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  ipNumber: { type: String, required: true },
  grossWage: { type: Number, required: true, default: 20000 },
  employeeShare: { type: Number, required: true, default: 150 }, // 0.75%
  employerShare: { type: Number, required: true, default: 650 }, // 3.25%
  totalContribution: { type: Number, required: true, default: 800 },
  challanId: { type: String, default: '' },
  status: { type: String, enum: ['Calculated', 'Challan Created', 'Paid'], default: 'Calculated' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('EsiContribution', EsiContributionSchema);
