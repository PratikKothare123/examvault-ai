export const buildPaperDownloadFileName = (paper) => {
  const deptCode = paper.departmentId?.deptCode || 'DEPT';
  const semSlug = paper.semester
    ? paper.semester.replace(/\s+/g, '_').replace('Semester_', 'Sem_')
    : 'Sem';
  const subjectCode = paper.subjectId?.subjectCode || 'PAPER';
  const year = paper.academicYear ? paper.academicYear.split('-')[0] : paper.paperYear || 'Year';
  const examType = paper.examType || 'Exam';

  return `${deptCode}_${semSlug}_${subjectCode}_${year}_${examType}.pdf`;
};
