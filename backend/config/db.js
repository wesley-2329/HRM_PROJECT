const mongoose = require('mongoose');
const { getMockDataForModel } = require('./mock_data');

// Override Query exec to capture offline database query errors globally
const originalExec = mongoose.Query.prototype.exec;
mongoose.Query.prototype.exec = async function(...args) {
  try {
    return await originalExec.apply(this, args);
  } catch (err) {
    console.warn(`[Offline Mode] Query failed for model "${this.model.modelName}" (${this.op}). Returning fallback mock data...`);
    try {
      return getMockDataForModel(this.model.modelName, this.op, this._conditions);
    } catch (fallbackErr) {
      console.error(`[Offline Mode] Fallback failed:`, fallbackErr);
      throw err;
    }
  }
};

// Override Model save to capture offline database save errors globally
const originalSave = mongoose.Model.prototype.save;
mongoose.Model.prototype.save = async function(...args) {
  try {
    return await originalSave.apply(this, args);
  } catch (err) {
    console.warn(`[Offline Mode] Save failed for model "${this.constructor.modelName}". Simulating success...`);
    try {
      const { addMockDocument } = require('./mock_data');
      addMockDocument(this.constructor.modelName, this.toObject ? this.toObject() : this);
    } catch (e) {
      console.error('Failed to add mock document during save:', e);
    }
    return this;
  }
};

// Override Model static create to capture offline database create errors globally
const originalCreate = mongoose.Model.create;
mongoose.Model.create = async function(...args) {
  try {
    return await originalCreate.apply(this, args);
  } catch (err) {
    console.warn(`[Offline Mode] Create failed for model "${this.modelName}". Simulating success...`);
    try {
      const { addMockDocument } = require('./mock_data');
      if (Array.isArray(args[0])) {
        args[0].forEach(doc => addMockDocument(this.modelName, doc));
      } else if (args[0]) {
        addMockDocument(this.modelName, args[0]);
      }
    } catch (e) {
      console.error('Failed to add mock document during create:', e);
    }
    return args[0];
  }
};

const connectDB = async () => {
  try {
    // Disable command buffering so queries fail immediately when offline instead of hanging
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    const Employee = require('../models/Employee');
    
    // Ensure default HR Director profile exists
    const hrExist = await Employee.findOne({ email: 'hr@company.com' });
    if (!hrExist) {
      console.log('Default HR Director profile not found. Initializing...');
      await Employee.create({
        id: "EMP-0001",
        name: "Venkat Raman",
        role: "hr",
        dept: "Human Resources",
        joined: "2018-05-10",
        email: "hr@company.com",
        password: "admin123",
        status: "Approved",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        aadhaar: "4567-8901-2345",
        phone: "+91 98765 00001",
        blood: "A+",
        dob: "1980-04-15",
        gender: "Male"
      });
      console.log('Default HR Director profile created successfully.');
    } else {
      if (hrExist.role !== 'hr') {
        hrExist.role = 'hr';
        await hrExist.save();
      }
    }

    // Ensure default Employee profile exists
    const employeeExist = await Employee.findOne({ email: 'employee@company.com' });
    if (!employeeExist) {
      console.log('Default Employee profile not found. Initializing...');
      await Employee.create({
        id: "EMP-0002",
        name: "Aditya Kumar",
        role: "employee",
        dept: "Engineering",
        joined: "2021-06-15",
        email: "employee@company.com",
        password: "employee123",
        status: "Approved",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        aadhaar: "1234-5678-9012",
        phone: "+91 98765 00002",
        blood: "O+",
        dob: "1995-08-20",
        gender: "Male"
      });
      console.log('Default Employee profile created successfully.');
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;
