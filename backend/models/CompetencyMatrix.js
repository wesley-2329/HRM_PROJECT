const mongoose = require('mongoose');

const CompetencyMatrixSchema = new mongoose.Schema({
  competencyId: { type: String, required: true, unique: true },
  competencyName: { type: String, required: true },
  frameworkType: { type: String, enum: ['Core Values', 'Functional Excellence', 'Leadership Competency', 'Domain Mastery'], default: 'Functional Excellence' },
  targetRole: { type: String, required: true }, // e.g. Senior Software Engineer
  targetGrade: { type: String, default: 'L4' },
  benchmarkScore: { type: Number, min: 1, max: 5, default: 4 },
  assessmentMethod: { type: String, default: 'Manager Evaluation + Practical Assessment' },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('CompetencyMatrix', CompetencyMatrixSchema);
