const mongoose = require('mongoose');

const ResignationReasonMasterSchema = new mongoose.Schema({
  reasonId: { type: String, required: true, unique: true },
  category: { type: String, enum: ['Career Growth', 'Higher Compensation', 'Personal / Family', 'Relocation', 'Work-Life Balance', 'Higher Studies', 'Health Issue', 'Better Opportunities', 'Other'], required: true },
  reasonName: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ResignationReasonMaster', ResignationReasonMasterSchema);
