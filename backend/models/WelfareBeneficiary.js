const mongoose = require('mongoose');

const WelfareBeneficiarySchema = new mongoose.Schema({
  beneficiaryId: { type: String, required: true, unique: true },
  expenseId: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: { type: String, default: '' },
  amountBenefit: { type: Number, required: true, default: 0 },
  dateGiven: { type: Date, default: Date.now },
  status: { type: String, default: 'Disbursed' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('WelfareBeneficiary', WelfareBeneficiarySchema);
