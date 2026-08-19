const mongoose = require('mongoose');

const WelfareActivityMasterSchema = new mongoose.Schema({
  activityId: { type: String, required: true, unique: true },
  activityName: { type: String, required: true },
  categoryId: { type: String, default: '' },
  categoryName: { type: String, required: true },
  defaultCost: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('WelfareActivityMaster', WelfareActivityMasterSchema);
