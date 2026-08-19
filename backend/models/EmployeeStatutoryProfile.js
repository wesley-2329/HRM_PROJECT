const mongoose = require('mongoose');

const EmployeeStatutoryProfileSchema = new mongoose.Schema({
  profileId: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: { type: String, default: '' },
  designation: { type: String, default: '' },
  state: { type: String, required: true },
  pfApplicable: { type: Boolean, default: true },
  esiApplicable: { type: Boolean, default: true },
  ptApplicable: { type: Boolean, default: true },
  lwfApplicable: { type: Boolean, default: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeStatutoryProfile', EmployeeStatutoryProfileSchema);
