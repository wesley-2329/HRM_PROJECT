const mongoose = require('mongoose');

const BudgetAllocationSchema = new mongoose.Schema({
  allocationId: { type: String, required: true, unique: true },
  budgetId: { type: String, required: true },
  financialYear: { type: String, required: true },
  department: { type: String, required: true },
  costCenter: { type: String, required: true },
  category: { type: String, required: true },
  allocatedAmount: { type: Number, required: true, default: 0 },
  utilizedAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  utilizationPercentage: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Transferred', 'Frozen', 'Released'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('BudgetAllocation', BudgetAllocationSchema);
