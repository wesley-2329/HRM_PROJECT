const mongoose = require('mongoose');

const EngagementAuditLogSchema = new mongoose.Schema({
  moduleName: { type: String, default: 'Employee Experience & Engagement' },
  entityType: { type: String, required: true }, // Suggestion, Grievance, Helpdesk, Welfare, Recognition, Communication
  entityId: { type: String, required: true },
  action: { type: String, required: true }, // Submitted, Assigned, Approved, Resolved, Published, Read, Acknowledged
  performedBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: '' }
  },
  previousState: { type: String, default: '' },
  newState: { type: String, default: '' },
  comments: { type: String, default: '' },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('EngagementAuditLog', EngagementAuditLogSchema);
