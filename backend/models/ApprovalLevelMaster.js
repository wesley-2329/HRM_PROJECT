const mongoose = require('mongoose');

const ApprovalLevelMasterSchema = new mongoose.Schema({
  levelNumber: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalLevelMaster', ApprovalLevelMasterSchema);
