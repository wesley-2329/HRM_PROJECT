const mongoose = require('mongoose');

const DepartmentClearanceSchema = new mongoose.Schema({
  clearanceId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  departmentName: { type: String, enum: ['Reporting Manager', 'HR', 'Finance', 'Payroll', 'IT', 'Admin', 'Security', 'Compliance'], required: true },
  approverId: { type: String, default: '' },
  approverName: { type: String, default: '' },
  clearanceStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'On Hold'], default: 'Pending' },
  remarks: { type: String, default: '' },
  evidenceUrl: { type: String, default: '' },
  recoveryAmount: { type: Number, default: 0 },
  actionDate: { type: Date },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('DepartmentClearance', DepartmentClearanceSchema);
