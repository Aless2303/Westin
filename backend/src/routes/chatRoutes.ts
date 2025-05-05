import express from 'express';
import { 
  getGlobalMessages,
  getConversations,
  getConversationMessages,
  initiateConversation,
  acceptConversation,
  rejectConversation
} from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// @route   GET /api/chat/global
// @desc    Get global chat messages
// @access  Private
router.get('/global', protect, getGlobalMessages);

// @route   GET /api/chat/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', protect, getConversations);

// @route   GET /api/chat/conversations/:conversationId
// @desc    Get messages from a specific conversation
// @access  Private
router.get('/conversations/:conversationId', protect, getConversationMessages);

// @route   POST /api/chat/conversations
// @desc    Initiate a new private conversation
// @access  Private
router.post('/conversations', protect, initiateConversation);

// @route   PUT /api/chat/conversations/:conversationId/accept
// @desc    Accept a conversation request
// @access  Private
router.put('/conversations/:conversationId/accept', protect, acceptConversation);

// @route   DELETE /api/chat/conversations/:conversationId
// @desc    Reject/delete a conversation
// @access  Private
router.delete('/conversations/:conversationId', protect, rejectConversation);

export default router; 