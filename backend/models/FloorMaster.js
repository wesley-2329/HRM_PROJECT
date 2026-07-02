const mongoose = require('mongoose');

const FloorMasterSchema = new mongoose.Schema({
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BuildingMaster',
    required: true
  },
  floorNumber: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  seatingCapacity: {
    type: Number,
    default: 0
  },
  sections: [{
    type: String
  }],
  departments: [{
    type: String
  }],
  teams: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('FloorMaster', FloorMasterSchema);
