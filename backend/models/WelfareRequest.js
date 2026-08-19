const mongoose = require('mongoose');

const WelfareRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  welfareType: {
    type: String,
    enum: ['Medical Assistance', 'Education Support', 'Travel Support', 'Emergency Fund', 'Festival Benefits', 'Employee Welfare'],
    required: true
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  requestedBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    dept: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['Submitted', 'HR Verified', 'Management Approved', 'Benefit Issued', 'Rejected'],
    default: 'Submitted'
  },
  approvalRemarks: { type: String, default: '' },
  verifier: { type: String, default: '' },
  approver: { type: String, default: '' },
  history: [{
    status: String,
    updatedBy: String,
    timestamp: { type: Date, default: Date.now },
    remarks: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('WelfareRequest', WelfareRequestSchema);
