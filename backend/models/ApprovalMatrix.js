const mongoose = require('mongoose');

const ApprovalLevelSchema = new mongoose.Schema({
  levelNumber: { type: Number, required: true },
  approverRole: { type: String, required: true },
  approvalType: { type: String, enum: ['Single', 'Multiple'], default: 'Single' },
  slaDays: { type: Number, default: 3 }
});

const MatrixHistorySchema = new mongoose.Schema({
  version: { type: Number, required: true },
  updatedBy: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  changeSummary: { type: String, default: '' },
  oldValues: { type: mongoose.Schema.Types.Mixed },
  newValues: { type: mongoose.Schema.Types.Mixed }
});

const ApprovalMatrixSchema = new mongoose.Schema({
  moduleName: { type: String, required: true },
  processName: { type: String, required: true },
  department: { type: String, required: true, default: 'All' },
  levels: [ApprovalLevelSchema],
  effectiveDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  version: { type: Number, default: 1 },
  createdBy: { type: String, required: true },
  updatedBy: { type: String, required: true },
  approvedBy: { type: String, default: '' },
  history: [MatrixHistorySchema]
}, { timestamps: true });

ApprovalMatrixSchema.index({ processName: 1, department: 1, status: 1 });

module.exports = mongoose.model('ApprovalMatrix', ApprovalMatrixSchema);
