const mongoose = require('mongoose');

const ForecastDataSchema = new mongoose.Schema({
  forecastId: { type: String, required: true, unique: true },
  budgetId: { type: String, required: true },
  financialYear: { type: String, required: true },
  period: { type: String, enum: ['Monthly', 'Quarterly', 'Annual'], default: 'Annual' },
  scenario: { type: String, enum: ['Best Case', 'Expected', 'Worst Case'], default: 'Expected' },
  bestCase: { type: Number, default: 0 },
  expectedCase: { type: Number, default: 0 },
  worstCase: { type: Number, default: 0 },
  costSavings: { type: Number, default: 0 },
  accuracy: { type: Number, default: 95.0 },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ForecastData', ForecastDataSchema);
