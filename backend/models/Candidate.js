const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  degree: { type: String, default: '' },
  institution: { type: String, default: '' },
  yearOfPassing: { type: String, default: '' },
  gradeScore: { type: String, default: '' }
}, { _id: false });

const WorkExperienceSchema = new mongoose.Schema({
  company: { type: String, default: '' },
  designation: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  rolesAndResp: { type: String, default: '' }
}, { _id: false });

const DocumentSchema = new mongoose.Schema({
  docName: { type: String, default: '' },
  docType: { type: String, default: 'PDF' },
  filePath: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const InterviewRoundSchema = new mongoose.Schema({
  roundName: { type: String, default: 'Technical Round 1' },
  interviewerName: { type: String, default: '' },
  scheduledDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Passed', 'Failed', 'Cancelled'], default: 'Scheduled' },
  feedback: { type: String, default: '' },
  rating: { type: Number, default: 0 } // 1-5
}, { _id: true });

const OfferDetailSchema = new mongoose.Schema({
  offeredDesignation: { type: String, default: '' },
  offeredCtc: { type: Number, default: 0 },
  joiningDate: { type: Date, default: null },
  offerStatus: { type: String, enum: ['Pending', 'Released', 'Accepted', 'Declined'], default: 'Pending' },
  offerLetterUrl: { type: String, default: '' },
  releasedDate: { type: Date, default: null }
}, { _id: false });

const CommunicationLogSchema = new mongoose.Schema({
  sender: { type: String, default: 'Recruiter' },
  medium: { type: String, enum: ['Email', 'Phone Call', 'SMS', 'In-Person'], default: 'Email' },
  message: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

const TimelineEventSchema = new mongoose.Schema({
  stage: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  updatedBy: { type: String, default: 'System' },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  experienceYearsNum: {
    type: Number,
    default: 0
  },
  stage: {
    type: String,
    enum: ['applied', 'screening', 'interview', 'offered', 'selected', 'joined', 'rejected', 'talent_pool'],
    default: 'applied'
  },
  offerReleased: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  notes: {
    type: String,
    default: ''
  },
  stageRejectedAt: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  interviewStage: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  currentPosition: {
    type: String,
    default: ''
  },
  currentCompany: {
    type: String,
    default: ''
  },
  currentCtc: {
    type: Number,
    default: 0
  },
  expectedCtc: {
    type: Number,
    default: 0
  },
  noticePeriodDays: {
    type: Number,
    default: 30
  },
  lastSalary: {
    type: String,
    default: ''
  },
  workingStatus: {
    type: String,
    default: ''
  },
  skills: {
    type: String,
    default: ''
  },
  skillsList: [{ type: String }],
  location: {
    type: String,
    default: 'Hyderabad, India'
  },
  education: [EducationSchema],
  workExperience: [WorkExperienceSchema],
  documents: [DocumentSchema],
  interviewHistory: [InterviewRoundSchema],
  offerDetails: OfferDetailSchema,
  joiningStatus: {
    type: String,
    enum: ['Not Joined', 'Offer Accepted', 'Pre-Onboarding', 'Onboarded', 'Absconded'],
    default: 'Not Joined'
  },
  talentCategory: {
    type: String,
    default: 'General Talent'
  },
  communicationLog: [CommunicationLogSchema],
  timeline: [TimelineEventSchema],
  resumeLink: {
    type: String,
    default: ''
  },
  jdMatchScore: {
    type: Number,
    default: 0
  },
  recruiterRemarks: {
    type: String,
    default: ''
  },
  assignedRecruiter: {
    type: String,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', CandidateSchema);
