const mongoose = require('mongoose');

const RegionMasterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  parentCompany: {
    type: String,
    default: ''
  },
  regionManager: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  workingCalendar: {
    workDaysPerWeek: { type: Number, default: 5 },
    holidayList: [{ type: String }] // Date strings
  }
}, { timestamps: true });

module.exports = mongoose.model('RegionMaster', RegionMasterSchema);
