const mongoose = require('mongoose');

const BudgetRevisionSchema = new mongoose.Schema({
  revisionId: { type: String, required: true, unique: true },
  budgetId: { type: String, required: true },
  revisionNumber: { type: Number, required: true, default: 1 },
  previousBudget: { type: Number, required: true },
  newBudget: { type: Number, required: true },
  revisionType: { type: String, enum: ['Increase', 'Decrease', 'Reallocation', 'Correction'], default: 'Increase' },
  reason: { type: String, required: true },
  requestedBy: { type: String, default: 'HR Manager' },
  approvedBy: { type: String, default: 'Finance Director' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('BudgetRevision', BudgetRevisionSchema);
