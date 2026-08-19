const mongoose = require('mongoose');

const KnowledgeTransferSchema = new mongoose.Schema({
  ktId: { type: String, required: true, unique: true },
  exitId: { type: String, required: true },
  employeeId: { type: String, required: true },
  successorId: { type: String, default: '' },
  successorName: { type: String, default: '' },
  projectModules: [{ type: String }],
  handoverDocsUrl: { type: String, default: '' },
  ktCompletionPercentage: { type: Number, default: 0 },
  managerSignoff: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeTransfer', KnowledgeTransferSchema);
