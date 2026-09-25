const mongoose = require('mongoose');

const TimesheetSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  clockIn: {
    type: Date,
    required: true
  },
  clockOut: {
    type: Date,
    default: null
  },
  legacyTimezoneUncertain: {
    type: Boolean,
    default: false
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

// Prevent duplicate active shifts at the MongoDB database level
TimesheetSchema.index(
  { empId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'Active Shift' } }
);

module.exports = mongoose.model('Timesheet', TimesheetSchema);
