import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Paper from '../models/Paper.js';
import Notification from '../models/Notification.js';
import Subject from '../models/Subject.js';
import Department from '../models/Department.js';

test('Paper schema covers upload and review workflow fields', () => {
  const paths = Paper.schema.paths;

  [
    'departmentId',
    'semester',
    'subjectId',
    'academicYear',
    'examType',
    'fileUrl',
    'uploadedBy',
    'status',
    'reviewedBy',
    'rejectionReason',
    'createdAt'
  ].forEach(field => assert.ok(paths[field], `${field} should exist`));

  assert.equal(paths.departmentId.options.ref, 'Department');
  assert.equal(paths.subjectId.options.ref, 'Subject');
  assert.equal(paths.uploadedBy.options.ref, 'User');
  assert.deepEqual(paths.status.enumValues, ['Pending', 'Approved', 'Rejected']);
});

test('Notification schema includes recipient, sender, paper and unread defaults', () => {
  const paths = Notification.schema.paths;

  [
    'recipientId',
    'senderId',
    'type',
    'message',
    'isRead',
    'paperId',
    'createdAt'
  ].forEach(field => assert.ok(paths[field], `${field} should exist`));

  assert.equal(paths.recipientId.options.ref, 'User');
  assert.equal(paths.senderId.options.ref, 'User');
  assert.equal(paths.paperId.options.ref, 'Paper');
  assert.equal(paths.isRead.defaultValue, false);
  assert.ok(paths.type.enumValues.includes('NEW_PENDING_PAPER'));
  assert.ok(paths.type.enumValues.includes('NO_FACULTY_ASSIGNED'));
});

test('Department and Subject schemas are linked via ObjectIds', () => {
  assert.equal(Department.schema.paths.deptCode.options.unique, true);
  assert.equal(Subject.schema.paths.departmentId.instance, 'ObjectId');
  assert.equal(Subject.schema.paths.departmentId.options.ref, 'Department');
  assert.equal(Subject.schema.paths.assignedFaculty.$embeddedSchemaType.instance, 'ObjectId');
  assert.equal(Subject.schema.paths.assignedFaculty.$embeddedSchemaType.options.ref, 'User');
});

test('rejected paper requires sufficiently detailed rejection feedback', async () => {
  const validObjectId = new mongoose.Types.ObjectId();
  const paper = new Paper({
    uploadedBy: validObjectId,
    departmentId: validObjectId,
    semester: 'Semester 7',
    subjectId: validObjectId,
    academicYear: '2025-2026',
    examType: 'ESE',
    fileUrl: 'https://example.com/paper.pdf',
    filePublicId: 'paper-public-id',
    status: 'Rejected',
    rejectionReason: 'Too short'
  });

  await assert.rejects(() => paper.validate(), /Rejection reason/);
});
