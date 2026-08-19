const mongoose = require('mongoose');

const ExitTypeMasterSchema = new mongoose.Schema({
  typeId: { type: String, required: true, unique: true },
  typeName: { type: String, required: true }, // Resignation, Retirement, Involuntary Separation, End of Contract, Medical Invalidation
  description: { type: String, default: '' },
  requiresNoticePeriod: { type: Boolean, default: true },
  requiresExitInterview: { type: Boolean, default: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' },
  createdBy: { type: String, default: 'System' },
  updatedBy: { type: String, default: 'System' }
}, { timestamps: true });

module.exports = mongoose.model('ExitTypeMaster', ExitTypeMasterSchema);
