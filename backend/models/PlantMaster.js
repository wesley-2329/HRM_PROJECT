const mongoose = require('mongoose');

const PlantMasterSchema = new mongoose.Schema({
  plantId: { type: String, required: true, unique: true },
  plantCode: { type: String, required: true },
  plantName: { type: String, required: true },
  companyId: { type: String, default: '' },
  companyName: { type: String, default: '' },
  branchId: { type: String, default: '' },
  state: { type: String, required: true },
  city: { type: String, default: '' },
  address: { type: String, default: '' },
  factoryLicenseNo: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' },
  createdBy: { type: String, default: 'System' },
  updatedBy: { type: String, default: 'System' }
}, { timestamps: true });

module.exports = mongoose.model('PlantMaster', PlantMasterSchema);
