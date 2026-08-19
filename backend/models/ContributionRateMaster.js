const mongoose = require('mongoose');

const ContributionRateMasterSchema = new mongoose.Schema({
  rateId: { type: String, required: true, unique: true },
  statutoryType: { type: String, enum: ['PF', 'ESI', 'PT', 'LWF'], required: true },
  employeeRate: { type: Number, required: true },
  employerRate: { type: Number, required: true },
  effectiveFrom: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ContributionRateMaster', ContributionRateMasterSchema);
