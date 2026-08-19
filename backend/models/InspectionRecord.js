const mongoose = require('mongoose');

const InspectionRecordSchema = new mongoose.Schema({
  inspectionId: { type: String, required: true, unique: true },
  authority: { type: String, required: true }, // EPFO, ESIC, Factory Inspector, Min Wage Inspector
  location: { type: String, required: true },
  inspectorName: { type: String, default: '' },
  inspectionDate: { type: Date, required: true },
  findings: { type: String, default: '' },
  actionItems: { type: String, default: '' },
  closureStatus: { type: String, enum: ['Scheduled', 'In Progress', 'Observations Open', 'Closed'], default: 'Closed' },
  supportingDocsUrl: { type: String, default: '' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('InspectionRecord', InspectionRecordSchema);
