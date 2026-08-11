const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  project: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    required: true
  },
  due: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  empId: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
