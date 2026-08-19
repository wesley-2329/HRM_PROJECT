const mongoose = require('mongoose');

const ExitAuditLogSchema = new mongoose.Schema({
  auditId: { type: String, required: true, unique: true },
  action: { type: String, required: true },
  module: { type: String, default: 'Exit Workflow & F&F' },
  entityId: { type: String, default: '' },
  entityType: { type: String, default: '' },
  performedBy: { type: String, required: true },
  userRole: { type: String, default: 'HR Manager' },
  changes: { type: String, default: '' },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ExitAuditLog', ExitAuditLogSchema);
