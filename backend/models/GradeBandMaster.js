const mongoose = require('mongoose');

const GradeBandMasterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  experienceRange: {
    minYears: { type: Number, default: 0 },
    maxYears: { type: Number, default: 0 }
  },
  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  incrementPercentage: {
    type: Number,
    default: 0
  },
  bonusPercentage: {
    type: Number,
    default: 0
  },
  benefits: [{
    type: String
  }],
  promotionEligibility: {
    minTenureMonths: { type: Number, default: 12 },
    performanceRatingMin: { type: Number, default: 3.0 }
  },
  stockEligibility: {
    grants: { type: Number, default: 0 },
    vestingPeriodMonths: { type: Number, default: 36 }
  }
}, { timestamps: true });

module.exports = mongoose.model('GradeBandMaster', GradeBandMasterSchema);
