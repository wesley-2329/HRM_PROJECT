const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Employee = require('../models/Employee');

async function addEmployees() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/');
  console.log('Connected!');

  const newEmployees = [
    {
      id: 'EMP-0006',
      name: 'Rajesh Iyer',
      role: 'employee',
      dept: 'Engineering',
      joined: '2022-06-01',
      email: 'rajesh@company.com',
      password: 'password123',
      status: 'Approved',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      aadhaar: '1212-3434-5656',
      phone: '+91 98765 00006',
      blood: 'A-',
      dob: '1990-08-14',
      gender: 'Male',
      teamLeadId: 'EMP-0002',
      isTeamLead: true,
      branch: 'HQ Bangalore',
      businessUnit: 'Cloud Solutions',
      costCenter: 'Engineering CC',
      grade: 'L3',
      designation: 'Team Lead'
    },
    {
      id: 'EMP-0007',
      name: 'Sunita Sharma',
      role: 'employee',
      dept: 'Engineering',
      joined: '2023-02-15',
      email: 'sunita@company.com',
      password: 'password123',
      status: 'Approved',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      aadhaar: '9898-7676-5454',
      phone: '+91 98765 00007',
      blood: 'O+',
      dob: '1997-03-24',
      gender: 'Female',
      teamLeadId: 'EMP-0006',
      branch: 'HQ Bangalore',
      businessUnit: 'Cloud Solutions',
      costCenter: 'Engineering CC',
      grade: 'L1',
      designation: 'Software Engineer'
    },
    {
      id: 'EMP-0008',
      name: 'Amit Patel',
      role: 'employee',
      dept: 'Engineering',
      joined: '2023-05-10',
      email: 'amit@company.com',
      password: 'password123',
      status: 'Approved',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      aadhaar: '6767-8989-1212',
      phone: '+91 98765 00008',
      blood: 'B+',
      dob: '1995-10-10',
      gender: 'Male',
      teamLeadId: 'EMP-0006',
      branch: 'Tech Park Pune',
      businessUnit: 'Cloud Solutions',
      costCenter: 'Engineering CC',
      grade: 'L1',
      designation: 'Software Engineer'
    },
    {
      id: 'EMP-0009',
      name: 'Kavita Krishnan',
      role: 'employee',
      dept: 'Human Resources',
      joined: '2022-11-01',
      email: 'kavita@company.com',
      password: 'password123',
      status: 'Approved',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      aadhaar: '4321-8765-1092',
      phone: '+91 98765 00009',
      blood: 'AB-',
      dob: '1994-12-05',
      gender: 'Female',
      teamLeadId: 'EMP-0005',
      branch: 'HQ Bangalore',
      businessUnit: 'Enterprise Apps',
      costCenter: 'HR Operations CC',
      grade: 'L1',
      designation: 'HR Specialist'
    },
    {
      id: 'EMP-0010',
      name: 'Joseph Kurian',
      role: 'employee',
      dept: 'Engineering',
      joined: '2023-08-01',
      email: 'joseph@company.com',
      password: 'password123',
      status: 'Approved',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      aadhaar: '9090-8080-7070',
      phone: '+91 98765 00010',
      blood: 'A+',
      dob: '1993-01-30',
      gender: 'Male',
      teamLeadId: 'EMP-0002',
      branch: 'Innovation Hub Chennai',
      businessUnit: 'Cloud Solutions',
      costCenter: 'Engineering CC',
      grade: 'L1',
      designation: 'Software Engineer'
    },
    {
      id: 'EMP-0011',
      name: 'Diana Prince',
      role: 'employee',
      dept: 'Engineering',
      joined: '2021-04-20',
      email: 'diana@company.com',
      password: 'password123',
      status: 'Approved',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
      aadhaar: '5566-7788-9900',
      phone: '+91 98765 00011',
      blood: 'O-',
      dob: '1991-05-18',
      gender: 'Female',
      teamLeadId: 'EMP-0002',
      branch: 'HQ Bangalore',
      businessUnit: 'Cloud Solutions',
      costCenter: 'Engineering CC',
      grade: 'L1',
      designation: 'Software Engineer'
    },
    {
      id: 'EMP-0012',
      name: 'Bruce Wayne',
      role: 'employee',
      dept: 'Engineering',
      joined: '2020-03-10',
      email: 'bruce@company.com',
      password: 'password123',
      status: 'Approved',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      aadhaar: '1122-3344-5566',
      phone: '+91 98765 00012',
      blood: 'AB+',
      dob: '1985-02-19',
      gender: 'Male',
      teamLeadId: 'EMP-0002',
      branch: 'Tech Park Pune',
      businessUnit: 'Cloud Solutions',
      costCenter: 'Engineering CC',
      grade: 'L1',
      designation: 'Software Engineer'
    }
  ];

  for (const emp of newEmployees) {
    const exists = await Employee.findOne({ id: emp.id });
    if (!exists) {
      await Employee.create(emp);
      console.log(`Added employee: ${emp.name} (${emp.id})`);
    } else {
      console.log(`Employee ${emp.id} already exists`);
    }
  }

  console.log('Closing database connection...');
  await mongoose.connection.close();
  console.log('Seeding finished successfully!');
}

addEmployees().catch(err => {
  console.error(err);
  process.exit(1);
});
