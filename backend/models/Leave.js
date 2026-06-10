const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  empId: {
    type: String,
    required: true
  },
  empName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Casual', 'Sick', 'Earned'],
    required: true
  },
  start: {
    type: String,
    required: true
  },
  end: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Leave', LeaveSchema);
