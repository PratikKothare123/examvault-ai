const Department = require('../models/Department');

// @desc    Create a new department
// @route   POST /api/admin/departments
// @access  Private/Admin
const createDepartment = async (req, res) => {
  try {
    const { deptCode, deptName } = req.body;

    if (!deptCode || !deptName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both department code and department name.',
      });
    }

    const existingDept = await Department.findOne({
      $or: [{ deptCode: deptCode.toUpperCase() }, { deptName }],
    });

    if (existingDept) {
      return res.status(409).json({
        success: false,
        message: 'Department code or name already exists.',
      });
    }

    const department = await Department.create({
      deptCode: deptCode.toUpperCase(),
      deptName,
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: department,
    });
  } catch (error) {
    console.error('Create Department Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating department.',
    });
  }
};

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Public (Used for registration dropdowns and paper filtering)
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ deptCode: 1 });

    return res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    console.error('Get Departments Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching departments.',
    });
  }
};

// @desc    Update department
// @route   PUT /api/admin/departments/:id
// @access  Private/Admin
const updateDepartment = async (req, res) => {
  try {
    const { deptCode, deptName } = req.body;

    let department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    if (deptCode) department.deptCode = deptCode.toUpperCase();
    if (deptName) department.deptName = deptName;

    await department.save();

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      data: department,
    });
  } catch (error) {
    console.error('Update Department Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating department.',
    });
  }
};

// @desc    Delete department
// @route   DELETE /api/admin/departments/:id
// @access  Private/Admin
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    await department.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.',
    });
  } catch (error) {
    console.error('Delete Department Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting department.',
    });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
};