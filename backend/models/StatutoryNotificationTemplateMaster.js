const mongoose = require('mongoose');

const StatutoryNotificationTemplateMasterSchema = new mongoose.Schema({
  templateId: { type: String, required: true, unique: true },
  templateCode: { type: String, required: true },
  triggerEvent: { type: String, required: true }, // Due Date Reminder, Notice Received, Challan Generated
  title: { type: String, required: true },
  body: { type: String, required: true },
  channel: { type: String, enum: ['In-App', 'Email', 'SMS', 'Push', 'Teams', 'Slack'], default: 'In-App' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('StatutoryNotificationTemplateMaster', StatutoryNotificationTemplateMasterSchema);
