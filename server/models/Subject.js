const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required (e.g., CS601)'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      enum: [
        'Semester 1',
        'Semester 2',
        'Semester 3',
        'Semester 4',
        'Semester 5',
        'Semester 6',
        'Semester 7',
        'Semester 8',
      ],
    },
    assignedFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Admin assigns this later
    },
  },
  {
    timestamps: true,
  }
);

// Ensures a subject code is unique within a department
subjectSchema.index({ subjectCode: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);