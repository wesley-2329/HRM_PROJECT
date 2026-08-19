const mongoose = require('mongoose');

const RecruitmentSourceMasterSchema = new mongoose.Schema({
  sourceId: { type: String, required: true, unique: true },
  sourceName: { type: String, required: true }, // Job Portal, Agency, Social Media, Referral, Campus, Job Fair
  sourceType: { type: String, default: 'Direct' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('RecruitmentSourceMaster', RecruitmentSourceMasterSchema);
