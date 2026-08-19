const mongoose = require('mongoose');

const GovernmentNoticeSchema = new mongoose.Schema({
  noticeId: { type: String, required: true, unique: true },
  noticeNumber: { type: String, required: true },
  department: { type: String, enum: ['EPFO', 'ESIC', 'Labor Department', 'Factory Inspectorate', 'Tax Authority'], required: true },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['High', 'Critical', 'Normal'], default: 'High' },
  assignedOfficer: { type: String, default: 'Compliance Officer' },
  description: { type: String, default: '' },
  documentUrl: { type: String, default: '' },
  replyDocumentUrl: { type: String, default: '' },
  status: { type: String, enum: ['Received', 'Under Review', 'Replied', 'Closed'], default: 'Received' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('GovernmentNotice', GovernmentNoticeSchema);
