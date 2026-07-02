const mongoose = require('mongoose');

const DepartmentTransferHistorySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  oldDept: {
    type: String,
    default: ''
  },
  newDept: {
    type: String,
    required: true
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

module.exports = mongoose.model('DepartmentTransferHistory', DepartmentTransferHistorySchema);
