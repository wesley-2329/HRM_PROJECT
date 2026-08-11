const mongoose = require('mongoose');

const DiscussionMessageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    required: true
  },
  senderAvatar: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('DiscussionMessage', DiscussionMessageSchema);
