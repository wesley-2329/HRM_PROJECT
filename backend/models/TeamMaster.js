const mongoose = require('mongoose');

const TeamMasterSchema = new mongoose.Schema({
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
  parentDeptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  teamLead: {
    type: String,
    default: '' // Employee ID
  },
  description: {
    type: String,
    default: ''
  },
  maxMembers: {
    type: Number,
    default: 10
  },
  currentMembers: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
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
    default: 'Admin'
  },
  updated_by: {
    type: String,
    default: 'Admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('TeamMaster', TeamMasterSchema);
