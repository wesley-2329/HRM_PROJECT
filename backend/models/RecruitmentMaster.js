const mongoose = require('mongoose');

const RecruitmentMasterSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      'Department',
      'Designation',
      'Grade',
      'Business Unit',
      'Cost Center',
      'Employment Type',
      'Position Type',
      'Resume Source',
      'Skills',
      'Qualification',
      'Industry',
      'Recruitment Source',
      'Budget Category',
      'Candidate Status',
      'Recruitment Stage',
      'Talent Category',
      'Experience Level'
    ],
    required: true
  },
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: String,
    default: 'Admin'
  }
}, { timestamps: true });

RecruitmentMasterSchema.index({ category: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('RecruitmentMaster', RecruitmentMasterSchema);
