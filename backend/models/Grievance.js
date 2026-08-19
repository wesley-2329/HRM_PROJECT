const mongoose = require('mongoose');

const GrievanceSchema = new mongoose.Schema({
  grievanceId: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  isConfidential: { type: Boolean, default: false },
  raisedBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    dept: { type: String, default: '' }
  },
  assignedOfficer: {
    id: { type: String, default: '' },
    name: { type: String, default: '' },
    role: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['Submitted', 'Assigned', 'Under Investigation', 'Resolved', 'Closed'],
    default: 'Submitted'
  },
  investigationNotes: { type: String, default: '' },
  resolution: { type: String, default: '' },
  employeeFeedback: {
    rating: { type: Number, default: 0 },
    comments: { type: String, default: '' }
  },
  closureDate: { type: Date, default: null },
  history: [{
    status: String,
    actionBy: String,
    role: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Grievance', GrievanceSchema);
