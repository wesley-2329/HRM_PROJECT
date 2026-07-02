const mongoose = require('mongoose');

const SubDepartmentMasterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  parentDept: {
    type: String,
    required: true
  },
  managerId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('SubDepartmentMaster', SubDepartmentMasterSchema);
