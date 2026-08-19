const mongoose = require('mongoose');

const HelpdeskTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  subcategory: { type: String, default: 'General' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  raisedBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    dept: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  assignedTo: {
    id: { type: String, default: '' },
    name: { type: String, default: 'Unassigned' }
  },
  slaHours: { type: Number, default: 24 },
  dueDate: { type: Date },
  resolutionNotes: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Open', 'Assigned', 'In Progress', 'On Hold', 'Resolved', 'Closed'],
    default: 'Open'
  },
  history: [{
    action: String,
    actor: String,
    timestamp: { type: Date, default: Date.now },
    comment: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('HelpdeskTicket', HelpdeskTicketSchema);
