const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    const Employee = require('../models/Employee');
    
    // Automatically migrate any existing 'HR Director' account to 'hr' to ensure login works
    await Employee.updateOne({ email: 'hr@company.com' }, { role: 'hr' });

    const count = await Employee.countDocuments();
    if (count === 0) {
      console.log('Database is empty. Initializing default HR Director profile...');
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
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
