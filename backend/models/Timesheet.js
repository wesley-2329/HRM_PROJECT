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
  },
  remarks: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const parseToValidDate = (val, dateStr) => {
  if (!val) return val;
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) return val;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i;
    const match = trimmed.match(timeRegex);
    if (match) {
      let hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      const secs = match[3] ? parseInt(match[3], 10) : 0;
      const meridiem = match[4] ? match[4].toUpperCase() : null;
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      
      const baseDate = dateStr && !isNaN(new Date(dateStr).getTime()) ? new Date(dateStr) : new Date();
      baseDate.setHours(hours, mins, secs, 0);
      if (!isNaN(baseDate.getTime())) return baseDate;
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
};

TimesheetSchema.path('clockIn').set(function(val) {
  return parseToValidDate(val, this?.date);
});

TimesheetSchema.path('clockOut').set(function(val) {
  if (!val) return null;
  return parseToValidDate(val, this?.date);
});

TimesheetSchema.pre('validate', function(next) {
  if (this.clockIn) {
    this.clockIn = parseToValidDate(this.clockIn, this.date);
  } else {
    this.clockIn = new Date();
  }
  if (this.clockOut) {
    this.clockOut = parseToValidDate(this.clockOut, this.date);
  }
  next();
});

// Prevent duplicate active shifts at the MongoDB database level
TimesheetSchema.index(
  { empId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'Active Shift' } }
);

module.exports = mongoose.model('Timesheet', TimesheetSchema);
