const mongoose = require('mongoose');

const EmployeeLwfProfileSchema = new mongoose.Schema({
  lwfProfileId: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  company: { type: String, default: 'Enterprise Corp' },
  branch: { type: String, default: 'HQ Bangalore' },
  state: { type: String, required: true },
  contributionFrequency: { type: String, enum: ['Monthly', 'Half-Yearly', 'Annual'], default: 'Half-Yearly' },
  employeeContribution: { type: Number, default: 20 },
  employerContribution: { type: Number, default: 40 },
  isExempt: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeLwfProfile', EmployeeLwfProfileSchema);
