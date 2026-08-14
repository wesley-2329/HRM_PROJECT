const mongoose = require('mongoose');

const TrainingAuditLogSchema = new mongoose.Schema({
  moduleName: { type: String, default: 'Training & Competency Evaluation' },
  entityType: { type: String, required: true }, // TNA, AnnualPlan, Program, SkillMatrix, Competency, Certificate
  entityId: { type: String, required: true },
  action: { type: String, required: true },
  performedBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: '' }
  },
  previousState: { type: String, default: '' },
  newState: { type: String, default: '' },
  comments: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('TrainingAuditLog', TrainingAuditLogSchema);
