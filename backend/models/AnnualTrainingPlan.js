const mongoose = require('mongoose');

const AnnualTrainingPlanSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true },
  year: { type: Number, required: true, default: 2026 },
  title: { type: String, required: true },
  allocatedBudget: { type: Number, required: true, default: 500000 },
  utilizedBudget: { type: Number, default: 0 },
  targetDepartments: [{ type: String }],
  plannedCoursesCount: { type: Number, default: 5 },
  status: {
    type: String,
    enum: ['Draft', 'Submitted for Approval', 'Approved', 'In Execution', 'Completed'],
    default: 'Approved'
  },
  approvedBy: { type: String, default: 'Board Management' }
}, { timestamps: true });

module.exports = mongoose.model('AnnualTrainingPlan', AnnualTrainingPlanSchema);
