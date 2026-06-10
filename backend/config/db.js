const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Auto-seed checking
    const Employee = require('../models/Employee');
    
    // Automatically migrate any existing 'HR Director' account to 'hr' to ensure login works
    await Employee.updateOne({ email: 'hr@company.com' }, { role: 'hr' });

    const count = await Employee.countDocuments();
    if (count === 0) {
      console.log('Database is empty. Auto-seeding default HR and Employee profiles...');
      await autoSeed();
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const autoSeed = async () => {
  try {
    const Employee = require('../models/Employee');
    const Leave = require('../models/Leave');
    const Task = require('../models/Task');
    const Ticket = require('../models/Ticket');
    const Candidate = require('../models/Candidate');
    const Meeting = require('../models/Meeting');
    const Notification = require('../models/Notification');
    const Timesheet = require('../models/Timesheet');
    const Training = require('../models/Training');
    const ChatMessage = require('../models/ChatMessage');

    // Seed HR Director and standard employee
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
      address: { door: "Penthouse 1", street: "Green Glen Layout", city: "Bengaluru", state: "Karnataka", pin: "560103" },
      emergency: { name: "Asha Raman", relation: "Wife", phone: "+91 91234 00001" },
      blood: "A+",
      dob: "1980-04-15",
      gender: "Male"
    });

    await Employee.create({
      id: "EMP-2047",
      name: "Arjun Mehta",
      role: "Software Engineer",
      dept: "Engineering",
      joined: "2022-01-12",
      email: "emp@company.com",
      password: "emp123",
      status: "Approved",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      aadhaar: "5634-9012-3456",
      phone: "+91 98765 43210",
      address: { door: "Flat 402, Block B", street: "Prestige Heights", city: "Bengaluru", state: "Karnataka", pin: "560001" },
      emergency: { name: "Riya Mehta", relation: "Wife", phone: "+91 91234 56789" },
      blood: "B+",
      dob: "1995-03-15",
      gender: "Male"
    });

    // Seed other standard employee listings to populate roster
    const demoEmployees = [
      { id: "EMP-1023", name: "Priya Nair", role: "HR Manager", dept: "Human Resources", joined: "2020-03-05", email: "priya@company.com", password: "password123", status: "Approved", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", aadhaar: "8912-3456-7890", phone: "+91 98765 43211", address: { door: "No. 12", street: "Palm Grove Road", city: "Kochi", state: "Kerala", pin: "682001" }, emergency: { name: "Rajesh Nair", relation: "Father", phone: "+91 91234 56780" }, blood: "O+", dob: "1992-07-20", gender: "Female" },
      { id: "EMP-1156", name: "Rohit Sharma", role: "Senior Analyst", dept: "Finance", joined: "2021-07-18", email: "rohit@company.com", password: "password123", status: "Approved", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", aadhaar: "1234-5678-9012", phone: "+91 98765 43212", address: { door: "B-804", street: "Skyline Towers", city: "Mumbai", state: "Maharashtra", pin: "400001" }, emergency: { name: "Anita Sharma", relation: "Mother", phone: "+91 91234 56781" }, blood: "A+", dob: "1990-11-05", gender: "Male" },
      { id: "EMP-2089", name: "Sneha Iyer", role: "UI/UX Lead", dept: "Design", joined: "2022-09-03", email: "sneha@company.com", password: "password123", status: "Approved", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", aadhaar: "3456-7890-1234", phone: "+91 98765 43213", address: { door: "Block C-3", street: "Oakwood Lane", city: "Chennai", state: "Tamil Nadu", pin: "600001" }, emergency: { name: "Venkatesh Iyer", relation: "Father", phone: "+91 91234 56782" }, blood: "AB+", dob: "1994-05-12", gender: "Female" },
      { id: "EMP-2134", name: "Divya Pillai", role: "QA Engineer", dept: "Engineering", joined: "2023-11-10", email: "divya@company.com", password: "password123", status: "Pending", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", aadhaar: "9012-3456-7890", phone: "+91 98765 43215", address: { door: "Door 45", street: "Green Valley Phase 2", city: "Pune", state: "Maharashtra", pin: "411001" }, emergency: { name: "Gopal Pillai", relation: "Father", phone: "+91 91234 56784" }, blood: "O-", dob: "1997-12-25", gender: "Female" }
    ];
    for (const emp of demoEmployees) {
      await Employee.create(emp);
    }

    // Seed default tasks, notifications and leaves
    await Task.create({ title: "Refactor Dashboard UI", project: "TalentSphere", priority: "High", due: "2026-06-12", progress: 65, status: "in-progress", empId: "EMP-2047" });
    await Task.create({ title: "Configure Chart.js Data Integration", project: "TalentSphere", priority: "Medium", due: "2026-06-14", progress: 20, status: "todo", empId: "EMP-2047" });
    await Task.create({ title: "Draft Corporate Policy Updates", project: "Operations", priority: "Low", due: "2026-06-20", progress: 100, status: "done", empId: "EMP-2047" });
    
    await Leave.create({ empId: "EMP-2047", empName: "Arjun Mehta", type: "Casual", start: "2026-06-15", end: "2026-06-18", reason: "Family wedding", status: "Approved" });
    await Leave.create({ empId: "EMP-2134", empName: "Divya Pillai", type: "Sick", start: "2026-06-05", end: "2026-06-06", reason: "Viral fever", status: "Approved" });
    await Leave.create({ empId: "EMP-2089", empName: "Sneha Iyer", type: "Earned", start: "2026-06-20", end: "2026-06-25", reason: "Annual vacation", status: "Pending" });

    await Ticket.create({ id: "TCK-102", title: "Laptop keyboard not working", category: "IT Support", priority: "High", status: "Open", raisedOn: "2026-06-05", response: "Under diagnostics by IT team.", empId: "EMP-2047" });

    await Notification.create({ type: "salary", title: "Salary Credited", desc: "Your salary for the month of May 2026 has been credited.", time: "1 day ago", read: false, empId: "EMP-2047" });
    await Notification.create({ type: "leave", title: "Leave Approved", desc: "Your casual leave request for June 15-18 has been approved.", time: "2 days ago", read: false, empId: "EMP-2047" });
    await Notification.create({ type: "meeting", title: "Meeting Alert", desc: "Sprint review scheduled for today at 3:00 PM.", time: "4 hours ago", read: false, empId: "EMP-2047" });

    await Meeting.create({ title: "Daily Tech Standup", host: "Priya Nair", date: "2026-06-08", time: "09:30 AM", type: "Online", status: "Scheduled", empId: "EMP-2047" });
    await Meeting.create({ title: "Sprint Planning", host: "Arjun Mehta", date: "2026-06-07", time: "11:00 AM", type: "Online", status: "Attended", notes: "Tasks assigned for Sprint 45", empId: "EMP-2047" });

    await Training.create({ name: "AWS Cloud Practitioner", assignedBy: "Priya Nair", deadline: "2026-06-30", progress: 45, category: "Tech", duration: "10 Hours", rating: 4.8, empId: "EMP-2047", status: "assigned" });
    await Training.create({ name: "Emotional Intelligence at Work", assignedBy: "Priya Nair", deadline: "2026-06-15", progress: 90, category: "Soft Skills", duration: "4 Hours", rating: 4.5, empId: "EMP-2047", status: "assigned" });

    await Timesheet.create({ date: "2026-06-01", clockIn: "09:00 AM", clockOut: "06:00 PM", hours: 9.0, status: "Punctual", empId: "EMP-2047" });
    await Timesheet.create({ date: "2026-06-05", clockIn: "09:10 AM", clockOut: "06:00 PM", hours: 8.8, status: "Late Entry", empId: "EMP-2047" });

    const candidatesData = [
      { name: "Ramesh Kumar", role: "Frontend Developer", source: "Job Portal", experience: "3 Years", stage: "applied", offerReleased: "No", notes: "Strong CSS, basic React" },
      { name: "Ananya Rao", role: "UI/UX Designer", source: "Career Page", experience: "2 Years", stage: "applied", offerReleased: "No", notes: "Portfolio looks solid" },
      { name: "Vikram Singh", role: "Finance Executive", source: "Walk-In", experience: "4 Years", stage: "applied", offerReleased: "No", notes: "Good communication skills" }
    ];
    await Candidate.insertMany(candidatesData);

    console.log('Database auto-seeded successfully!');
  } catch (err) {
    console.error('Auto-seed error:', err);
  }
};

module.exports = connectDB;
