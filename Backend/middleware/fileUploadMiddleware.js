import multer from 'multer';
import ApiError from '../utils/apiError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file format. Only PDF documents are accepted.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
}).single('file');

export const validatePdfSignature = (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'Please attach a PDF file to upload.'));
  }

  try {
    const fileBuffer = req.file.buffer;
    if (fileBuffer.length < 5) {
      return next(new ApiError(400, 'Uploaded file is too small to be a valid PDF.'));
    }

    // Inspect first 5 bytes for "%PDF-" signature
    const magic = fileBuffer.toString('ascii', 0, 5);
    if (magic !== '%PDF-') {
      return next(new ApiError(400, 'Invalid file content. The document binary signature does not match a valid PDF file.'));
    }

    next();
  } catch (error) {
    return next(new ApiError(500, 'Error validating file signature.'));
  }
};

export const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(413, 'File size exceeds maximum limit of 10MB.'));
      }
      return next(new ApiError(400, `File upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }
    next();
  });
};
