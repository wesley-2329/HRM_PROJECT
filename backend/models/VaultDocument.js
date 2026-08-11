const mongoose = require('mongoose');

const VaultDocumentSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  documentName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Identity'
  },
  status: {
    type: String,
    enum: ['Pending Approval', 'Approved', 'Rejected', 'Expired'],
    default: 'Pending Approval'
  },
  expiryDate: {
    type: Date
  },
  expiryNotified: {
    type: Boolean,
    default: false
  },
  versions: [{
    versionNumber: {
      type: Number,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    changeSummary: {
      type: String,
      default: ''
    }
  }],
  approvalWorkflow: {
    approvedBy: {
      type: String,
      default: ''
    },
    approvedByName: {
      type: String,
      default: ''
    },
    approvedAt: {
      type: Date
    },
    comments: {
      type: String,
      default: ''
    }
  },
  auditTrail: [{
    action: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: String,
      default: ''
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('VaultDocument', VaultDocumentSchema);
