const mongoose = require('mongoose');

const DesignationHistorySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  oldDesignation: {
    type: String,
    default: ''
  },
  newDesignation: {
    type: String,
    required: true
  },
  oldGrade: {
    type: String,
    default: ''
  },
  newGrade: {
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

module.exports = mongoose.model('DesignationHistory', DesignationHistorySchema);
