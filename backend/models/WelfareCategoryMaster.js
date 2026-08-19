const mongoose = require('mongoose');

const WelfareCategoryMasterSchema = new mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  categoryName: { type: String, required: true }, // Food & Canteen, Transport, Medical, Insurance, Engagement, Gifts
  description: { type: String, default: '' },
  isTaxable: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('WelfareCategoryMaster', WelfareCategoryMasterSchema);
