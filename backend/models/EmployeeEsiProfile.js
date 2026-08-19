const mongoose = require('mongoose');

const EmployeeEsiProfileSchema = new mongoose.Schema({
  esiProfileId: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  ipNumber: { type: String, required: true }, // Insurance Person Number
  joiningDate: { type: Date, required: true },
  esiEligible: { type: Boolean, default: true },
  grossWage: { type: Number, required: true, default: 0 },
  benefitPeriod: { type: String, default: 'Apr-Sep' },
  contributionPeriod: { type: String, default: 'Oct-Mar' },
  nomineeName: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeEsiProfile', EmployeeEsiProfileSchema);
