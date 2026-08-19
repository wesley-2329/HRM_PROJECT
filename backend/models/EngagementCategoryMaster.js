const mongoose = require('mongoose');

const EngagementCategoryMasterSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Suggestion', 'Grievance', 'Helpdesk', 'Welfare', 'Recognition', 'Communication'],
    required: true
  },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  slaHours: { type: Number, default: 48 }, // Default SLA in hours
  priorityDefault: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  approvalWorkflow: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('EngagementCategoryMaster', EngagementCategoryMasterSchema);
