const mongoose = require('mongoose');

const CountryMasterSchema = new mongoose.Schema({
  countryId: { type: String, required: true, unique: true },
  countryCode: { type: String, required: true },
  countryName: { type: String, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('CountryMaster', CountryMasterSchema);
