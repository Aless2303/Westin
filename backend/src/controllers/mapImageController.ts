// backend/src/controllers/mapImageController.ts
import { Request, Response } from 'express';
import MapImage from '../models/mapImageModel';
import { ApiError } from '../middleware/errorMiddleware';
import mongoose from 'mongoose';





// @desc    Get all map images (metadata only, no binary data)
// @route   GET /api/map-images
// @access  Public
export const getMapImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const mapImages = await MapImage.find().select('-image');
    res.status(200).json(mapImages);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get map image by ID
// @route   GET /api/map-images/:id
// @access  Public
export const getMapImageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const mapImage = await MapImage.findById(req.params.id).select('-image');
    
    if (!mapImage) {
      res.status(404).json({ message: 'Map image not found' });
      return;
    }
    
    res.status(200).json(mapImage);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get map image by name
// @route   GET /api/map-images/name/:name
// @access  Public
export const getMapImageByName = async (req: Request, res: Response): Promise<void> => {
  try {
    const mapImage = await MapImage.findOne({
      $or: [
        { name: req.params.name },
        { filename: req.params.name }
      ]
    }).select('-image');
    
    if (!mapImage) {
      res.status(404).json({ message: 'Map image not found' });
      return;
    }
    
    res.status(200).json(mapImage);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get map image by type
// @route   GET /api/map-images/type/:type
// @access  Public
export const getMapImageByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const mapImage = await MapImage.findOne({
      type: req.params.type
    }).select('-image');
    
    if (!mapImage) {
      res.status(404).json({ message: 'Map image not found' });
      return;
    }
    
    res.status(200).json(mapImage);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get map image binary data by ID
// @route   GET /api/map-images/:id/image
// @access  Public
export const getMapImageDataById = async (req: Request, res: Response): Promise<void> => {
  try {
    const mapImage = await MapImage.findById(req.params.id);
    
    if (!mapImage || !mapImage.image) {
      res.status(404).json({ message: 'Map image not found' });
      return;
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', mapImage.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${mapImage.filename}"`);
    
    // Send the binary image data
    res.send(mapImage.image);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get map image binary data by name
// @route   GET /api/map-images/name/:name/image
// @access  Public
export const getMapImageDataByName = async (req: Request, res: Response): Promise<void> => {
  try {
    const mapImage = await MapImage.findOne({
      $or: [
        { name: req.params.name },
        { filename: req.params.name }
      ]
    });
    
    if (!mapImage || !mapImage.image) {
      res.status(404).json({ message: 'Map image not found' });
      return;
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', mapImage.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${mapImage.filename}"`);
    
    // Send the binary image data
    res.send(mapImage.image);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};



// @desc    Get login background image
// @route   GET /api/map-images/login-background
// @access  Public
export const getLoginBackground = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching login background image...");
    
    // Access the collection directly instead of using the model
    const db = mongoose.connection.db;
    if (!db) {
      console.log("Database connection not established");
      res.status(500).json({ message: 'Database connection not established' });
      return;
    }
    
    const mapImagesCollection = db.collection('mapImages');
    const mapImage = await mapImagesCollection.findOne({ type: 'login_background' });
    
    if (!mapImage || !mapImage.image) {
      console.log("Login background image not found");
      res.status(404).json({ message: 'Login background image not found' });
      return;
    }
    
    console.log("Login background image found, sending response...");
    
    // Handle the binary data correctly
    let imageData;
    if (mapImage.image.buffer) {
      // If it's stored as a Binary object with buffer property
      imageData = mapImage.image.buffer;
    } else if (mapImage.image.$binary && mapImage.image.$binary.base64) {
      // If it's stored in the MongoDB extended JSON format
      imageData = Buffer.from(mapImage.image.$binary.base64, 'base64');
    } else {
      // If it's just a Buffer
      imageData = mapImage.image;
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', mapImage.mimeType || 'image/jpeg');
    res.setHeader('Content-Disposition', `inline; filename="${mapImage.filename}"`);
    
    // Send the binary image data
    res.send(imageData);
  } catch (error) {
    console.error("Error fetching login background:", error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// @desc    Get game map image
// @route   GET /api/map-images/game-map
// @access  Public
export const getGameMap = async (req: Request, res: Response): Promise<void> => {
  try {
    const mapImage = await MapImage.findOne({
      type: 'game_map'
    });
    
    if (!mapImage || !mapImage.image) {
      res.status(404).json({ message: 'Game map image not found' });
      return;
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', mapImage.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${mapImage.filename}"`);
    
    // Send the binary image data
    res.send(mapImage.image);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};