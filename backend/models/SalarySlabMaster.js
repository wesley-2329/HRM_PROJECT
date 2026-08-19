const mongoose = require('mongoose');

const SalarySlabMasterSchema = new mongoose.Schema({
  slabId: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  statutoryType: { type: String, enum: ['PT', 'LWF', 'ESI', 'PF'], default: 'PT' },
  minSalary: { type: Number, required: true, default: 0 },
  maxSalary: { type: Number, required: true, default: 999999 },
  deductionAmount: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('SalarySlabMaster', SalarySlabMasterSchema);
