const mongoose = require('mongoose');

const TrainingProgramSchema = new mongoose.Schema({
  programId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Technical & Engineering', 'Leadership & Management', 'Compliance & Safety', 'Soft Skills & Communication', 'Product & Agile'],
    required: true
  },
  mode: { type: String, enum: ['Classroom', 'Virtual / Webinar', 'E-Learning Self-Paced'], default: 'Classroom' },
  durationHours: { type: Number, required: true, default: 8 },
  trainer: {
    id: { type: String, default: '' },
    name: { type: String, required: true },
    type: { type: String, enum: ['Internal', 'External'], default: 'Internal' }
  },
  venue: {
    name: { type: String, default: 'Conference Room Alpha' },
    location: { type: String, default: 'HQ Bangalore' },
    link: { type: String, default: '' }
  },
  capacity: { type: Number, default: 25 },
  enrolledEmployees: [{
    id: String,
    name: String,
    dept: String,
    status: { type: String, enum: ['Nominated', 'Confirmed', 'Attended', 'Completed', 'Cancelled'], default: 'Nominated' }
  }],
  scheduleDate: { type: Date, required: true },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Postponed', 'Cancelled'],
    default: 'Scheduled'
  }
}, { timestamps: true });

module.exports = mongoose.model('TrainingProgram', TrainingProgramSchema);
