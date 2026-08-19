const mongoose = require('mongoose');

const KraMasterSchema = new mongoose.Schema({
  kraId: {
    type: String,
    required: true,
    unique: true
  },
  kraName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  goalCategory: {
    type: String,
    enum: ['Financial', 'Customer', 'Internal Process', 'Learning & Growth', 'Strategic'],
    default: 'Strategic'
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
    default: 20
  },
  targetValue: {
    type: String,
    default: '100%'
  },
  unitOfMeasurement: {
    type: String,
    default: 'Percentage'
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

module.exports = mongoose.model('KraMaster', KraMasterSchema);
