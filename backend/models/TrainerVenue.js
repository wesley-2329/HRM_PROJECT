const mongoose = require('mongoose');

const TrainerVenueSchema = new mongoose.Schema({
  type: { type: String, enum: ['Trainer', 'Venue'], required: true },
  name: { type: String, required: true },
  category: { type: String, default: 'Internal Expert' },
  location: { type: String, default: 'HQ Bangalore' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  capacity: { type: Number, default: 30 },
  rating: { type: Number, default: 4.8 },
  specialization: { type: String, default: 'Software Architecture & Cloud' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('TrainerVenue', TrainerVenueSchema);
