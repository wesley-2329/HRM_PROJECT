const mongoose = require('mongoose');

const WelfareExpenseSchema = new mongoose.Schema({
  expenseId: { type: String, required: true, unique: true },
  welfareActivity: { type: String, required: true },
  welfareCategory: { type: String, required: true },
  vendorId: { type: String, default: '' },
  vendorName: { type: String, default: '' },
  expenseDate: { type: Date, default: Date.now },
  invoiceNumber: { type: String, default: '' },
  invoiceAmount: { type: Number, required: true, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Approved', 'Paid', 'Rejected'], default: 'Paid' },
  supportingDocUrl: { type: String, default: '' },
  beneficiariesCount: { type: Number, default: 0 },
  avgCostPerEmp: { type: Number, default: 0 },
  deptParticipation: { type: String, default: 'All Departments' },
  status: { type: String, default: 'Approved' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('WelfareExpense', WelfareExpenseSchema);
