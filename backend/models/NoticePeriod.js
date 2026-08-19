const mongoose = require('mongoose');

const NoticePeriodSchema = new mongoose.Schema({
  noticeId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  employeeId: { type: String, required: true },
  policyNoticeDays: { type: Number, required: true, default: 90 },
  actualServedDays: { type: Number, default: 90 },
  noticeStartDate: { type: Date, required: true },
  lastWorkingDay: { type: Date, required: true },
  remainingDays: { type: Number, default: 90 },
  earlyReleaseRequested: { type: Boolean, default: false },
  buyoutRequested: { type: Boolean, default: false },
  waiverRequested: { type: Boolean, default: false },
  buyoutDays: { type: Number, default: 0 },
  buyoutAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Early Release Approved', 'Buyout Approved', 'Completed'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('NoticePeriod', NoticePeriodSchema);
