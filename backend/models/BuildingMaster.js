const mongoose = require('mongoose');

const BuildingMasterSchema = new mongoose.Schema({
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BranchMaster',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    default: 0
  },
  address: {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    zipCode: { type: String, default: '' }
  },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  parkingCapacity: {
    type: Number,
    default: 0
  },
  facilities: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('BuildingMaster', BuildingMasterSchema);
