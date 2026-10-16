const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: 'Just now'
  },
  read: {
    type: Boolean,
    default: false
  },
  readBy: {
    type: [String],
    default: []
  },
  clearedBy: {
    type: [String],
    default: []
  },
  empId: {
    type: String,
    default: ''
  },
  ticketId: {
    type: String,
    default: ''
  }
}, { timestamps: true });

NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ empId: 1, createdAt: -1 });
NotificationSchema.index({ clearedBy: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
