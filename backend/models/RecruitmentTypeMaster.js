const mongoose = require('mongoose');

const RecruitmentTypeMasterSchema = new mongoose.Schema({
  typeId: { type: String, required: true, unique: true },
  typeName: { type: String, required: true }, // Executive, Lateral, Campus, Volume, Contract
  description: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('RecruitmentTypeMaster', RecruitmentTypeMasterSchema);
