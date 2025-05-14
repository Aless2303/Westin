import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import mongoose from 'mongoose';

// Extend the Express Request interface
interface IGetUserAuthInfoRequest extends Request {
  user?: any;
}

// Generate JWT Token
export const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

// Middleware to protect routes
export const protect = async (
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        res.status(401).json({ message: 'Not authorized, invalid token format' });
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

      if (!decoded || !decoded.id) {
        res.status(401).json({ message: 'Not authorized, token verification failed' });
        return;
      }

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      // Check if user is banned
      if (user.isBanned) {
        res.status(403).json({ message: 'Your account has been banned' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

// Middleware to check if user is admin
export const admin = (
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Alias pentru protect pentru a fi folosit în rutele de admin
export const authenticateUser = protect;

// Middleware pentru a autoriza roluri
export const authorizeRoles = (...roles: string[]) => {
  return (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user' });
    }
    
    if (roles.includes('admin') && req.user.isAdmin) {
      return next();
    }
    
    res.status(403).json({ message: 'Not authorized for this action' });
  };
};