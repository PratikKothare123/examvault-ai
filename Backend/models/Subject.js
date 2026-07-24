import mongoose from 'mongoose';
import { SEMESTERS } from '../constants/paper.constants.js';

const subjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: [true, 'Subject code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
    minlength: [2, 'Subject code must be at least 2 characters'],
    maxlength: [15, 'Subject code cannot exceed 15 characters']
  },
  subjectName: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    minlength: [3, 'Subject name must be at least 3 characters'],
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department reference is required'],
    index: true
  },
  semester: {
    type: String,
    required: [true, 'Semester designation is required'],
    enum: {
      values: SEMESTERS,
      message: '{VALUE} is not a valid semester enum'
    },
    index: true
  },
  year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    default: '1st Year'
  },
  branch: {
    type: String,
    default: 'All Branches'
  },
  assignedFaculty: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
