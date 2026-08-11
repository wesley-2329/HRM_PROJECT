const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['hr', 'emp'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  empId: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
