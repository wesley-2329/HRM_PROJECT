const mongoose = require('mongoose');

const WelfareBudgetSchema = new mongoose.Schema({
  welfareBudgetId: { type: String, required: true, unique: true },
  financialYear: { type: String, required: true },
  department: { type: String, required: true },
  costCenter: { type: String, required: true },
  welfareCategory: { type: String, enum: [
    'Food & Canteen', 'Transportation', 'Accommodation', 'Uniform & PPE',
    'Health Check-up', 'Medical Camps', 'Insurance', 'Employee Assistance Program',
    'Sports & Recreation', 'Employee Engagement', 'Festival Celebrations',
    'Gifts & Awards', 'CSR Welfare', 'Miscellaneous'
  ], required: true },
  proposedBudget: { type: Number, required: true, default: 0 },
  approvedBudget: { type: Number, required: true, default: 0 },
  utilizedBudget: { type: Number, default: 0 },
  remainingBudget: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Submitted', 'Approved', 'Rejected'], default: 'Approved' },
  remarks: { type: String, default: '' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('WelfareBudget', WelfareBudgetSchema);
