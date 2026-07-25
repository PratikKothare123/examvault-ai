import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

import Department from '../models/Department.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import FacultyAssignment from '../models/FacultyAssignment.js';
import Paper from '../models/Paper.js';
import Notification from '../models/Notification.js';
import { ROLES, PAPER_STATUS } from '../constants/paper.constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/examvault_db';

// Fixed 24-char Mongo ObjectIds for deterministic references
const DEPT_IDS = {
  CSE: new mongoose.Types.ObjectId('66a000000000000000000001'),
  ETC: new mongoose.Types.ObjectId('66a000000000000000000002'),
  ME: new mongoose.Types.ObjectId('66a000000000000000000003'),
  AIML: new mongoose.Types.ObjectId('66a000000000000000000004'),
  AIDS: new mongoose.Types.ObjectId('66a000000000000000000005'),
  IT: new mongoose.Types.ObjectId('66a000000000000000000006'),
  EE: new mongoose.Types.ObjectId('66a000000000000000000007')
};

const USER_IDS = {
  STUDENT: new mongoose.Types.ObjectId('66a000000000000000000010'),
  FACULTY: new mongoose.Types.ObjectId('66a000000000000000000020'),
  ADMIN: new mongoose.Types.ObjectId('66a000000000000000000030')
};

const SUBJECT_IDS = {
  CS701: new mongoose.Types.ObjectId('66b000000000000000000001'),
  CS702: new mongoose.Types.ObjectId('66b000000000000000000002'),
  CS703: new mongoose.Types.ObjectId('66b000000000000000000003'),
  CS704: new mongoose.Types.ObjectId('66b000000000000000000004'),
  CS705: new mongoose.Types.ObjectId('66b000000000000000000005')
};

const PASSWORD = process.env.SEED_PASSWORD || 'ExamVault@123';

