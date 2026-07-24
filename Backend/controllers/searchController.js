import { searchPapersService } from '../services/searchService.js';
import { sendResponse } from '../utils/responseFormatter.js';

export const searchPapers = async (req, res, next) => {
  try {
    const { departmentId, semester, section, subjectId, academicYear, paperYear, examType } = req.query;

    const papers = await searchPapersService({
      departmentId,
      semester,
      section,
      subjectId,
      academicYear,
      paperYear,
      examType
    });

    return sendResponse(res, 200, 'Papers matching filters fetched successfully', { papers });
  } catch (error) {
    next(error);
  }
};
