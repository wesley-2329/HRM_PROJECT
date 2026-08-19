const mongoose = require('mongoose');

const ComplianceAlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'High' },
  isAcknowledged: { type: Boolean, default: false },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ComplianceAlert', ComplianceAlertSchema);
