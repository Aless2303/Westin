import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ChatMessage from '../models/chatMessageModel';
import Conversation from '../models/conversationModel';
import { ApiError } from '../middleware/errorMiddleware';
import Character from '../models/characterModel';

// @desc    Get global chat messages
// @route   GET /api/chat/global
// @access  Private
export const getGlobalMessages = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    // Get the most recent global messages (limit to 50)
    const messages = await ChatMessage.find({ isGlobal: true })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    res.status(200).json(messages.reverse()); // Reverse to get oldest first
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

// @desc    Get user's conversations
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      throw new ApiError('User not authenticated', 401);
    }

    // Find all conversations that the user is a participant in
    const conversations = await Conversation.find({
      participants: req.user._id
    }).sort({ lastMessageAt: -1 }).lean();

    // Format the response with additional data
    const formattedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        // Get the other participant's info
        const otherParticipantIndex = conversation.participants.findIndex(
          (id) => id.toString() !== req.user._id.toString()
        );

        // Get the unread messages count
        const unreadCount = await ChatMessage.countDocuments({
          conversationId: conversation._id.toString(),
          receiverId: req.user._id,
          isRead: false
        });

        // Get the latest message
        const latestMessage = await ChatMessage.findOne({
          conversationId: conversation._id.toString()
        }).sort({ timestamp: -1 }).lean();

        return {
          id: conversation._id,
          participantIds: conversation.participants,
          participantNames: conversation.participantNames,
          otherParticipantId: conversation.participants[otherParticipantIndex],
          otherParticipantName: conversation.participantNames[otherParticipantIndex],
          lastActivity: conversation.lastMessageAt,
          isAccepted: conversation.isAccepted,
          unreadCount,
          latestMessage
        };
      })
    );

    res.status(200).json(formattedConversations);
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

// @desc    Get messages from a specific conversation
// @route   GET /api/chat/conversations/:conversationId
// @access  Private
export const getConversationMessages = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new ApiError('Invalid conversation ID', 400);
    }

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ApiError('Conversation not found', 404);
    }

    if (!conversation.participants.includes(req.user._id)) {
      throw new ApiError('Not authorized to access this conversation', 403);
    }

    // Get messages for this conversation
    const messages = await ChatMessage.find({ conversationId })
      .sort({ timestamp: 1 })
      .lean();

    // Mark messages as read
    await ChatMessage.updateMany(
      { 
        conversationId,
        receiverId: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    res.status(200).json(messages);
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

// @desc    Initiate a new private conversation
// @route   POST /api/chat/conversations
// @access  Private
export const initiateConversation = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      throw new ApiError('Invalid user ID', 400);
    }

    if (targetUserId === req.user._id.toString()) {
      throw new ApiError('Cannot start a conversation with yourself', 400);
    }

    // Get character information for both users
    const initiatorCharacter = await Character.findOne({ userId: req.user._id });
    const targetCharacter = await Character.findOne({ userId: targetUserId });

    if (!initiatorCharacter || !targetCharacter) {
      throw new ApiError('Character not found', 404);
    }

    // Check if a conversation already exists between these users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, targetUserId] }
    });

    if (conversation) {
      // If conversation exists, return it
      res.status(200).json({
        id: conversation._id,
        participantIds: conversation.participants,
        participantNames: conversation.participantNames,
        lastActivity: conversation.lastMessageAt,
        isAccepted: conversation.isAccepted
      });
      return;
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [req.user._id, targetUserId],
      participantNames: [initiatorCharacter.name, targetCharacter.name],
      lastMessageAt: new Date(),
      isAccepted: false // Target user needs to accept
    });

    // Get the conversation ID
    const conversationId = (conversation._id as mongoose.Types.ObjectId).toString();

    // Create the initial system message
    await ChatMessage.create({
      senderId: req.user._id,
      senderName: initiatorCharacter.name,
      receiverId: targetUserId,
      receiverName: targetCharacter.name,
      content: `${initiatorCharacter.name} a inițiat o conversație.`,
      timestamp: new Date(),
      isGlobal: false,
      isRead: false,
      conversationId
    });

    res.status(201).json({
      id: conversation._id,
      participantIds: conversation.participants,
      participantNames: conversation.participantNames,
      lastActivity: conversation.lastMessageAt,
      isAccepted: conversation.isAccepted
    });
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

// @desc    Accept a conversation request
// @route   PUT /api/chat/conversations/:conversationId/accept
// @access  Private
export const acceptConversation = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new ApiError('Invalid conversation ID', 400);
    }

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ApiError('Conversation not found', 404);
    }

    if (!conversation.participants.includes(req.user._id)) {
      throw new ApiError('Not authorized to modify this conversation', 403);
    }

    // Update conversation status
    conversation.isAccepted = true;
    await conversation.save();

    // Get character information
    const userCharacter = await Character.findOne({ userId: req.user._id });
    if (!userCharacter) {
      throw new ApiError('Character not found', 404);
    }

    // Get the conversation ID as string
    const conversationIdStr = (conversation._id as mongoose.Types.ObjectId).toString();

    // Create a system message
    await ChatMessage.create({
      senderId: req.user._id,
      senderName: userCharacter.name,
      content: `${userCharacter.name} a acceptat conversația.`,
      timestamp: new Date(),
      isGlobal: false,
      isRead: false,
      conversationId: conversationIdStr
    });

    res.status(200).json({
      id: conversation._id,
      isAccepted: conversation.isAccepted
    });
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

// @desc    Reject/delete a conversation
// @route   DELETE /api/chat/conversations/:conversationId
// @access  Private
export const rejectConversation = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new ApiError('Invalid conversation ID', 400);
    }

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ApiError('Conversation not found', 404);
    }

    if (!conversation.participants.includes(req.user._id)) {
      throw new ApiError('Not authorized to modify this conversation', 403);
    }

    // Delete all messages in this conversation
    await ChatMessage.deleteMany({ conversationId });

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({ message: 'Conversation deleted successfully' });
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