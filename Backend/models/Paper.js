import mongoose from 'mongoose';
import { PAPER_TYPES, PAPER_STATUS, SEMESTERS } from '../constants/paper.constants.js';

const paperSchema = new mongoose.Schema({
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader reference is required'],
    index: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department reference is required'],
    index: true
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: {
      values: SEMESTERS,
      message: '{VALUE} is not a valid semester'
    }
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject reference is required'],
    index: true
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{4}-\d{4}$/.test(v);
      },
      message: props => `${props.value} is not a valid academic year format! Must be YYYY-YYYY (e.g. 2024-2025).`
    }
  },
  paperYear: {
    type: String,
    default: '2024',
    trim: true
  },
  examType: {
    type: String,
    required: [true, 'Exam type is required'],
    enum: {
      values: PAPER_TYPES,
      message: '{VALUE} is not a valid exam type'
    }
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  filePublicId: {
    type: String,
    required: [true, 'File public ID is required']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: Object.values(PAPER_STATUS),
    default: PAPER_STATUS.PENDING,
    index: true
  },
  assignedFacultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  rejectionReason: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (this.status === PAPER_STATUS.REJECTED) {
          return typeof v === 'string' && v.trim().length >= 10;
        }
        return true;
      },
      message: 'Rejection reason must be provided and contain at least 10 characters.'
    }
  },
  verificationComments: {
    type: String,
    default: ''
  },
  version: {
    type: Number,
    default: 1
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Composite index for fast verified paper lookup
paperSchema.index({ departmentId: 1, semester: 1, subjectId: 1, status: 1 });

export default mongoose.model('Paper', paperSchema);
