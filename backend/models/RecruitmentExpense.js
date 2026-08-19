const mongoose = require('mongoose');

const RecruitmentExpenseSchema = new mongoose.Schema({
  expenseId: { type: String, required: true, unique: true },
  recruitmentBudgetId: { type: String, default: '' },
  expenseCategory: { type: String, enum: [
    'Job Portal Subscription', 'Recruitment Agency', 'Advertisement', 'Social Media Campaign',
    'Campus Hiring', 'Job Fair', 'Referral Bonus', 'Background Verification',
    'Candidate Travel', 'Interview Expenses', 'Assessment Tools', 'Medical Examination',
    'Joining Kit', 'Miscellaneous'
  ], required: true },
  vendorId: { type: String, default: '' },
  vendorName: { type: String, default: '' },
  invoiceNumber: { type: String, default: '' },
  expenseDate: { type: Date, default: Date.now },
  amount: { type: Number, required: true, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Approved', 'Paid', 'Rejected'], default: 'Paid' },
  hiringSource: { type: String, default: 'Agency' },
  costPerHire: { type: Number, default: 0 },
  supportingDocUrl: { type: String, default: '' },
  status: { type: String, default: 'Approved' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('RecruitmentExpense', RecruitmentExpenseSchema);
