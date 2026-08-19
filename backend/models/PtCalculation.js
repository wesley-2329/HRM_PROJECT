const mongoose = require('mongoose');

const PtCalculationSchema = new mongoose.Schema({
  calculationId: { type: String, required: true, unique: true },
  wageMonth: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  state: { type: String, required: true },
  grossSalary: { type: Number, required: true, default: 45000 },
  ptAmount: { type: Number, required: true, default: 200 },
  challanId: { type: String, default: '' },
  status: { type: String, enum: ['Calculated', 'Paid'], default: 'Calculated' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('PtCalculation', PtCalculationSchema);
