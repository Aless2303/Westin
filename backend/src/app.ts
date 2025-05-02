// backend/src/app.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';

// Import routes
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import characterRoutes from './routes/characterRoutes';
import mobRoutes from './routes/mobRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import reportRoutes from './routes/reportRoutes';
import itemRoutes from './routes/itemRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Adresa frontend-ului
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/mobs', mobRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/password', passwordResetRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Westin API is running');
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;