const mongoose = require('mongoose');

const VacancyBudgetSchema = new mongoose.Schema({
  vacancyBudgetId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  vacantPositions: { type: Number, required: true, default: 1 },
  estimatedCostPerHire: { type: Number, default: 50000 },
  totalVacancyBudget: { type: Number, required: true, default: 50000 },
  status: { type: String, enum: ['Open', 'Allocated', 'Closed'], default: 'Open' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('VacancyBudget', VacancyBudgetSchema);
