const mongoose = require('mongoose');

const ExitLetterTemplateMasterSchema = new mongoose.Schema({
  letterTemplateId: { type: String, required: true, unique: true },
  letterType: { type: String, enum: ['Relieving Letter', 'Experience Letter', 'F&F Statement', 'No Due Certificate'], required: true },
  templateTitle: { type: String, required: true },
  contentBody: { type: String, required: true },
  headerLogoUrl: { type: String, default: '' },
  hrSignatureUrl: { type: String, default: '' },
  sealUrl: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ExitLetterTemplateMaster', ExitLetterTemplateMasterSchema);
