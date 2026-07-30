const mongoose = require('mongoose');

const ActionUpdateSchema = new mongoose.Schema({
  progressStatus: { type: String, required: true },
  completionPercentage: { type: Number, default: 0 },
  updateNotes: { type: String, required: true },
  evidenceUrl: { type: String, default: '' },
  updatedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ActionHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedBy: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
});

const ActionAuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorName: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ActionClosureTrackerSchema = new mongoose.Schema({
  observationId: { type: String, required: true, unique: true }, // Format: ACT-2026-XXXX
  observationType: {
    type: String,
    enum: ['Audit Observation', 'Compliance Observation', 'Safety Observation', 'HR Observation', 'Employee Complaint', 'Improve Suggestion'],
    default: 'Audit Observation'
  },
  department: { type: String, required: true },
  description: { type: String, required: true },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Pending Verification', 'Closed', 'Reopened'],
    default: 'Open'
  },
  creatorId: { type: String, required: true },
  creatorName: { type: String, required: true },

  // Assignment Section
  assignedToId: { type: String, default: '' },
  assignedToName: { type: String, default: '' },
  responsibleDepartment: { type: String, default: '' },
  dueDate: { type: Date, required: true }, // Mandatory Due Date
  reviewerId: { type: String, default: '' },
  reviewerName: { type: String, default: '' },
  remarks: { type: String, default: '' },

  // Updates & Attachments Section
  updates: [ActionUpdateSchema],

  // Verification & Closure Section
  verificationRemarks: { type: String, default: '' },
  closureApprovedBy: { type: String, default: '' },
  closureDate: { type: Date },
  reopenReason: { type: String, default: '' },

  history: [ActionHistorySchema],
  auditLog: [ActionAuditLogSchema]
}, { timestamps: true });

module.exports = mongoose.model('ActionClosureTracker', ActionClosureTrackerSchema);
