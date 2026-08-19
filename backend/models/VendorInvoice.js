const mongoose = require('mongoose');

const VendorInvoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  vendorId: { type: String, required: true },
  vendorName: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  totalAmount: { type: Number, required: true, default: 0 },
  taxAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Pending Approval', 'Approved', 'Paid', 'Rejected'], default: 'Approved' },
  paymentDate: { type: Date },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('VendorInvoice', VendorInvoiceSchema);
