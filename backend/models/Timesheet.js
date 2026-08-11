const mongoose = require('mongoose');

const TimesheetSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  clockIn: {
    type: String,
    required: true
  },
  clockOut: {
    type: String,
    default: ''
  },
  hours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Punctual', 'Late Entry', 'Early Out', 'Logged Out', 'Active Shift'],
    default: 'Active Shift'
  },
  empId: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Timesheet', TimesheetSchema);
