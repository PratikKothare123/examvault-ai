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

const SUB_IDS = {
  CS701: new mongoose.Types.ObjectId('66b000000000000000000001'),
  CS702: new mongoose.Types.ObjectId('66b000000000000000000002'),
  CS703: new mongoose.Types.ObjectId('66b000000000000000000003'),
  CS704: new mongoose.Types.ObjectId('66b000000000000000000004'),
  CS705: new mongoose.Types.ObjectId('66b000000000000000000005')
};

const seedDatabase = async () => {
  console.log('--- STARTING EXAMVAULT DATABASE SEEDING ---');
  console.log('URI loaded from .env:', process.env.MONGO_URI);
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected Host:', mongoose.connection.host);
    console.log('Connected Database Name:', mongoose.connection.name);

    // Clear existing data
    await Promise.all([
      Department.deleteMany({}),
      Subject.deleteMany({}),
      User.deleteMany({}),
      FacultyAssignment.deleteMany({}),
      Paper.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('Cleared existing collections.');

    // 1. Seed Updated Department Catalog
    const cseDept = await Department.create({ _id: DEPT_IDS.CSE, deptCode: 'CSE', deptName: 'Computer Science & Engineering' });
    await Department.create({ _id: DEPT_IDS.ETC, deptCode: 'ETC', deptName: 'Electronics & Telecommunication Engineering' });
    await Department.create({ _id: DEPT_IDS.ME, deptCode: 'ME', deptName: 'Mechanical Engineering' });
    await Department.create({ _id: DEPT_IDS.AIML, deptCode: 'AIML', deptName: 'Artificial Intelligence & Machine Learning' });
    await Department.create({ _id: DEPT_IDS.AIDS, deptCode: 'AIDS', deptName: 'Artificial Intelligence & Data Science' });
    await Department.create({ _id: DEPT_IDS.IT, deptCode: 'IT', deptName: 'Information Technology' });
    await Department.create({ _id: DEPT_IDS.EE, deptCode: 'EE', deptName: 'Electrical Engineering' });

    console.log('Seeded 7 Official College Departments with fixed Mongo ObjectIds.');

    // 2. Hash default passwords
    const studentPass = await bcrypt.hash('StudentPassword123!', 10);
    const facultyPass = await bcrypt.hash('FacultyPassword123!', 10);
    const adminPass = await bcrypt.hash('AdminPassword123!', 10);

    // 3. Seed Users
    const student = await User.create({
      _id: USER_IDS.STUDENT,
      fullName: 'Pratik Kothare',
      email: 'student.cse23@sbjit.edu.in',
      password: studentPass,
      role: ROLES.STUDENT,
      department: cseDept._id,
      reputationPoints: 20
    });

    const faculty = await User.create({
      _id: USER_IDS.FACULTY,
      fullName: 'Prof. R. K. Sharma',
      email: 'faculty.cse@sbjit.edu.in',
      password: facultyPass,
      role: ROLES.FACULTY,
      department: cseDept._id
    });

    const admin = await User.create({
      _id: USER_IDS.ADMIN,
      fullName: 'System Administrator',
      email: 'admin.cse@sbjit.edu.in',
      password: adminPass,
      role: ROLES.ADMIN,
      department: cseDept._id
    });

    // 4. Seed CSE Final Year Subjects with assigned faculty
    const compilerSub = await Subject.create({
      _id: SUB_IDS.CS701,
      subjectCode: 'CS701',
      subjectName: 'Compiler Design',
      departmentId: cseDept._id,
      semester: 'Semester 7',
      year: '4th Year',
      branch: 'CSE',
      assignedFaculty: [faculty._id]
    });

    const cyberSub = await Subject.create({
      _id: SUB_IDS.CS702,
      subjectCode: 'CS702',
      subjectName: 'Cyber Security',
      departmentId: cseDept._id,
      semester: 'Semester 7',
      year: '4th Year',
      branch: 'CSE',
      assignedFaculty: [faculty._id]
    });

    await Subject.create({
      _id: SUB_IDS.CS703,
      subjectCode: 'CS703',
      subjectName: 'Blockchain Technology',
      departmentId: cseDept._id,
      semester: 'Semester 7',
      year: '4th Year',
      branch: 'CSE',
      assignedFaculty: []
    });

    await Subject.create({
      _id: SUB_IDS.CS704,
      subjectCode: 'CS704',
      subjectName: 'Software Engineering & Quality Assurance',
      departmentId: cseDept._id,
      semester: 'Semester 8',
      year: '4th Year',
      branch: 'CSE',
      assignedFaculty: []
    });

    await Subject.create({
      _id: SUB_IDS.CS705,
      subjectCode: 'CS705',
      subjectName: 'Business Intelligence',
      departmentId: cseDept._id,
      semester: 'Semester 8',
      year: '4th Year',
      branch: 'CSE',
      assignedFaculty: []
    });

    // 5. Seed Sample Paper & Notification
    const samplePaper = await Paper.create({
      uploadedBy: student._id,
      departmentId: cseDept._id,
      semester: 'Semester 7',
      subjectId: compilerSub._id,
      academicYear: '2024-2025',
      paperYear: '2024',
      examType: 'ESE',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/examvault/sample_compiler.pdf',
      filePublicId: 'examvault_compiler_2024',
      status: PAPER_STATUS.APPROVED,
      verificationComments: 'Verified from official department copy',
      verifiedBy: faculty._id,
      verifiedAt: new Date()
    });

    await Notification.create({
      recipientId: student._id,
      paperId: samplePaper._id,
      type: 'PAPER_APPROVED',
      message: 'Your question paper for Compiler Design (CS701) ESE 2024-2025 has been approved by Prof. R. K. Sharma.'
    });

    console.log('\n======================================================');
    console.log('       EXAMVAULT PRE-SEEDED LOGIN CREDENTIALS        ');
    console.log('======================================================');
    console.log('Role    : Student');
    console.log('Email   : student.cse23@sbjit.edu.in');
    console.log('Password: StudentPassword123!\n');
    console.log('Role    : Faculty');
    console.log('Email   : faculty.cse@sbjit.edu.in');
    console.log('Password: FacultyPassword123!\n');
    console.log('Role    : Admin');
    console.log('Email   : admin.cse@sbjit.edu.in');
    console.log('Password: AdminPassword123!');
    console.log('======================================================\n');

  } catch (error) {
    console.error('Database seeding failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
    console.log('--- SEEDING PROCESS COMPLETED ---');
  }
};

seedDatabase();
