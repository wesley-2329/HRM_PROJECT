const mongoose = require('mongoose');

const ResumeAnalysisSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    sparse: true
  },
  candidateName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    default: 'pdf'
  },
  parsedSkills: [{ type: String }],
  parsedQualifications: [{ type: String }],
  experienceYears: {
    type: Number,
    default: 0
  },
  parsedCertifications: [{ type: String }],
  extractedText: {
    type: String,
    default: ''
  },
  targetRole: {
    type: String,
    default: ''
  },
  jdMatchScore: {
    type: Number,
    default: 0 // 0-100%
  },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  skillGapAnalysis: {
    type: String,
    default: ''
  },
  rankingScore: {
    type: Number,
    default: 0
  },
  isDuplicate: {
    type: Boolean,
    default: false
  },
  duplicateCandidateId: {
    type: String,
    default: ''
  },
  recruiterRemarks: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Parsed', 'Shortlisted', 'Interview Triggered', 'Rejected', 'Hold'],
    default: 'Parsed'
  },
  interviewTriggered: {
    type: Boolean,
    default: false
  },
  interviewDate: {
    type: Date,
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  created_by: {
    type: String,
    default: 'System'
  },
  updated_by: {
    type: String,
    default: 'System'
  }
}, { timestamps: true });

module.exports = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);
