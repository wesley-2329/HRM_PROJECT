const mongoose = require('mongoose');

const LocationMasterSchema = new mongoose.Schema({
  locationId: { type: String, required: true, unique: true },
  locationCode: { type: String, required: true },
  locationName: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: 'India' },
  zone: { type: String, default: 'South' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('LocationMaster', LocationMasterSchema);
