const mongoose = require('mongoose');

const CompanyPolicySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  lastUpdatedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  history: [{
    version: {
      type: Number,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    effectiveDate: {
      type: Date,
      default: Date.now
    },
    lastUpdatedDate: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String,
      required: true
    },
    changeSummary: {
      type: String,
      default: ''
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('CompanyPolicy', CompanyPolicySchema);
