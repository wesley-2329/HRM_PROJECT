const mongoose = require('mongoose');

const DueDateMasterSchema = new mongoose.Schema({
  dueDateId: { type: String, required: true, unique: true },
  statutoryType: { type: String, enum: ['PF', 'ESI', 'PT', 'LWF', 'Factory Return', 'Labour Return'], required: true },
  frequency: { type: String, enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'], default: 'Monthly' },
  dueDayOfMonth: { type: Number, default: 15 }, // e.g. 15th of month for PF/ESI
  graceDays: { type: Number, default: 0 },
  reminderDaysBefore: [{ type: Number }], // [30, 15, 7, 3, 1]
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('DueDateMaster', DueDateMasterSchema);
