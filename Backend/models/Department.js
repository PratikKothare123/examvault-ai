import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  deptCode: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
    minlength: [2, 'Department code must be at least 2 characters'],
    maxlength: [10, 'Department code cannot exceed 10 characters']
  },
  deptName: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    minlength: [3, 'Department name must be at least 3 characters'],
    maxlength: [100, 'Department name cannot exceed 100 characters']
  }
}, {
  timestamps: true
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;
