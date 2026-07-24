import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import deptRoutes from './routes/deptRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import facultyAssignmentRoutes from './routes/facultyAssignmentRoutes.js';
import paperRoutes from './routes/paperRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';
import { sanitizeInput } from './middleware/sanitizeMiddleware.js';
import morgan from 'morgan';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import ApiError from './utils/apiError.js';

// Load environmental variables
dotenv.config();

// Connect database Mongoose
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Restrict when deploying
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// HTTP Request Logging Stream via Morgan & Winston
app.use(morgan('combined', { 
  stream: { write: (message) => logger.info(message.trim()) } 
}));
// Parse body requests
app.use(express.json());

// Sanitize inputs (NoSQL & XSS prevention)
app.use(sanitizeInput);

// Configure General Rate Limiting
app.use('/api/', apiLimiter);

// Bind API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/departments', deptRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/faculty-assignments', facultyAssignmentRoutes);
app.use('/api/v1/papers', paperRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

// Base sanity check path
app.get('/', (req, res) => {
  res.json({ message: 'ExamVault API Service is active.' });
});

// Handle undefined endpoints
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Endpoint ${req.originalUrl} not found.`));
});

// Error handling pipeline
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running in [${process.env.NODE_ENV}] mode on port [${PORT}]`);
});
