const mongoose = require('mongoose');
const { getMockDataForModel } = require('./mock_data');

const originalExec = mongoose.Query.prototype.exec;
mongoose.Query.prototype.exec = async function(...args) {
  try {
    return await originalExec.apply(this, args);
  } catch (err) {
    console.warn(`[Offline Mode] Query failed for model "${this.model.modelName}" (${this.op}). Returning fallback mock data...`);
    try {
      const mockData = getMockDataForModel(this.model.modelName, this.op, this._conditions);
      if (!mockData) return mockData;
      
      // Hydrate plain objects into Mongoose Documents so document methods like .save() work
      if (Array.isArray(mockData)) {
        return mockData.map(item => this.model.hydrate(item));
      } else {
        return this.model.hydrate(mockData);
      }
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

    if (process.env.FORCE_OFFLINE === 'true') {
      throw new Error('FORCE_OFFLINE is enabled. Simulating disconnected database.');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
  }
};
    console.error(`Error connecting to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;
