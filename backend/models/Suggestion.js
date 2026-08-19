const mongoose = require('mongoose');

const SuggestionSchema = new mongoose.Schema({
  suggestionId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  businessImpact: { type: String, default: '' },
  estimatedBenefit: { type: String, default: '' },
  attachment: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Implemented', 'Rejected'],
    default: 'Submitted'
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  submittedBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    dept: { type: String, default: '' }
  },
  reviewerComments: { type: String, default: '' },
  evaluatorComments: { type: String, default: '' },
  rewardBadge: { type: String, default: '' },
  rewardPoints: { type: Number, default: 0 },
  history: [{
    action: String,
    performedBy: String,
    role: String,
    timestamp: { type: Date, default: Date.now },
    comments: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Suggestion', SuggestionSchema);
