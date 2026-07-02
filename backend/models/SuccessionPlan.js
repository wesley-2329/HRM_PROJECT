const mongoose = require('mongoose');

const SuccessionPlanSchema = new mongoose.Schema({
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PositionMaster',
    required: true
  },
  criticalLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  riskLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  successors: [{
    employeeId: { type: String, required: true },
    name: { type: String, required: true },
    readiness: {
      type: String,
      enum: ['Ready Now', 'Ready in 1 Year', 'Ready in 3 Years'],
      default: 'Ready Now'
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SuccessionPlan', SuccessionPlanSchema);
