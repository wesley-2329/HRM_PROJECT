const mongoose = require('mongoose');

const RatingScaleMasterSchema = new mongoose.Schema({
  scaleName: {
    type: String,
    required: true
  },
  ratingValue: {
    type: Number,
    required: true
  },
  ratingLabel: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  performanceCategory: {
    type: String,
    enum: ['Outstanding', 'Exceeds Expectations', 'Meets Expectations', 'Needs Improvement', 'Unsatisfactory'],
    required: true
  },
  minScore: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  created_by: {
    type: String,
    default: 'Admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('RatingScaleMaster', RatingScaleMasterSchema);
