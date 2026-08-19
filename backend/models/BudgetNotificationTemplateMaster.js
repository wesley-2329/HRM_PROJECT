const mongoose = require('mongoose');

const BudgetNotificationTemplateMasterSchema = new mongoose.Schema({
  templateId: { type: String, required: true, unique: true },
  templateCode: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  channel: { type: String, enum: ['In-App', 'Email', 'SMS', 'Push', 'Teams', 'Slack'], default: 'In-App' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('BudgetNotificationTemplateMaster', BudgetNotificationTemplateMasterSchema);
