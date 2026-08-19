const mongoose = require('mongoose');

const ClearanceRequestSchema = new mongoose.Schema({
  clearanceRequestId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  totalDepartments: { type: Number, default: 8 },
  clearedDepartments: { type: Number, default: 0 },
  overallClearanceStatus: { type: String, enum: ['Initiated', 'In Progress', 'Fully Cleared', 'Blocked'], default: 'Initiated' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ClearanceRequest', ClearanceRequestSchema);
