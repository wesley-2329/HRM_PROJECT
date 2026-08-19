const mongoose = require('mongoose');

const EmployeeExitSchema = new mongoose.Schema({
  exitId: { type: String, required: true, unique: true }, // e.g. EXT-1001
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, default: '' },
  joiningDate: { type: Date, required: true },
  resignationDate: { type: Date, required: true, default: Date.now },
  proposedLwd: { type: Date, required: true },
  approvedLwd: { type: Date },
  exitType: { type: String, default: 'Resignation' },
  reasonCategory: { type: String, default: 'Career Growth' },
  status: { type: String, enum: ['Draft', 'Submitted', 'Manager Review', 'HR Review', 'Approved', 'Notice Active', 'Clearance In Progress', 'F&F Pending', 'Separated', 'Withdrawn', 'Rejected'], default: 'Submitted' },
  exitCoordinator: { type: String, default: 'HR Manager' },
  organizationId: { type: String, default: 'ORG-001' },
  createdBy: { type: String, default: 'System' },
  updatedBy: { type: String, default: 'System' }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeExit', EmployeeExitSchema);
