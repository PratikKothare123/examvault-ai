import toast from 'react-hot-toast';

export const getPaperFileName = (paper, fallbackName = 'paper.pdf') => {
  const deptCode = paper?.departmentId?.deptCode || '';
  const semNum = paper?.semester ? paper.semester.replace('Semester ', 'Sem_') : '';
  const subCode = paper?.subjectId?.subjectCode || '';
  const year = paper?.academicYear ? paper.academicYear.split('-')[0] : '';
  const examType = paper?.examType || '';

  return deptCode && semNum && subCode && year && examType
    ? `${deptCode}_${semNum}_${subCode}_${year}_${examType}.pdf`
    : fallbackName;
};

export const downloadPaperFile = async (paper, customFilename) => {
  if (!paper?._id) {
    toast.error('Unable to download this paper. Paper details are missing.');
    return;
  }

  if (paper.status && paper.status !== 'Approved') {
    toast.error('Only approved papers can be downloaded.');
    return;
  }

  const token = localStorage.getItem('token') || '';
  const response = await fetch(`/api/v1/papers/${paper._id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!response.ok) {
    let message = 'We can not download this file. Something went wrong.';
    try {
      const errorJson = await response.json();
      message = errorJson.message || message;
    } catch {
      // Keep the generic message for non-JSON failures.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new Error('We can not open this file. Something went wrong with the download.');
  }

  const fileName = customFilename || getPaperFileName(paper);
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
  toast.success(`Downloading ${fileName}`);
};
