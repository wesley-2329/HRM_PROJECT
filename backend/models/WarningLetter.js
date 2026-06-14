const mongoose = require('mongoose');

const WarningLetterSchema = new mongoose.Schema({
  empId: {
    type: String,
    required: true
  },
  empName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Issued', 'Acknowledged'],
    default: 'Issued'
  }
}, { timestamps: true });

module.exports = mongoose.model('WarningLetter', WarningLetterSchema);
