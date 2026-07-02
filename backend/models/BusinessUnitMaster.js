const mongoose = require('mongoose');

const BusinessUnitMasterSchema = new mongoose.Schema({
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
  parentCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LegalEntityMaster',
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  headOfUnit: {
    type: String,
    default: '' // Employee ID
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  costCenter: {
    type: String,
    default: ''
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

module.exports = mongoose.model('BusinessUnitMaster', BusinessUnitMasterSchema);
