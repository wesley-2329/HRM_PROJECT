const mongoose = require('mongoose');

const CommunicationReadLogSchema = new mongoose.Schema({
  communicationId: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  readAt: { type: Date, default: Date.now },
  acknowledged: { type: Boolean, default: false },
  acknowledgedAt: { type: Date }
}, { timestamps: true });

CommunicationReadLogSchema.index({ communicationId: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model('CommunicationReadLog', CommunicationReadLogSchema);
