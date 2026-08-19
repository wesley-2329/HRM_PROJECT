const mongoose = require('mongoose');

const EmployeePfProfileSchema = new mongoose.Schema({
  pfProfileId: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  uan: { type: String, required: true },
  pfMemberId: { type: String, default: '' },
  joiningDate: { type: Date, required: true },
  pfEligible: { type: Boolean, default: true },
  vpfStatus: { type: Boolean, default: false },
  vpfPercentage: { type: Number, default: 0 },
  epsEligibility: { type: Boolean, default: true },
  pfWage: { type: Number, default: 15000 },
  kycStatus: { type: String, enum: ['Verified', 'Pending', 'Rejected'], default: 'Verified' },
  nominationStatus: { type: String, enum: ['Completed', 'Pending'], default: 'Completed' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('EmployeePfProfile', EmployeePfProfileSchema);
