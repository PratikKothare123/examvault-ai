import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPaperDownloadFileName } from '../utils/paperFileName.js';

test('buildPaperDownloadFileName creates clean dynamic secure download names', () => {
  const fileName = buildPaperDownloadFileName({
    departmentId: { deptCode: 'CSE' },
    semester: 'Semester 7',
    subjectId: { subjectCode: 'CS701' },
    academicYear: '2025-2026',
    examType: 'ESE'
  });

  assert.equal(fileName, 'CSE_Sem_7_CS701_2025_ESE.pdf');
});

test('buildPaperDownloadFileName tolerates partially populated paper documents', () => {
  const fileName = buildPaperDownloadFileName({
    semester: 'Semester 1',
    examType: 'CAE-I',
    paperYear: '2024'
  });

  assert.equal(fileName, 'DEPT_Sem_1_PAPER_2024_CAE-I.pdf');
});
