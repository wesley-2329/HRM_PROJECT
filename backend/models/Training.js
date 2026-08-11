const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  assignedBy: {
    type: String,
    default: 'HR Manager'
  },
  deadline: {
    type: String,
    default: ''
  },
  progress: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  empId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'attended'],
    default: 'assigned'
  },
  trainer: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: ''
  },
  review: {
    type: String,
    default: ''
  },
  certificate: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  }
}, { timestamps: true });

module.exports = mongoose.model('Training', TrainingSchema);
