const mongoose = require('mongoose');

const SkillMatrixSchema = new mongoose.Schema({
  skillId: { type: String, required: true, unique: true },
  skillName: { type: String, required: true },
  category: { type: String, required: true }, // Core Technical, Leadership, Functional, Soft Skills
  department: { type: String, required: true },
  employee: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    designation: { type: String, default: '' }
  },
  requiredLevel: { type: Number, min: 1, max: 5, required: true, default: 4 }, // 1: Beginner, 5: Expert
  currentLevel: { type: Number, min: 1, max: 5, required: true, default: 3 },
  gapScore: { type: Number, default: 1 },
  lastEvaluatedAt: { type: Date, default: Date.now },
  evaluatorName: { type: String, default: 'Engineering Lead' }
}, { timestamps: true });

module.exports = mongoose.model('SkillMatrix', SkillMatrixSchema);
