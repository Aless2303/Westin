// backend/src/app.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import ChatMessage from './models/chatMessageModel';
import Conversation from './models/conversationModel';
import Character from './models/characterModel';

// Import routes
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import characterRoutes from './routes/characterRoutes';
import mobRoutes from './routes/mobRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import reportRoutes from './routes/reportRoutes';
import itemRoutes from './routes/itemRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import mapImageRoutes from './routes/mapImageRoutes';
import backgroundRoutes from "./routes/backgroundRoutes";
import raceRoutes from "./routes/raceRoutes";
import chatRoutes from "./routes/chatRoutes";

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Adresa frontend-ului
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
app.use('/api/map-images', mapImageRoutes);
app.use("/api/backgrounds", backgroundRoutes);
app.use("/api/races", raceRoutes);
app.use("/api/chat", chatRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Westin API is running');
});

// Socket.io connection handling
const connectedUsers = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret', async (err: any, decoded: any) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'));
      }

      socket.data.userId = decoded.id;
      
      // Get the character associated with this user
      const character = await Character.findOne({ userId: decoded.id });
      if (character) {
        socket.data.characterId = character._id;
        socket.data.characterName = character.name;
      }
      
      next();
    });
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', async (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  const userId = socket.data.userId;
  const characterId = socket.data.characterId;
  const characterName = socket.data.characterName;
  
  if (userId && characterId) {
    // Add user to connected users map
    connectedUsers.set(userId, {
      socketId: socket.id,
      characterId,
      characterName
    });
    
    // Join global chat room
    socket.join('global');
    
    // Join user's private room for personal messages
    socket.join(`user:${userId}`);
    
    // Fetch and join user's conversations
    const conversations = await Conversation.find({
      participants: userId
    });
    
    conversations.forEach(conversation => {
      socket.join(`conversation:${conversation._id}`);
    });
  }
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (userId) {
      connectedUsers.delete(userId);
    }
  });
  
  // Listen for global message
  socket.on('global-message', async (data) => {
    try {
      if (!data.content || !data.content.trim()) {
        return;
      }
      
      // Create message in database
      const message = await ChatMessage.create({
        senderId: userId,
        senderName: characterName,
        content: data.content,
        timestamp: new Date(),
        isGlobal: true,
        isRead: true
      });
      
      // Broadcast message to all clients in global room
      io.to('global').emit('global-message', {
        id: message._id,
        senderId: userId,
        senderName: characterName,
        content: data.content,
        timestamp: message.timestamp
      });
    } catch (error) {
      console.error('Error sending global message:', error);
    }
  });
  
  // Listen for private message
  socket.on('private-message', async (data) => {
    try {
      if (!data.content || !data.content.trim() || !data.conversationId) {
        return;
      }
      
      // Find the conversation
      const conversation = await Conversation.findById(data.conversationId);
      if (!conversation) {
        return socket.emit('error', { message: 'Conversation not found' });
      }
      
      // Ensure user is part of the conversation
      if (!conversation.participants.includes(new mongoose.Types.ObjectId(userId))) {
        return socket.emit('error', { message: 'Not authorized to send message in this conversation' });
      }
      
      // Get the other participant
      const otherParticipantId = conversation.participants.find(
        id => id.toString() !== userId
      );
      
      const otherParticipantIndex = conversation.participants.findIndex(
        id => id.toString() !== userId
      );
      
      const otherParticipantName = conversation.participantNames[otherParticipantIndex];
      
      // Create message in database
      const message = await ChatMessage.create({
        senderId: userId,
        senderName: characterName,
        receiverId: otherParticipantId,
        receiverName: otherParticipantName,
        content: data.content,
        timestamp: new Date(),
        isGlobal: false,
        isRead: false,
        conversationId: data.conversationId
      });
      
      // Update conversation's last message time
      conversation.lastMessageAt = new Date();
      await conversation.save();
      
      // Send message to all clients in the conversation room
      io.to(`conversation:${data.conversationId}`).emit('private-message', {
        id: message._id,
        senderId: userId,
        senderName: characterName,
        receiverId: otherParticipantId,
        receiverName: otherParticipantName,
        content: data.content,
        timestamp: message.timestamp,
        isRead: false,
        conversationId: data.conversationId
      });
    } catch (error) {
      console.error('Error sending private message:', error);
    }
  });
  
  // Listen for read receipt
  socket.on('mark-as-read', async (data) => {
    try {
      if (!data.conversationId) {
        return;
      }
      
      // Update messages as read
      await ChatMessage.updateMany(
        { 
          conversationId: data.conversationId,
          receiverId: userId,
          isRead: false
        },
        { isRead: true }
      );
      
      // Notify sender that messages were read
      io.to(`conversation:${data.conversationId}`).emit('messages-read', {
        conversationId: data.conversationId,
        readerId: userId
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });
  
  // Listen for typing indicator
  socket.on('typing', (data) => {
    if (!data.conversationId) {
      return;
    }
    
    socket.to(`conversation:${data.conversationId}`).emit('typing', {
      conversationId: data.conversationId,
      userId,
      characterName,
      isTyping: data.isTyping
    });
  });
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
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;