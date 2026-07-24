const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  createSubject,
  getSubjects,
  assignFacultyToSubject,
  deleteSubject,
} = require('../controllers/subjectController');

// Department Routes
router
  .route('/departments')
  .get(getDepartments) // Public for signup/filter UI
  .post(protect, authorize('Admin'), createDepartment);

router
  .route('/departments/:id')
  .put(protect, authorize('Admin'), updateDepartment)
  .delete(protect, authorize('Admin'), deleteDepartment);

// Subject Routes
router
  .route('/subjects')
  .get(getSubjects) // Public for dropdown cascade
  .post(protect, authorize('Admin'), createSubject);

router
  .route('/subjects/:id/assign-faculty')
  .put(protect, authorize('Admin'), assignFacultyToSubject);

router
  .route('/subjects/:id')
  .delete(protect, authorize('Admin'), deleteSubject);

module.exports = router;