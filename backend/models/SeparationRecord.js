const mongoose = require('mongoose');

const SeparationRecordSchema = new mongoose.Schema({
  separationId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  separationDate: { type: Date, required: true }, // Last Working Day
  tenureYears: { type: Number, default: 0 },
  exitType: { type: String, default: 'Resignation' },
  status: { type: String, enum: ['Processing', 'Separated', 'Archived'], default: 'Separated' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('SeparationRecord', SeparationRecordSchema);
