const mongoose = require('mongoose');

const AssetCategoryMasterSchema = new mongoose.Schema({
  assetCategoryId: { type: String, required: true, unique: true },
  categoryName: { type: String, enum: ['Laptop', 'Desktop', 'Mobile', 'SIM', 'ID Card', 'Access Card', 'Locker Key', 'Vehicle Pass', 'Uniform', 'Software License', 'Company Documents', 'Other Assets'], required: true },
  departmentResponsible: { type: String, enum: ['IT', 'Admin', 'Security', 'HR'], default: 'IT' },
  defaultRecoveryAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('AssetCategoryMaster', AssetCategoryMasterSchema);
