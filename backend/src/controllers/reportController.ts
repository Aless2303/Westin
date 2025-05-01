import { Request, Response } from 'express';
import Report from '../models/reportModel';
import Character from '../models/characterModel';
import { ApiError } from '../middleware/errorMiddleware';
import mongoose from 'mongoose';

// @desc    Get reports for a character
// @route   GET /api/reports/:characterId
// @access  Private
export const getReports = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;

    // Validate characterId
    if (!mongoose.Types.ObjectId.isValid(characterId)) {
      throw new ApiError('Invalid character ID', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized to view this character's reports
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to view these reports', 401);
    }

    // Get reports
    const reports = await Report.find({ characterId }).sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get a specific report
// @route   GET /api/reports/:characterId/:reportId
// @access  Private
export const getReportById = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId, reportId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(characterId) || !mongoose.Types.ObjectId.isValid(reportId)) {
      throw new ApiError('Invalid IDs provided', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized to view this character's reports
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to view this report', 401);
    }

    // Get report
    const report = await Report.findOne({ _id: reportId, characterId });

    if (!report) {
      throw new ApiError('Report not found', 404);
    }

    // Mark as read if not already
    if (!report.read) {
      report.read = true;
      await report.save();
    }

    res.status(200).json(report);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Create a new report
// @route   POST /api/reports/:characterId
// @access  Private
export const createReport = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;
    const { type, subject, content, read, playerName, mobName, mobType, result, combatStats } = req.body;

    // Validate characterId
    if (!mongoose.Types.ObjectId.isValid(characterId)) {
      throw new ApiError('Invalid character ID', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized to create reports for this character
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to create reports for this character', 401);
    }

    // Validate required fields
    if (!type || !subject || !content) {
      throw new ApiError('Type, subject, and content are required', 400);
    }

    // Create report
    const report = await Report.create({
      characterId,
      type,
      subject,
      content,
      read: read || false,
      playerName,
      mobName,
      mobType,
      result,
      combatStats
    });

    res.status(201).json(report);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Mark a report as read
// @route   PUT /api/reports/:characterId/:reportId/read
// @access  Private
export const markReportAsRead = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId, reportId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(characterId) || !mongoose.Types.ObjectId.isValid(reportId)) {
      throw new ApiError('Invalid IDs provided', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized to modify this character's reports
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to modify this report', 401);
    }

    // Get report
    const report = await Report.findOne({ _id: reportId, characterId });

    if (!report) {
      throw new ApiError('Report not found', 404);
    }

    // Mark as read
    report.read = true;
    await report.save();

    res.status(200).json(report);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Mark all reports as read
// @route   PUT /api/reports/:characterId/read-all
// @access  Private
export const markAllReportsAsRead = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;

    // Validate characterId
    if (!mongoose.Types.ObjectId.isValid(characterId)) {
      throw new ApiError('Invalid character ID', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized to modify this character's reports
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to modify these reports', 401);
    }

    // Mark all as read
    await Report.updateMany({ characterId, read: false }, { read: true });

    // Get updated reports
    const reports = await Report.find({ characterId }).sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:characterId/:reportId
// @access  Private
export const deleteReport = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { characterId, reportId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(characterId) || !mongoose.Types.ObjectId.isValid(reportId)) {
      throw new ApiError('Invalid IDs provided', 400);
    }

    // Get character
    const character = await Character.findById(characterId);

    if (!character) {
      throw new ApiError('Character not found', 404);
    }

    // Check if user is authorized to modify this character's reports
    if (req.user && character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new ApiError('Not authorized to delete this report', 401);
    }

    // Delete report
    const report = await Report.findOneAndDelete({ _id: reportId, characterId });

    if (!report) {
      throw new ApiError('Report not found', 404);
    }

    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};