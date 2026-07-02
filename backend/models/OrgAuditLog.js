const mongoose = require('mongoose');

const OrgAuditLogSchema = new mongoose.Schema({
  actorId: {
    type: String,
    required: true
  },
  actorName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  oldValues: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newValues: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  browser: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  },
  reason: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('OrgAuditLog', OrgAuditLogSchema);
