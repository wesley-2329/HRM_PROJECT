const mongoose = require('mongoose');

const CompetencyMasterSchema = new mongoose.Schema({
  competencyCode: {
    type: String,
    required: true,
    unique: true
  },
  competencyName: {
    type: String,
    required: true
  },
  competencyType: {
    type: String,
    enum: ['Core', 'Functional', 'Behavioural', 'Leadership'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: 'All'
  },
  designation: {
    type: String,
    default: 'All'
  },
  grade: {
    type: String,
    default: 'All'
  },
  weightage: {
    type: Number,
    default: 15
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  created_by: {
    type: String,
    default: 'System Admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('CompetencyMaster', CompetencyMasterSchema);
