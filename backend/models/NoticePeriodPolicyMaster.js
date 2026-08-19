const mongoose = require('mongoose');

const NoticePeriodPolicyMasterSchema = new mongoose.Schema({
  policyId: { type: String, required: true, unique: true },
  policyName: { type: String, required: true },
  company: { type: String, default: 'Enterprise Corp' },
  grade: { type: String, default: 'All' },
  designation: { type: String, default: 'All' },
  employmentType: { type: String, default: 'Full Time' },
  noticeDaysConfirmed: { type: Number, required: true, default: 90 }, // Days for confirmed employees
  noticeDaysProbation: { type: Number, required: true, default: 30 }, // Days for probation employees
  buyoutAllowed: { type: Boolean, default: true },
  waiverAllowed: { type: Boolean, default: true },
  earlyReleaseAllowed: { type: Boolean, default: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('NoticePeriodPolicyMaster', NoticePeriodPolicyMasterSchema);
