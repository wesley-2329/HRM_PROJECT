const mongoose = require('mongoose');

const CommunicationSchema = new mongoose.Schema({
  communicationId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Announcement', 'Policy Update', 'Circular', 'Emergency Alert', 'Event', 'Newsletter'],
    required: true
  },
  content: { type: String, required: true },
  targetAudience: { type: String, default: 'All Employees' }, // All, HR, IT, Finance, Engineering
  publishDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  attachment: { type: String, default: '' },
  acknowledgementRequired: { type: Boolean, default: false },
  status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Published' },
  author: {
    id: { type: String, default: '' },
    name: { type: String, default: 'HR Admin' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Communication', CommunicationSchema);
