const mongoose = require('mongoose');

const StatutoryPaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  challanId: { type: String, required: true },
  statutoryType: { type: String, enum: ['PF', 'ESI', 'PT', 'LWF'], required: true },
  amountPaid: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  transactionRef: { type: String, required: true },
  bankName: { type: String, default: 'HDFC Bank' },
  approvedBy: { type: String, default: 'Finance Manager' },
  status: { type: String, enum: ['Success', 'Processing', 'Failed'], default: 'Success' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('StatutoryPayment', StatutoryPaymentSchema);
