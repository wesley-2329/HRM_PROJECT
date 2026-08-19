const mongoose = require('mongoose');

const EmployeePtProfileSchema = new mongoose.Schema({
  ptProfileId: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  state: { type: String, required: true },
  branch: { type: String, default: '' },
  salarySlab: { type: String, default: '>15000' },
  monthlyDeduction: { type: Number, required: true, default: 200 },
  ercNumber: { type: String, default: '' },
  enrollmentCert: { type: String, default: '' },
  isExempt: { type: Boolean, default: false },
  exemptionReason: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('EmployeePtProfile', EmployeePtProfileSchema);
