const mongoose = require('mongoose');

const CompanyMasterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  logo: {
    type: String,
    default: ''
  },
  businessType: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  gst: {
    type: String,
    default: ''
  },
  pan: {
    type: String,
    default: ''
  },
  cin: {
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
  website: {
    type: String,
    default: ''
  },
  registeredAddress: {
    type: String,
    default: ''
  },
  corporateAddress: {
    type: String,
    default: ''
  },
  workingCalendar: {
    workDaysPerWeek: { type: Number, default: 5 },
    shiftTimings: { type: String, default: '09:00 - 18:00' }
  },
  holidayCalendar: [{
    name: { type: String },
    date: { type: String }
  }],
  branding: {
    primaryColor: { type: String, default: '#3b82f6' },
    secondaryColor: { type: String, default: '#10b981' },
    accentColor: { type: String, default: '#f59e0b' }
  },
  emailConfig: {
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    senderEmail: { type: String, default: '' }
  },
  regionalSettings: {
    language: { type: String, default: 'English' },
    dateFormat: { type: String, default: 'DD-MM-YYYY' }
  },
  corporatePolicies: [{
    title: { type: String },
    link: { type: String }
  }],
  documentTemplates: [{
    name: { type: String },
    fileUrl: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('CompanyMaster', CompanyMasterSchema);
