const mongoose = require('mongoose');

const ItClearanceSchema = new mongoose.Schema({
  itClearanceId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  employeeId: { type: String, required: true },
  emailRevoked: { type: Boolean, default: false },
  vpnRevoked: { type: Boolean, default: false },
  erpRevoked: { type: Boolean, default: false },
  hrmsRevoked: { type: Boolean, default: false },
  adRevoked: { type: Boolean, default: false },
  cloudRevoked: { type: Boolean, default: false },
  licensesRevoked: { type: Boolean, default: false },
  isCleared: { type: Boolean, default: false },
  clearedBy: { type: String, default: 'IT Administrator' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ItClearance', ItClearanceSchema);
