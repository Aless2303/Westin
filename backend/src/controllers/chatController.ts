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
    
    // Log for debugging
    console.log('Initiating conversation with targetUserId:', targetUserId);
    console.log('Request user ID:', req.user?._id);
    
    if (!targetUserId) {
      console.error('Invalid request: targetUserId is missing');
      res.status(400).json({ message: 'Target user ID is required' });
      return;
    }

    // Validate that targetUserId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      console.error(`Invalid ObjectId: ${targetUserId}`);
      res.status(400).json({ message: 'Invalid user ID format' });
      return;
    }

    if (targetUserId === req.user._id.toString()) {
      console.error(`Cannot start conversation with self: ${targetUserId} === ${req.user._id}`);
      res.status(400).json({ message: 'Cannot start a conversation with yourself' });
      return;
    }

    // Convertim string IDs în ObjectIds pentru căutare
    const initiatorObjectId = new mongoose.Types.ObjectId(req.user._id);
    const targetObjectId = new mongoose.Types.ObjectId(targetUserId);

    // Get character information for both users
    const initiatorCharacter = await Character.findOne({ userId: initiatorObjectId });
    const targetCharacter = await Character.findOne({ userId: targetObjectId });

    if (!initiatorCharacter) {
      console.error(`Initiator character not found for user: ${req.user._id}`);
      res.status(404).json({ message: 'Your character not found' });
      return;
    }
    
    if (!targetCharacter) {
      console.error(`Target character not found for user: ${targetUserId}`);
      res.status(404).json({ message: 'Target user character not found' });
      return;
    }

    console.log('Initiator character:', {
      id: initiatorCharacter._id,
      name: initiatorCharacter.name,
      userId: initiatorCharacter.userId
    });
    
    console.log('Target character:', {
      id: targetCharacter._id,
      name: targetCharacter.name,
      userId: targetCharacter.userId
    });

    // Check if a conversation already exists between these users in any order
    let conversation = await Conversation.findOne({
      participants: { 
        $all: [
          initiatorObjectId,
          targetObjectId
        ]
      }
    });

    if (conversation) {
      // Log existing conversation details for debugging
      console.log('Found existing conversation:', {
        id: conversation._id,
        participants: conversation.participants,
        participantNames: conversation.participantNames
      });
      
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

    // Create new conversation - mark as accepted by default so it appears for both users
    conversation = await Conversation.create({
      participants: [initiatorObjectId, targetObjectId],
      participantNames: [initiatorCharacter.name, targetCharacter.name],
      lastMessageAt: new Date(),
      isAccepted: true // Marcat ca acceptat pentru a apărea imediat pentru ambii utilizatori
    });

    console.log('Created new conversation:', {
      id: conversation._id,
      participants: conversation.participants,
      participantNames: conversation.participantNames
    });

    // Get the conversation ID
    const conversationId = (conversation._id as mongoose.Types.ObjectId).toString();

    // Create the initial system message
    await ChatMessage.create({
      senderId: req.user._id,
      senderName: initiatorCharacter.name,
      receiverId: targetObjectId,
      receiverName: targetCharacter.name,
      content: `${initiatorCharacter.name} a inițiat o conversație.`,
      timestamp: new Date(),
      isGlobal: false,
      isRead: false,
      conversationId
    });

    // Emit socket event to notify users about the new conversation
    const io = req.app.get('io');
    
    // Notificăm ambii participanți despre noua conversație
    console.log(`Emitting new-conversation event for conversation ID: ${conversationId}`);
    io.to(`user:${initiatorObjectId}`).to(`user:${targetObjectId}`).emit('new-conversation', {
      id: conversation._id,
      participantIds: conversation.participants,
      participantNames: conversation.participantNames,
      lastActivity: conversation.lastMessageAt,
      isAccepted: conversation.isAccepted
    });

    // Adăugăm direct la roomurile socket.io fără a căuta socketurile individuale
    // Acest lucru va funcționa pentru că socket.io gestionează roomurile server-side
    // și nu avem nevoie să găsim socketurile individuale
    io.in(`user:${initiatorObjectId}`).socketsJoin(`conversation:${conversationId}`);
    io.in(`user:${targetObjectId}`).socketsJoin(`conversation:${conversationId}`);
    
    console.log(`Adăugat utilizatorii la camera de conversație: ${conversationId}`);

    res.status(201).json({
      id: conversation._id,
      participantIds: conversation.participants,
      participantNames: conversation.participantNames,
      lastActivity: conversation.lastMessageAt,
      isAccepted: conversation.isAccepted
    });
  } catch (error) {
    console.error('Error in initiateConversation:', error);
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

    // Find the other participant in the conversation
    const otherParticipantId = conversation.participants.find(
      (id) => id.toString() !== req.user._id.toString()
    );

    // Get the other participant's character
    const otherCharacter = await Character.findOne({ userId: otherParticipantId });
    if (!otherCharacter) {
      throw new ApiError('Other participant character not found', 404);
    }

    // Create a system message
    await ChatMessage.create({
      senderId: req.user._id,
      senderName: userCharacter.name,
      receiverId: otherParticipantId,
      receiverName: otherCharacter.name,
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

// @desc    Leave/delete a conversation
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

    // Get the user's character name for socket event
    const userCharacter = await Character.findOne({ userId: req.user._id });
    if (!userCharacter) {
      throw new ApiError('Character not found', 404);
    }

    // Find the other participant
    const otherParticipantId = conversation.participants.find(
      id => id.toString() !== req.user._id.toString()
    );
      
    // Emit socket event to notify the other user
    const io = req.app.get('io');
    io.to(`conversation:${conversationId}`).emit('conversation-user-left', {
      conversationId,
      userId: req.user._id,
      userName: userCharacter.name
    });

    // Delete all messages in this conversation
    await ChatMessage.deleteMany({ conversationId });
    
    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({ message: 'Conversation has been deleted' });
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