const seedDatabase = async () => {
  console.log('--- STARTING EXAMVAULT DATABASE SEEDING ---');
  console.log('URI loaded from .env:', process.env.MONGO_URI);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected Host:', mongoose.connection.host);
    console.log('Connected Database Name:', mongoose.connection.name);

    // Clear ALL existing data
    await Promise.all([
      Department.deleteMany({}),
      Subject.deleteMany({}),
      User.deleteMany({}),
      FacultyAssignment.deleteMany({}),
      Paper.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('Cleared ALL existing collections (users, departments, subjects, papers, notifications).');

    // 1. Seed 7 Official Departments
    const departments = await Department.insertMany([
      { _id: DEPT_IDS.CSE, deptCode: 'CSE', deptName: 'Computer Science & Engineering' },
      { _id: DEPT_IDS.ETC, deptCode: 'ETC', deptName: 'Electronics & Telecommunication Engineering' },
      { _id: DEPT_IDS.ME, deptCode: 'ME', deptName: 'Mechanical Engineering' },
      { _id: DEPT_IDS.AIML, deptCode: 'AIML', deptName: 'Artificial Intelligence & Machine Learning' },
      { _id: DEPT_IDS.AIDS, deptCode: 'AIDS', deptName: 'Artificial Intelligence & Data Science' },
      { _id: DEPT_IDS.IT, deptCode: 'IT', deptName: 'Information Technology' },
      { _id: DEPT_IDS.EE, deptCode: 'EE', deptName: 'Electrical Engineering' }
    ]);
    console.log(`Seeded ${departments.length} departments.`);

    // 2. Hash passwords
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // 3. Seed EXACTLY 3 Predefined Users (Student, Faculty, Admin)
    const users = await User.insertMany([
      {
        _id: USER_IDS.STUDENT,
        fullName: 'Student User',
        email: 'student@sbjit.edu.in',
        password: hashedPassword,
        role: ROLES.STUDENT,
        department: DEPT_IDS.CSE,
        reputationPoints: 0
      },
      {
        _id: USER_IDS.FACULTY,
        fullName: 'Faculty User',
        email: 'faculty@sbjit.edu.in',
        password: hashedPassword,
        role: ROLES.FACULTY,
        department: DEPT_IDS.CSE,
        reputationPoints: 0
      },
      {
        _id: USER_IDS.ADMIN,
        fullName: 'Admin User',
        email: 'admin@sbjit.edu.in',
        password: hashedPassword,
        role: ROLES.ADMIN,
        department: DEPT_IDS.CSE,
        reputationPoints: 0
      }
    ]);
    console.log(`Seeded ${users.length} predefined users (Student, Faculty, Admin).`);

    // 4. Seed CSE Subjects (Semester 5 & 7 for demo)
    const subjects = await Subject.insertMany([
      {
        _id: SUBJECT_IDS.CS701,
        subjectCode: 'CS701',
        subjectName: 'Compiler Design',
        departmentId: DEPT_IDS.CSE,
        semester: 'Semester 7',
        year: '4th Year',
        branch: 'CSE',
        assignedFaculty: [USER_IDS.FACULTY]
      },
      {
        _id: SUBJECT_IDS.CS702,
        subjectCode: 'CS702',
        subjectName: 'Cyber Security',
        departmentId: DEPT_IDS.CSE,
        semester: 'Semester 7',
        year: '4th Year',
        branch: 'CSE',
        assignedFaculty: [USER_IDS.FACULTY]
      },
      {
        _id: SUBJECT_IDS.CS703,
        subjectCode: 'CS703',
        subjectName: 'Blockchain Technology',
        departmentId: DEPT_IDS.CSE,
        semester: 'Semester 7',
        year: '4th Year',
        branch: 'CSE',
        assignedFaculty: []
      },
      {
        _id: SUBJECT_IDS.CS704,
        subjectCode: 'CS704',
        subjectName: 'Software Engineering & Quality Assurance',
        departmentId: DEPT_IDS.CSE,
        semester: 'Semester 8',
        year: '4th Year',
        branch: 'CSE',
        assignedFaculty: []
      },
      {
        _id: SUBJECT_IDS.CS705,
        subjectCode: 'CS705',
        subjectName: 'Business Intelligence',
        departmentId: DEPT_IDS.CSE,
        semester: 'Semester 8',
        year: '4th Year',
        branch: 'CSE',
        assignedFaculty: []
      },
      // Additional semester 5 subjects for CSE
      {
        _id: new mongoose.Types.ObjectId('66b000000000000000000006'),
        subjectCode: 'CS501',
        subjectName: 'Database Management Systems',
        departmentId: DEPT_IDS.CSE,
        semester: 'Semester 5',
        year: '3rd Year',
        branch: 'CSE',
        assignedFaculty: []
      },
      {
        _id: new mongoose.Types.ObjectId('66b000000000000000000007'),
        subjectCode: 'CS502',
        subjectName: 'Operating Systems',
        departmentId: DEPT_IDS.CSE,
        semester: 'Semester 5',
        year: '3rd Year',
        branch: 'CSE',
        assignedFaculty: []
      },
      {
        _id: new mongoose.Types.ObjectId('66b000000000000000000008'),
        subjectCode: 'CS503',
        subjectName: 'Computer Networks',
        departmentId: DEPT_IDS.CSE,
        semester: 'Semester 5',
        year: '3rd Year',
        branch: 'CSE',
        assignedFaculty: []
      },
      {
        _id: new mongoose.Types.ObjectId('66b000000000000000000009'),
        subjectCode: 'CS504',
        subjectName: 'Software Engineering',
        departmentId: DEPT_IDS.CSE,
        semester: 'Semester 5',
        year: '3rd Year',
        branch: 'CSE',
        assignedFaculty: []
      }
    ]);
    console.log(`Seeded ${subjects.length} subjects.`);

    // 5. Create FacultyAssignment records to mirror Subject.assignedFaculty
    await FacultyAssignment.insertMany([
      {
        facultyUserId: USER_IDS.FACULTY,
        subjectId: SUBJECT_IDS.CS701
      },
      {
        facultyUserId: USER_IDS.FACULTY,
        subjectId: SUBJECT_IDS.CS702
      }
    ]);
    console.log('Created FacultyAssignment records.');

    console.log('\n======================================================');
    console.log('       EXAMVAULT PRE-SEEDED LOGIN CREDENTIALS        ');
    console.log('======================================================');
    console.log('Role    : Student');
    console.log('Email   : student@sbjit.edu.in');
    console.log('Password: ' + PASSWORD);
    console.log('');
    console.log('Role    : Faculty');
    console.log('Email   : faculty@sbjit.edu.in');
    console.log('Password: ' + PASSWORD);
    console.log('');
    console.log('Role    : Admin');
    console.log('Email   : admin@sbjit.edu.in');
    console.log('Password: ' + PASSWORD);
    console.log('======================================================\n');

  } catch (error) {
    console.error('Database seeding failed with error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
    console.log('--- SEEDING PROCESS COMPLETED ---');
  }
};

seedDatabase();

