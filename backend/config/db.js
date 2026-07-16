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
    
    const seedHRs = [
      { id: "EMP-1001", _id: "60c72b2f9b1d8b2a3c9d8001", name: "Gara Nandini", email: "garanandini067@gmail.com", role: "hr", dept: "Human Resources", password: "admin123" },
      { id: "EMP-1002", _id: "60c72b2f9b1d8b2a3c9d8002", name: "Akhil Sirivella", email: "akhilsirivella510@gmail.com", role: "hr", dept: "Human Resources", password: "admin123" },
      { id: "EMP-1003", _id: "60c72b2f9b1d8b2a3c9d8003", name: "Karthik Potur", email: "karthikpotur@gmail.com", role: "hr", dept: "Human Resources", password: "admin123" },
      { id: "EMP-1004", _id: "60c72b2f9b1d8b2a3c9d8004", name: "John Wesley", email: "johnwesley.290305@gmail.com", role: "hr", dept: "Human Resources", password: "admin123" }
    ];

    const seedEmployees = [
      { id: "EMP-2001", _id: "60c72b2f9b1d8b2a3c9d8005", name: "Priyanka", email: "priyanka@qbkartitsolutions.com", role: "employee", dept: "Engineering", password: "employee123" },
      { id: "EMP-2002", _id: "60c72b2f9b1d8b2a3c9d8006", name: "Pranitha", email: "pranitha@qbkartitsolutions.com", role: "employee", dept: "Engineering", password: "employee123" },
      { id: "EMP-2003", _id: "60c72b2f9b1d8b2a3c9d8007", name: "Dhanush Goud", email: "dhanushgoud58@gmail.com", role: "employee", dept: "Engineering", password: "employee123" }
    ];

    for (const user of [...seedHRs, ...seedEmployees]) {
      const exists = await Employee.findOne({ email: user.email });
      if (!exists) {
        console.log(`Seeding whitelisted user: ${user.email}`);
        await Employee.create({
          ...user,
          status: "Approved",
          joined: "2024-01-15",
          avatar: user.role === 'hr' 
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
          aadhaar: "1234-5678-9012",
          phone: "+91 98765 00000"
        });
      }
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;
