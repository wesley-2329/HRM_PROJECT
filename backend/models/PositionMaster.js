const mongoose = require('mongoose');

const PositionMasterSchema = new mongoose.Schema({
  positionCode: {
    type: String,
    required: true,
    unique: true
  },
  positionName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  approvedHeadcount: {
    type: Number,
    required: true,
    default: 1
  },
  filledPositions: {
    type: Number,
    required: true,
    default: 0
  },
  vacantPositions: {
    type: Number,
    required: true,
    default: 1
  },
  employmentType: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Contractor', 'Intern'],
    default: 'Full-Time'
  },
  grade: {
    type: String,
    required: true
  },
  costCenter: {
    type: String,
    default: ''
  },
  budget: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Vacant', 'Filled', 'Frozen', 'Closed'],
    default: 'Vacant'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  created_by: {
    type: String,
    default: 'Admin'
  },
  updated_by: {
    type: String,
    default: 'Admin'
  }
}, { timestamps: true });

// Pre-save validation to calculate vacant positions and prevent filled > approved
PositionMasterSchema.pre('save', function (next) {
  if (this.filledPositions > this.approvedHeadcount) {
    return next(new Error('Filled positions cannot exceed approved headcount limit.'));
  }
  this.vacantPositions = this.approvedHeadcount - this.filledPositions;
  if (this.filledPositions === this.approvedHeadcount) {
    this.status = 'Filled';
  } else if (this.filledPositions > 0) {
    this.status = 'Vacant'; // Partially filled
  } else {
    this.status = 'Vacant';
  }
  next();
});

module.exports = mongoose.model('PositionMaster', PositionMasterSchema);
