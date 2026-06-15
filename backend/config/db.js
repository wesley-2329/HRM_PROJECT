const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/');
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
      // Ensure the role is set to 'hr'
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
    process.exit(1);
  }
};

module.exports = connectDB;
