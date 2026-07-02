const mongoose = require('mongoose');

const BranchMasterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    default: ''
  },
  branchHead: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  latitude: {
    type: Number,
    default: 0.0
  },
  longitude: {
    type: Number,
    default: 0.0
  },
  attendanceRadius: {
    type: Number,
    default: 150
  },
  officeTiming: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' }
  },
  workingDays: [{
    type: String
  }],
  emergencyContacts: [{
    name: { type: String },
    phone: { type: String },
    role: { type: String }
  }],
  geoFence: {
    enabled: { type: Boolean, default: false },
    polygonPoints: [{
      lat: { type: Number },
      lng: { type: Number }
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('BranchMaster', BranchMasterSchema);
