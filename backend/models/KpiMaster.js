const mongoose = require('mongoose');

const KpiMasterSchema = new mongoose.Schema({
  kpiId: {
    type: String,
    required: true,
    unique: true
  },
  kpiName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  kraId: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  },
  measurementUnit: {
    type: String,
    default: 'Count / %'
  },
  weightage: {
    type: Number,
    default: 10
  },
  measurementMethod: {
    type: String,
    enum: ['Automated Metric', 'Manager Rating', 'Milestone Completion', 'Quarterly Audit'],
    default: 'Manager Rating'
  },
  frequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annually'],
    default: 'Annually'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('KpiMaster', KpiMasterSchema);
