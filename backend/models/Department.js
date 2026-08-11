const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  parentDept: {
    type: String,
    default: ''
  },
  managerId: {
    type: String,
    default: ''
  },
  businessUnit: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  costCenter: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  budget: {
    type: Number,
    default: 0
  },
  departmentHead: {
    type: String,
    default: ''
  },
  objectives: [{
    type: String
  }],
  projects: [{
    type: String
  }],
  employeeCount: {
    type: Number,
    default: 0
  },
  vacancies: {
    type: Number,
    default: 0
  },
  assets: [{
    type: String
  }],
  performance: {
    rating: { type: Number, default: 0 },
    lastEvaluated: { type: Date }
  },
  cost: {
    type: Number,
    default: 0
  },
  capacity: {
    type: Number,
    default: 0
  },
  departmentKPI: [{
    kpiName: { type: String },
    target: { type: String },
    actual: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);
