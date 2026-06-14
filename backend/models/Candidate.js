const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  stage: {
    type: String,
    enum: ['applied', 'screening', 'interview', 'offered', 'selected', 'rejected'],
    default: 'applied'
  },
  offerReleased: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  notes: {
    type: String,
    default: ''
  },
  stageRejectedAt: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  interviewStage: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  currentPosition: {
    type: String,
    default: ''
  },
  currentCompany: {
    type: String,
    default: ''
  },
  lastSalary: {
    type: String,
    default: ''
  },
  workingStatus: {
    type: String,
    default: ''
  },
  skills: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', CandidateSchema);
