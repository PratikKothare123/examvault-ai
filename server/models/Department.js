const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    deptCode: {
      type: String,
      required: [true, 'Department code is required (e.g., CSE, IT)'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    deptName: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Department', departmentSchema);