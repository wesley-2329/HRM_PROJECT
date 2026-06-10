const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EmployeeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  dept: {
    type: String,
    required: true
  },
  joined: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Pending'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  },
  aadhaar: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    door: { type: String, default: 'N/A' },
    street: { type: String, default: 'N/A' },
    city: { type: String, default: 'N/A' },
    state: { type: String, default: 'N/A' },
    pin: { type: String, default: '000000' }
  },
  emergency: {
    name: { type: String, default: 'N/A' },
    relation: { type: String, default: 'N/A' },
    phone: { type: String, default: 'N/A' }
  },
  blood: {
    type: String,
    default: 'O+'
  },
  dob: {
    type: String,
    default: '1990-01-01'
  },
  gender: {
    type: String,
    default: 'Male'
  }
}, { timestamps: true });

// Hash password before saving
EmployeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
EmployeeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Employee', EmployeeSchema);
