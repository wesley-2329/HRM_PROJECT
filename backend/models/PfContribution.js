const mongoose = require('mongoose');

const PfContributionSchema = new mongoose.Schema({
  contributionId: { type: String, required: true, unique: true },
  wageMonth: { type: String, required: true }, // e.g. Jul 2026
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  uan: { type: String, required: true },
  pfWage: { type: Number, required: true, default: 15000 },
  employeePfShare: { type: Number, required: true, default: 1800 }, // 12%
  vpfShare: { type: Number, default: 0 },
  employerPfShare: { type: Number, required: true, default: 550 }, // 3.67%
  employerEpsShare: { type: Number, required: true, default: 1250 }, // 8.33%
  edliShare: { type: Number, default: 75 }, // 0.5%
  adminCharges: { type: Number, default: 75 }, // 0.5%
  totalContribution: { type: Number, required: true, default: 3750 },
  challanId: { type: String, default: '' },
  status: { type: String, enum: ['Calculated', 'ECR Generated', 'Challan Created', 'Paid'], default: 'Calculated' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('PfContribution', PfContributionSchema);
