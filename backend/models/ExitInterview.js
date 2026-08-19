const mongoose = require('mongoose');

const ExitInterviewSchema = new mongoose.Schema({
  interviewId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  interviewerId: { type: String, default: '' },
  interviewerName: { type: String, default: 'HR Manager' },
  scheduledDate: { type: Date, default: Date.now },
  overallSatisfactionScore: { type: Number, default: 4 }, // Scale 1-5
  primaryReason: { type: String, required: true },
  feedbackComments: { type: String, default: '' },
  confidentialRemarks: { type: String, default: '' },
  recommendRehire: { type: Boolean, default: true },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Skipped'], default: 'Completed' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ExitInterview', ExitInterviewSchema);
