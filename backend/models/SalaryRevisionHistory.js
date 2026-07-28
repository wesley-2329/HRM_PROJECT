const mongoose = require('mongoose');

const SalaryRevisionHistorySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  oldSalary: {
    type: Number,
    required: true,
    default: 0
  },
  newSalary: {
    type: Number,
    required: true,
    default: 0
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  approvedBy: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    default: 'Promotion revision'
  }
}, { timestamps: true });

module.exports = mongoose.model('SalaryRevisionHistory', SalaryRevisionHistorySchema);
