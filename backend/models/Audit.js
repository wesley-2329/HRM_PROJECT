const mongoose = require('mongoose');

const AuditChecklistItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  question: { type: String, required: true },
  complianceRequirement: { type: String, required: true },
  status: { type: String, enum: ['Compliant', 'Non-Compliant', 'N/A'], default: 'Compliant' }
});

const AuditObservationSchema = new mongoose.Schema({
  observation: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  evidenceUrl: { type: String, default: '' }
});

const AuditActionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  responsiblePerson: { type: String, required: true },
  targetDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Resolved', 'Closed'], default: 'Pending' },
  closureRemarks: { type: String, default: '' },
  closureDate: { type: Date }
});

const AuditHistoryLogSchema = new mongoose.Schema({
  status: { type: String, required: true },
  notes: { type: String, default: '' },
  updatedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const AuditSchema = new mongoose.Schema({
  auditNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g. Statutory, Internal, External
  category: { type: String, required: true }, // e.g. HR, Payroll, Attendance, etc.
  date: { type: Date, required: true },
  department: { type: String, required: true },
  auditorName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Planned', 'In Progress', 'Observations Recorded', 'Actions Pending', 'Verification Pending', 'Closed'], 
    default: 'Planned' 
  },
  checklist: [AuditChecklistItemSchema],
  observations: [AuditObservationSchema],
  actions: [AuditActionSchema],
  closureRemarks: { type: String, default: '' },
  verificationNotes: { type: String, default: '' },
  approvedBy: { type: String, default: '' },
  closedAt: { type: Date },
  historyLog: [AuditHistoryLogSchema]
}, { timestamps: true });

module.exports = mongoose.model('Audit', AuditSchema);
