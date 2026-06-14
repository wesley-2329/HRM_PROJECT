const mongoose = require('mongoose');

const ConfidentialNoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  authorId: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ConfidentialNote', ConfidentialNoteSchema);
