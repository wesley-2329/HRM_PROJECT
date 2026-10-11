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

module.exports = mongoose.model('Notification', NotificationSchema);
