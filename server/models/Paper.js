const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema(
  {
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    assignedFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Set automatically based on Subject's assigned faculty
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
    section: {
      type: String,
      required: [true, 'Section is required'],
      enum: ['Section A', 'Section B', 'Section C'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required (e.g., 2024-2025)'],
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in YYYY-YYYY format'],
    },
    examType: {
      type: String,
      required: [true, 'Exam type is required'],
      enum: ['CAE-I', 'End-Sem', 'CAE-II'],
    },
    fileUrl: {
      type: String,
      required: [true, 'Cloudinary file URL is required'],
    },
    filePublicId: {
      type: String,
      required: [true, 'Cloudinary public asset ID is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    rejectionReason: {
      type: String,
      default: '',
      required: function () {
        return this.status === 'REJECTED';
      },
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for high-performance dropdown filtering
paperSchema.index({
  department: 1,
  semester: 1,
  subject: 1,
  academicYear: 1,
  examType: 1,
  status: 1,
});

module.exports = mongoose.model('Paper', paperSchema);