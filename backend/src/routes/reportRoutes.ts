// src/routes/reportRoutes.ts
import express from 'express';
import { 
  getReports, 
  getReportById, 
  createReport, 
  markReportAsRead,
  markAllReportsAsRead,
  deleteReport
} from '../controllers/reportController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// @route   GET /api/reports/:characterId
// @desc    Get reports for a character
// @access  Private
router.get('/:characterId', protect, getReports);

// @route   GET /api/reports/:characterId/:reportId
// @desc    Get a specific report
// @access  Private
router.get('/:characterId/:reportId', protect, getReportById);

// @route   POST /api/reports/:characterId
// @desc    Create a new report
// @access  Private
router.post('/:characterId', protect, createReport);

// @route   PUT /api/reports/:characterId/:reportId/read
// @desc    Mark a report as read
// @access  Private
router.put('/:characterId/:reportId/read', protect, markReportAsRead);

// @route   PUT /api/reports/:characterId/read-all
// @desc    Mark all reports as read
// @access  Private
router.put('/:characterId/read-all', protect, markAllReportsAsRead);

// @route   DELETE /api/reports/:characterId/:reportId
// @desc    Delete a report
// @access  Private
router.delete('/:characterId/:reportId', protect, deleteReport);

export default router;