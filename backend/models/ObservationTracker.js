const mongoose = require('mongoose');

const ObsHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedBy: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
});

const ObsAuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorName: { type: String, required: true },
  details: { type: String, required: true },
  oldValues: { type: mongoose.Schema.Types.Mixed, default: null },
  newValues: { type: mongoose.Schema.Types.Mixed, default: null },
  timestamp: { type: Date, default: Date.now }
});

const ObservationTrackerSchema = new mongoose.Schema({
  observationId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['HR', 'Compliance', 'Safety', 'Quality', 'Production', 'Admin', 'Finance', 'Custom'],
    default: 'HR'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'Assigned', 'In Progress', 'Under Review', 'Closed', 'Reopened'],
    default: 'Open'
  },
  creatorId: { type: String, required: true },
  creatorName: { type: String, required: true },
  
  // Assignment section
  assigneeId: { type: String, default: '' },
  assigneeName: { type: String, default: '' },
  assignmentDate: { type: Date },
  dueDate: { type: Date, required: true }, // Mandatory Due Date

  // Action taken section
  correctiveAction: { type: String, default: '' },
  rootCause: { type: String, default: '' },
  preventiveAction: { type: String, default: '' },
  completionDate: { type: Date },
  evidenceUrl: { type: String, default: '' },

  // Verification & Closure section
  verificationComments: { type: String, default: '' },
  closureDate: { type: Date },
  reopenReason: { type: String, default: '' },

  history: [ObsHistorySchema],
  auditLog: [ObsAuditLogSchema]
}, { timestamps: true });

module.exports = mongoose.model('ObservationTracker', ObservationTrackerSchema);
