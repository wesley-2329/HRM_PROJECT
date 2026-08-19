const mongoose = require('mongoose');

const SecurityClearanceSchema = new mongoose.Schema({
  securityClearanceId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  employeeId: { type: String, required: true },
  idCardReturned: { type: Boolean, default: false },
  accessCardRevoked: { type: Boolean, default: false },
  biometricRevoked: { type: Boolean, default: false },
  gatePassIssued: { type: Boolean, default: false },
  isCleared: { type: Boolean, default: false },
  clearedBy: { type: String, default: 'Security Officer' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('SecurityClearance', SecurityClearanceSchema);
