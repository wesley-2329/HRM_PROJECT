const mongoose = require('mongoose');

const PolicyAcknowledgementSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyPolicy',
    required: true
  },
  policyName: {
    type: String,
    required: true
  },
  policyVersion: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Accepted', 'Pending'],
    default: 'Pending'
  },
  acceptedAt: {
    type: Date
  }
}, { timestamps: true });

// Prevent duplicate pending entries for the same version and employee
PolicyAcknowledgementSchema.index({ employeeId: 1, policyName: 1, policyVersion: 1 }, { unique: true });

module.exports = mongoose.model('PolicyAcknowledgement', PolicyAcknowledgementSchema);
