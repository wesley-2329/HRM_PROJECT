const mongoose = require('mongoose');

const BandMasterSchema = new mongoose.Schema({
  bandCode: {
    type: String,
    required: true,
    unique: true
  },
  bandName: {
    type: String,
    required: true,
    unique: true
  },
  bandDescription: {
    type: String,
    default: ''
  },
  parentGrade: {
    type: String,
    required: true
  },
  careerLevel: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('BandMaster', BandMasterSchema);
