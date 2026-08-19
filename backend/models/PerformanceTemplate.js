const mongoose = require('mongoose');

const PerformanceTemplateSchema = new mongoose.Schema({
  templateName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: 'All'
  },
  designation: {
    type: String,
    default: 'All'
  },
  grade: {
    type: String,
    default: 'All'
  },
  kraWeightage: {
    type: Number,
    required: true,
    default: 40
  },
  kpiWeightage: {
    type: Number,
    required: true,
    default: 30
  },
  competencyWeightage: {
    type: Number,
    required: true,
    default: 20
  },
  behaviourWeightage: {
    type: Number,
    required: true,
    default: 10
  },
  ratingScaleId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft'],
    default: 'Active'
  },
  created_by: {
    type: String,
    default: 'HR Admin'
  }
}, { timestamps: true });

PerformanceTemplateSchema.pre('save', function (next) {
  const totalWeightage = (this.kraWeightage || 0) + (this.kpiWeightage || 0) + (this.competencyWeightage || 0) + (this.behaviourWeightage || 0);
  if (totalWeightage !== 100) {
    return next(new Error('Total template weightage must equal exactly 100%. Currently: ' + totalWeightage + '%'));
  }
  next();
});

module.exports = mongoose.model('PerformanceTemplate', PerformanceTemplateSchema);
