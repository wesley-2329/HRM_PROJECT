const mongoose = require('mongoose');

const ComplianceCalendarSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  statutoryType: { type: String, enum: ['PF', 'ESI', 'PT', 'LWF', 'Factory Act', 'Labor Notice'], required: true },
  dueDate: { type: Date, required: true },
  frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'], default: 'Monthly' },
  responsibleOfficer: { type: String, default: 'Compliance Officer' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
  status: { type: String, enum: ['Upcoming', 'Completed', 'Overdue'], default: 'Upcoming' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ComplianceCalendar', ComplianceCalendarSchema);
