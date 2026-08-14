const mongoose = require('mongoose');

const AssessmentCertificationSchema = new mongoose.Schema({
  assessmentId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  programId: { type: String, default: '' },
  totalQuestions: { type: Number, default: 10 },
  passingMarks: { type: Number, default: 70 },
  certificateName: { type: String, required: true },
  issuedCertificates: [{
    employeeId: String,
    employeeName: String,
    score: Number,
    issueDate: { type: Date, default: Date.now },
    certificateUrl: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('AssessmentCertification', AssessmentCertificationSchema);
