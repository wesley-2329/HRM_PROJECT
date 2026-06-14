const mongoose = require('mongoose');

const DailyReportSchema = new mongoose.Schema({
  empId: {
    type: String,
    required: true
  },
  empName: {
    type: String,
    required: true
  },
  empEmail: {
    type: String,
    required: true
  },
  teamLeadId: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    required: true
  },
  tasksCompleted: {
    type: String,
    required: true
  },
  blockers: {
    type: String,
    default: ''
  },
  hoursWorked: {
    type: Number,
    default: 8
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Reviewed'],
    default: 'Pending Review'
  },
  reviewFeedback: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('DailyReport', DailyReportSchema);
