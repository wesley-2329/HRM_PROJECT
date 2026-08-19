const mongoose = require('mongoose');

const AppraisalCycleMasterSchema = new mongoose.Schema({
  cycleName: {
    type: String,
    required: true,
    trim: true
  },
  cycleType: {
    type: String,
    enum: ['Annual', 'Half-Yearly', 'Quarterly', 'Monthly'],
    default: 'Annual'
  },
  financialYear: {
    type: String,
    required: true,
    default: 'FY 2026-2027'
  },
  reviewPeriod: {
    type: String,
    required: true,
    default: 'Apr 2026 - Mar 2027'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  applicableCompany: {
    type: String,
    default: 'All Companies'
  },
  businessUnit: {
    type: String,
    default: 'All Business Units'
  },
  department: {
    type: String,
    default: 'All Departments'
  },
  employeeCategory: {
    type: String,
    default: 'All Employees'
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Under Review', 'Completed', 'Closed'],
    default: 'Active'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  created_by: {
    type: String,
    default: 'System Admin'
  },
  updated_by: {
    type: String,
    default: 'System Admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('AppraisalCycleMaster', AppraisalCycleMasterSchema);
