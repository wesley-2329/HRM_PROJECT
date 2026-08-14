const mongoose = require('mongoose');

const LearningHistorySchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  programId: { type: String, required: true },
  programTitle: { type: String, required: true },
  category: { type: String, default: 'Technical' },
  completionDate: { type: Date, default: Date.now },
  scoreObtained: { type: Number, default: 85 },
  status: { type: String, enum: ['Completed', 'Passed with Distinction', 'In Progress', 'Failed'], default: 'Completed' },
  certificateUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('LearningHistory', LearningHistorySchema);
