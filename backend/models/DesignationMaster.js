const mongoose = require('mongoose');

const DesignationMasterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  deptMapping: {
    type: String,
    default: ''
  },
  gradeMapping: {
    type: String,
    default: ''
  },
  positionLimit: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  careerPath: [{
    type: String
  }],
  promotionMapping: [{
    nextDesignation: { type: String },
    minTenureMonths: { type: Number, default: 12 }
  }],
  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  skillRequirements: [{
    type: String
  }],
  educationRequirements: [{
    type: String
  }],
  certificationRequirements: [{
    type: String
  }],
  approvalMatrix: [{
    level: { type: Number },
    role: { type: String }
  }],
  jobDescription: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('DesignationMaster', DesignationMasterSchema);
