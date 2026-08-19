const mongoose = require('mongoose');

const ClearanceDepartmentMasterSchema = new mongoose.Schema({
  deptClearanceId: { type: String, required: true, unique: true },
  departmentName: { type: String, enum: ['Reporting Manager', 'HR', 'Finance', 'Payroll', 'IT', 'Admin', 'Security', 'Compliance'], required: true },
  approverRole: { type: String, required: true },
  isMandatory: { type: Boolean, default: true },
  slaHours: { type: Number, default: 48 },
  checklists: [{ type: String }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ClearanceDepartmentMaster', ClearanceDepartmentMasterSchema);
