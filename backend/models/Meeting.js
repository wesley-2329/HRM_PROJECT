const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  host: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'Online'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Attended', 'Missed'],
    default: 'Scheduled'
  },
  notes: {
    type: String,
    default: ''
  },
  empId: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);
