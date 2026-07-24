import mongoose from 'mongoose';

const facultyAssignmentSchema = new mongoose.Schema({
  facultyUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Faculty user reference is required'],
    index: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject reference is required'],
    index: true
  }
}, {
  timestamps: true
});

// Ensure a faculty member cannot be assigned to the same subject twice
facultyAssignmentSchema.index({ facultyUserId: 1, subjectId: 1 }, { unique: true });

const FacultyAssignment = mongoose.model('FacultyAssignment', facultyAssignmentSchema);
export default FacultyAssignment;
