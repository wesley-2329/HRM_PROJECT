const mongoose = require('mongoose');

const StateMasterSchema = new mongoose.Schema({
  stateId: { type: String, required: true, unique: true },
  stateCode: { type: String, required: true },
  stateName: { type: String, required: true },
  country: { type: String, default: 'India' },
  hasPtApplicable: { type: Boolean, default: true },
  hasLwfApplicable: { type: Boolean, default: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('StateMaster', StateMasterSchema);
