const mongoose = require('mongoose');

const DueDateTrackerSchema = new mongoose.Schema({
  trackerId: { type: String, required: true, unique: true },
  complianceName: { type: String, required: true },
  dueDate: { type: Date, required: true },
  daysRemaining: { type: Number, default: 15 },
  responsibleOfficer: { type: String, default: 'Compliance Manager' },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'High' },
  reminderTier: { type: String, enum: ['30 Days', '15 Days', '7 Days', '3 Days', '1 Day', 'Overdue'], default: '15 Days' },
  status: { type: String, enum: ['Pending', 'Completed', 'Escalated', 'Overdue'], default: 'Pending' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('DueDateTracker', DueDateTrackerSchema);
