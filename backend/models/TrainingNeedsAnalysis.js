const mongoose = require('mongoose');

const TrainingNeedsAnalysisSchema = new mongoose.Schema({
  tnaId: { type: String, required: true, unique: true },
  employee: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    dept: { type: String, default: '' },
    designation: { type: String, default: '' }
  },
  skillGapCategory: { type: String, required: true }, // Technical, Leadership, Compliance, Soft Skills
  requestedSkill: { type: String, required: true },
  currentProficiency: { type: Number, min: 1, max: 5, default: 2 },
  targetProficiency: { type: Number, min: 1, max: 5, default: 4 },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  targetQuarter: { type: String, default: 'Q3-2026' },
  justification: { type: String, required: true },
  status: {
    type: String,
    enum: ['Requested', 'Manager Approved', 'HR Approved', 'Scheduled', 'Completed', 'Rejected'],
    default: 'Requested'
  },
  managerComments: { type: String, default: '' },
  hrComments: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('TrainingNeedsAnalysis', TrainingNeedsAnalysisSchema);
