import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePaperMetadata } from '../validators/paperValidator.js';

const validObjectId = '66a000000000000000000001';

const runValidator = (body) => {
  let forwardedError;
  validatePaperMetadata({ body }, {}, (error) => {
    forwardedError = error;
  });
  return forwardedError;
};

test('validatePaperMetadata accepts complete valid upload metadata', () => {
  const error = runValidator({
    departmentId: validObjectId,
    semester: 'Semester 7',
    subjectId: validObjectId,
    academicYear: '2025-2026',
    examType: 'ESE'
  });

  assert.equal(error, undefined);
});

test('validatePaperMetadata rejects malformed academic years', () => {
  const error = runValidator({
    departmentId: validObjectId,
    semester: 'Semester 7',
    subjectId: validObjectId,
    academicYear: '2025',
    examType: 'ESE'
  });

  assert.equal(error.statusCode, 400);
  assert.match(error.message, /academic year/i);
});
