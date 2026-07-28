const mongoose = require('mongoose');

const GradeMasterSchema = new mongoose.Schema({
  gradeCode: {
    type: String,
    required: true,
    unique: true
  },
  gradeName: {
    type: String,
    required: true,
    unique: true
  },
  gradeDescription: {
    type: String,
    default: ''
  },
  gradeLevel: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('GradeMaster', GradeMasterSchema);
