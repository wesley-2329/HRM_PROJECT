const mongoose = require('mongoose');

const StatutoryReturnSchema = new mongoose.Schema({
  returnId: { type: String, required: true, unique: true },
  returnType: { type: String, enum: ['PF ECR', 'ESI Monthly Return', 'PT Return', 'LWF Return', 'Annual Factory Return', 'Annual Labour Return'], required: true },
  frequency: { type: String, enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'], default: 'Monthly' },
  period: { type: String, required: true }, // e.g. Jul 2026 or FY 2026-27
  state: { type: String, default: 'Karnataka' },
  filingDueDate: { type: Date, required: true },
  filingDate: { type: Date },
  ackNumber: { type: String, default: '' },
  receiptDocUrl: { type: String, default: '' },
  filingStatus: { type: String, enum: ['Pending Approval', 'Ready to File', 'Filed', 'Overdue', 'Rejected'], default: 'Ready to File' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('StatutoryReturn', StatutoryReturnSchema);
