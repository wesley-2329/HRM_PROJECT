const mongoose = require('mongoose');

const BudgetNotificationLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  recipientId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  channel: { type: String, enum: ['In-App', 'Email', 'SMS', 'Push', 'Teams', 'Slack'], default: 'In-App' },
  triggerEvent: { type: String, required: true }, // Budget Created, Threshold Exceeded, Invoice Approved, etc.
  isRead: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('BudgetNotificationLog', BudgetNotificationLogSchema);
