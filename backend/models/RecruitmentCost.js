const mongoose = require('mongoose');

const RecruitmentCostSchema = new mongoose.Schema({
  costId: {
    type: String,
    required: true,
    unique: true
  },
  reqNumber: {
    type: String,
    default: ''
  },
  candidateId: {
    type: String,
    default: ''
  },
  costCategory: {
    type: String,
    enum: ['Job Portal', 'Consultancy', 'Advertising', 'Interview Travel', 'Assessment Tool', 'Vendor Fee', 'Miscellaneous'],
    required: true
  },
  vendorName: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    required: true
  },
  costCenter: {
    type: String,
    default: 'CC-101'
  },
  recruiterId: {
    type: String,
    default: ''
  },
  recruiterName: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  expenseDate: {
    type: Date,
    default: Date.now
  },
  invoiceNumber: {
    type: String,
    default: ''
  },
  financeApprovalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Approved'
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid', 'Processing'],
    default: 'Paid'
  },
  description: {
    type: String,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  created_by: {
    type: String,
    default: 'System'
  },
  updated_by: {
    type: String,
    default: 'System'
  }
}, { timestamps: true });

module.exports = mongoose.model('RecruitmentCost', RecruitmentCostSchema);
