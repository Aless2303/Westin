// backend/src/routes/mapImageRoutes.ts
import express from 'express';
import {
  getMapImages,
  getMapImageById,
  getMapImageByName,
  getMapImageByType,
  getMapImageDataById,
  getMapImageDataByName,
  getLoginBackground,
  getGameMap
} from '../controllers/mapImageController';

const router = express.Router();

// Get all map images (without images)
router.get('/', getMapImages);

// Get login background image directly
router.get('/login_background', getLoginBackground);

// Get game map image directly
router.get('/game-map', getGameMap);

// Get map image by type
router.get('/type/:type', getMapImageByType);

// Get map image by name
router.get('/name/:name', getMapImageByName);

// Get map image binary data by name
router.get('/name/:name/image', getMapImageDataByName);

// Get map image by ID
router.get('/:id', getMapImageById);

// Get map image binary data by ID
router.get('/:id/image', getMapImageDataById);

export default router;