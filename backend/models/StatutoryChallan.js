const mongoose = require('mongoose');

const StatutoryChallanSchema = new mongoose.Schema({
  challanId: { type: String, required: true, unique: true },
  challanNumber: { type: String, required: true },
  statutoryType: { type: String, enum: ['PF', 'ESI', 'PT', 'LWF'], required: true },
  wageMonth: { type: String, required: true },
  state: { type: String, default: 'Karnataka' },
  dueDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true, default: 0 },
  employeeCount: { type: Number, default: 1 },
  bankReferenceNo: { type: String, default: '' },
  paymentMode: { type: String, enum: ['Net Banking', 'NEFT/RTGS', 'Challan', 'Corporate Banking'], default: 'Net Banking' },
  paymentDate: { type: Date },
  paymentStatus: { type: String, enum: ['Generated', 'Pending Approval', 'Paid', 'Overdue', 'Failed'], default: 'Generated' },
  interestAmount: { type: Number, default: 0 },
  penaltyAmount: { type: Number, default: 0 },
  receiptDocUrl: { type: String, default: '' },
  organizationId: { type: String, default: 'ORG-001' },
  createdBy: { type: String, default: 'Payroll Exec' }
}, { timestamps: true });

module.exports = mongoose.model('StatutoryChallan', StatutoryChallanSchema);
