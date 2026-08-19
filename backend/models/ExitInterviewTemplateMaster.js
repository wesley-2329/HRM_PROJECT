const mongoose = require('mongoose');

const ExitInterviewTemplateMasterSchema = new mongoose.Schema({
  templateId: { type: String, required: true, unique: true },
  templateName: { type: String, required: true },
  questions: [{
    questionText: { type: String, required: true },
    type: { type: String, enum: ['Rating', 'Text', 'MultipleChoice'], default: 'Rating' },
    category: { type: String, default: 'Work Environment' }
  }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  organizationId: { type: String, default: 'ORG-001' }
}, { timestamps: true });

module.exports = mongoose.model('ExitInterviewTemplateMaster', ExitInterviewTemplateMasterSchema);
