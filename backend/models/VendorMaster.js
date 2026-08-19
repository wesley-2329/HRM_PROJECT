const mongoose = require('mongoose');

const VendorMasterSchema = new mongoose.Schema({
  vendorId: { type: String, required: true, unique: true },
  vendorCode: { type: String, required: true },
  vendorName: { type: String, required: true },
  category: { type: String, enum: ['Recruitment Agency', 'Portal Provider', 'Welfare & Catering', 'Transport', 'Medical & Insurance', 'Training Partner', 'General Vendor'], default: 'General Vendor' },
  contactPerson: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  taxId: { type: String, default: '' },
  rating: { type: Number, default: 4.5 },
  status: { type: String, enum: ['Active', 'Inactive', 'Blacklisted'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('VendorMaster', VendorMasterSchema);
