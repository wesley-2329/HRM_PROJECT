const mongoose = require('mongoose');

const FinancialYearMasterSchema = new mongoose.Schema({
  yearId: { type: String, required: true, unique: true },
  financialYear: { type: String, required: true }, // e.g. FY 2026-2027
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Open', 'Closed', 'Upcoming', 'Locked'], default: 'Open' },
  isCurrent: { type: Boolean, default: true },
  description: { type: String, default: '' },
  organizationId: { type: String, default: 'ORG-001' },
  createdBy: { type: String, default: 'System' },
  updatedBy: { type: String, default: 'System' }
}, { timestamps: true });

module.exports = mongoose.model('FinancialYearMaster', FinancialYearMasterSchema);
