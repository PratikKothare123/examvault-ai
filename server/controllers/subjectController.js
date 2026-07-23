const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Create a new subject
// @route   POST /api/admin/subjects
// @access  Private/Admin
const createSubject = async (req, res) => {
  try {
    const { subjectCode, subjectName, department, semester, assignedFaculty } =
      req.body;

    if (!subjectCode || !subjectName || !department || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Subject code, name, department, and semester are required.',
      });
    }

    // Verify assigned user is actually a Faculty member
    if (assignedFaculty) {
      const faculty = await User.findById(assignedFaculty);
      if (!faculty || faculty.role !== 'Faculty') {
        return res.status(400).json({
          success: false,
          message: 'Assigned user must exist and have the Faculty role.',
        });
      }
    }

    const existingSubject = await Subject.findOne({
      subjectCode: subjectCode.toUpperCase(),
      department,
    });

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message: 'A subject with this code already exists in this department.',
      });
    }

    const subject = await Subject.create({
      subjectCode: subjectCode.toUpperCase(),
      subjectName,
      department,
      semester,
      assignedFaculty: assignedFaculty || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      data: subject,
    });
  } catch (error) {
    console.error('Create Subject Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating subject.',
    });
  }
};

// @desc    Get subjects (supports dynamic filtering by department & semester)
// @route   GET /api/admin/subjects
// @access  Public (Cascading dropdown filtering)
const getSubjects = async (req, res) => {
  try {
    const { department, semester } = req.query;
    let filter = {};

    if (department) filter.department = department;
    if (semester) filter.semester = semester;

    const subjects = await Subject.find(filter)
      .populate('department', 'deptCode deptName')
      .populate('assignedFaculty', 'fullName email')
      .sort({ subjectCode: 1 });

    return res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error('Get Subjects Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching subjects.',
    });
  }
};

// @desc    Assign or reassign faculty to a subject
// @route   PUT /api/admin/subjects/:id/assign-faculty
// @access  Private/Admin
const assignFacultyToSubject = async (req, res) => {
  try {
    const { facultyId } = req.body;

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID is required.',
      });
    }

    const faculty = await User.findById(facultyId);
    if (!faculty || faculty.role !== 'Faculty') {
      return res.status(400).json({
        success: false,
        message: 'User not found or is not assigned the Faculty role.',
      });
    }

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { assignedFaculty: facultyId },
      { new: true, runValidators: true }
    )
      .populate('department', 'deptCode deptName')
      .populate('assignedFaculty', 'fullName email');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Faculty assigned to subject successfully.',
      data: subject,
    });
  } catch (error) {
    console.error('Assign Faculty Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error mapping faculty to subject.',
    });
  }
};

// @desc    Delete a subject
// @route   DELETE /api/admin/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found.',
      });
    }

    await subject.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Subject deleted successfully.',
    });
  } catch (error) {
    console.error('Delete Subject Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting subject.',
    });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  createSubject,
  getSubjects,
  assignFacultyToSubject,
  deleteSubject,
};