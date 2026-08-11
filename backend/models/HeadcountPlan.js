const mongoose = require('mongoose');

const HeadcountPlanSchema = new mongoose.Schema({
  deptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  budgetedHeadcount: {
    type: Number,
    required: true
  },
  forecastHeadcount: {
    type: Number,
    default: 0
  },
  pipelineCount: {
    type: Number,
    default: 0
  },
  approvalStatus: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  approverComments: {
    type: String,
    default: ''
  },
  history: [{
    actorId: { type: String },
    actorName: { type: String },
    action: { type: String },
    budgetedHeadcount: { type: Number },
    forecastHeadcount: { type: Number },
    status: { type: String },
    comments: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('HeadcountPlan', HeadcountPlanSchema);
