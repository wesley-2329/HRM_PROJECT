const mongoose = require('mongoose');

const RecognitionPostSchema = new mongoose.Schema({
  recognitionId: { type: String, required: true, unique: true },
  recipient: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    dept: { type: String, default: '' },
    avatar: { type: String, default: '' }
  },
  recognizedBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    dept: { type: String, default: '' },
    avatar: { type: String, default: '' }
  },
  category: {
    type: String,
    enum: ['Employee of the Month', 'Spot Award', 'Appreciation Badge', 'Team Achievement', 'Innovation Award', 'Birthday & Work Anniversary Wishes'],
    required: true
  },
  badge: { type: String, default: '⭐ Star Performer' },
  appreciationMessage: { type: String, required: true },
  date: { type: Date, default: Date.now },
  visibility: { type: String, enum: ['Company-wide', 'Department', 'Private'], default: 'Company-wide' },
  likes: [{ type: String }], // employee IDs who liked
  comments: [{
    id: { type: String },
    userName: String,
    commentText: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('RecognitionPost', RecognitionPostSchema);
