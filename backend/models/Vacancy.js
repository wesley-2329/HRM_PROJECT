const mongoose = require('mongoose');

const VacancySchema = new mongoose.Schema({
  positionId: {
    type: String,
    unique: true,
    sparse: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  dept: {
    type: String,
    required: true
  },
  managerId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Open', 'Filled', 'Cancelled', 'Hold', 'Pending Approval'],
    default: 'Open'
  },
  budget: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  priorityLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  requiredDate: {
    type: Date
  },
  vacancyReason: {
    type: String,
    default: ''
  },
  approvedHeadcount: {
    type: Number,
    default: 1
  },
  filledCount: {
    type: Number,
    default: 0
  },
  vacancyCount: {
    type: Number,
    default: 1
  },
  filledBy: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },
  approvals: [{
    approverId: String,
    approverName: String,
    status: { type: String, enum: ['Approved', 'Rejected', 'Hold'] },
    comments: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Vacancy', VacancySchema);
