const mongoose = require('mongoose');

const WelfareActivitySchema = new mongoose.Schema({
  activityId: { type: String, required: true, unique: true },
  activityName: { type: String, required: true },
  category: { type: String, required: true },
  budgetAllocated: { type: Number, default: 0 },
  actualSpent: { type: Number, default: 0 },
  totalParticipants: { type: Number, default: 0 },
  status: { type: String, enum: ['Planned', 'In Progress', 'Completed', 'Cancelled'], default: 'Completed' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('WelfareActivity', WelfareActivitySchema);
