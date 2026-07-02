const mongoose = require('mongoose');

const EmployeeReportingHistorySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  oldManagerId: {
    type: String,
    default: ''
  },
  newManagerId: {
    type: String,
    default: ''
  },
  oldFunctionalManagerId: {
    type: String,
    default: ''
  },
  newFunctionalManagerId: {
    type: String,
    default: ''
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  reason: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeReportingHistory', EmployeeReportingHistorySchema);
