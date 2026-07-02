const mongoose = require('mongoose');

const OrgPolicySchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Promotion', 'Transfer', 'Reporting', 'Delegation', 'Department', 'Organization'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rules: [{
    ruleKey: { type: String, required: true },
    ruleValue: { type: String, required: true },
    description: { type: String }
  }],
  version: {
    type: Number,
    default: 1
  },
  active: {
    type: Boolean,
    default: true
  },
  history: [{
    version: { type: Number },
    updatedBy: { type: String },
    rules: [{
      ruleKey: { type: String },
      ruleValue: { type: String },
      description: { type: String }
    }],
    changeLog: { type: String },
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('OrgPolicy', OrgPolicySchema);
