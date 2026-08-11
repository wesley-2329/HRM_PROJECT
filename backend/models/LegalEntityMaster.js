const mongoose = require('mongoose');

const LegalEntitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  gst: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(v);
      },
      message: props => `${props.value} is not a valid GST Number!`
    }
  },
  pan: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(v);
      },
      message: props => `${props.value} is not a valid PAN Number!`
    }
  },
  cin: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[U|L]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(v);
      },
      message: props => `${props.value} is not a valid CIN Number!`
    }
  },
  tan: {
    type: String,
    default: ''
  },
  businessRegNumber: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: 'India'
  },
  state: {
    type: String,
    default: ''
  },
  city: {
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
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  registrationDate: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
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

module.exports = mongoose.model('LegalEntityMaster', LegalEntitySchema);
