const mongoose = require('mongoose');

const TalentPoolSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    required: true,
    unique: true
  },
  candidateName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  primaryRole: {
    type: String,
    required: true
  },
  talentCategory: {
    type: String,
    enum: ['Silver Medalist', 'Leadership', 'Niche Tech', 'Future Prospect', 'General Talent'],
    default: 'General Talent'
  },
  skills: [{ type: String }],
  experienceYears: {
    type: Number,
    default: 0
  },
  experienceCategory: {
    type: String,
    enum: ['0-2 Years', '3-5 Years', '5-10 Years', '10+ Years'],
    default: '0-2 Years'
  },
  candidateMatchRating: {
    type: Number,
    default: 3 // 1-5 rating
  },
  recruiterRecommendation: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Archived', 'Reactivated', 'Expired'],
    default: 'Active'
  },
  expiryDate: {
    type: Date,
    required: true
  },
  lastContactedDate: {
    type: Date,
    default: Date.now
  },
  reactivationHistory: [{
    reactivatedBy: String,
    reactivatedDate: { type: Date, default: Date.now },
    reason: String
  }],
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

module.exports = mongoose.model('TalentPool', TalentPoolSchema);
