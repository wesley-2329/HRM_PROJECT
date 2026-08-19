const mongoose = require('mongoose');

const ResignationRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  reasonCategory: { type: String, required: true },
  reasonDetails: { type: String, default: '' },
  proposedLwd: { type: Date, required: true },
  documentUrl: { type: String, default: '' },
  remarks: { type: String, default: '' },
  status: { type: String, enum: ['Submitted', 'Manager Review', 'HR Review', 'Approved', 'Rejected', 'Withdrawn'], default: 'Submitted' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ResignationRequest', ResignationRequestSchema);
