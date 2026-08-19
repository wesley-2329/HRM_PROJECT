const mongoose = require('mongoose');

const StatutoryActMasterSchema = new mongoose.Schema({
  actId: { type: String, required: true, unique: true },
  actCode: { type: String, required: true },
  actName: { type: String, required: true }, // e.g. EPF Act 1952, ESI Act 1948, PT Act, LWF Act, Factories Act
  governingBody: { type: String, default: 'Ministry of Labour & Employment' },
  frequency: { type: String, enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'], default: 'Monthly' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('StatutoryActMaster', StatutoryActMasterSchema);
