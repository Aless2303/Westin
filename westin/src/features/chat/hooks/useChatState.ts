"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { GlobalChatMessage, PrivateConversation, ChatType } from '../../../types/chat';
import { useSocket } from '../../../context/SocketContext';
import axios from 'axios';

export const useChatState = (characterId: string, _characterName: string) => {
  // Socket connection
  const { socket, isConnected } = useSocket();
  
  // State for global chat messages
  const [globalMessages, setGlobalMessages] = useState<GlobalChatMessage[]>([]);

  // State for private conversations
  const [privateConversations, setPrivateConversations] = useState<PrivateConversation[]>([]);

  // State for selected private conversation
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // State for pending conversation requests
  const [pendingRequests, setPendingRequests] = useState<PrivateConversation[]>([]);

  // Active chat type (global or private)
  const [activeChatType, setActiveChatType] = useState<ChatType>(ChatType.GLOBAL);

  // State for current message being typed
  const [messageInput, setMessageInput] = useState('');

  // State for player search
  const [searchPlayerInput, setSearchPlayerInput] = useState('');

  // Show player search dialog
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);

  // Reference to avoid infinite loops in markConversationAsRead
  const processedConversationsRef = useRef<Set<string>>(new Set());
  
  // Load initial global messages
  useEffect(() => {
    const fetchGlobalMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('http://localhost:5000/api/chat/global', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setGlobalMessages(response.data);
      } catch (error) {
        console.error('Error fetching global messages:', error);
      }
    };
    
    fetchGlobalMessages();
  }, []);
  
  // Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('http://localhost:5000/api/chat/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Transform the API data to match our frontend format
        const conversations: PrivateConversation[] = response.data.map((conv: {
          id: string;
          participantIds: string[];
          participantNames: string[];
          lastActivity: string | Date;
          isAccepted: boolean;
        }) => {
          return {
            id: conv.id,
            participantIds: conv.participantIds,
            participantNames: conv.participantNames,
            messages: [], // We'll load messages separately when selecting a conversation
            lastActivity: new Date(conv.lastActivity).getTime(),
            isAccepted: conv.isAccepted
          };
        });
        
        setPrivateConversations(conversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };
    
    fetchConversations();
  }, []);
  
  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Listen for new global messages
    socket.on('global-message', (message) => {
      setGlobalMessages(prev => [...prev, {
        id: message.id,
        senderId: message.senderId,
        senderName: message.senderName,
        content: message.content,
        timestamp: new Date(message.timestamp).getTime()
      }]);
    });
    
    // Listen for new private messages
    socket.on('private-message', (message) => {
      setPrivateConversations(prev => {
        const conversationExists = prev.some(conv => conv.id === message.conversationId);
        
        if (!conversationExists) {
          // If this is a new conversation, we should fetch full conversation data
          fetchConversationDetails(message.conversationId);
          return prev;
        }
        
        return prev.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, {
                id: message.id,
                senderId: message.senderId,
                senderName: message.senderName,
                receiverId: message.receiverId,
                receiverName: message.receiverName,
                content: message.content,
                timestamp: new Date(message.timestamp).getTime(),
                isRead: message.isRead
              }],
              lastActivity: new Date(message.timestamp).getTime()
            };
          }
          return conv;
        });
      });
    });
    
    // Listen for messages marked as read
    socket.on('messages-read', (data) => {
      setPrivateConversations(prev => 
        prev.map(conv => {
          if (conv.id === data.conversationId) {
            return {
              ...conv,
              messages: conv.messages.map(msg => {
                if (msg.receiverId === data.readerId && !msg.isRead) {
                  return { ...msg, isRead: true };
                }
                return msg;
              })
            };
          }
          return conv;
        })
      );
    });
    
    // Listen for typing indicators
    socket.on('typing', (data) => {
      // You could add typing indicator state here if needed
      console.log(`${data.characterName} is ${data.isTyping ? 'typing' : 'not typing'}`);
    });
    
    return () => {
      socket.off('global-message');
      socket.off('private-message');
      socket.off('messages-read');
      socket.off('typing');
    };
  }, [socket, isConnected]);
  
  // Fetch conversation details when selecting a conversation
  const fetchConversationDetails = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`http://localhost:5000/api/chat/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const messages = response.data.map((msg: {
        _id: string;
        senderId: string;
        senderName: string;
        receiverId: string;
        receiverName: string;
        content: string;
        timestamp: string | Date;
        isRead: boolean;
      }) => ({
        id: msg._id,
        senderId: msg.senderId,
        senderName: msg.senderName,
        receiverId: msg.receiverId,
        receiverName: msg.receiverName,
        content: msg.content,
        timestamp: new Date(msg.timestamp).getTime(),
        isRead: msg.isRead
      }));
      
      setPrivateConversations(prev => 
        prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages
            };
          }
          return conv;
        })
      );
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    }
  };
  
  // Update pending requests
  useEffect(() => {
    const pendingConvs = privateConversations.filter(
      conv => !conv.isAccepted && conv.participantIds.includes(characterId) 
        && conv.participantIds.indexOf(characterId) !== 0 // Only show requests initiated by others
    );
    setPendingRequests(pendingConvs);
  }, [privateConversations, characterId]);

  // Function to send a global message
  const sendGlobalMessage = useCallback((content: string) => {
    if (!content.trim() || !socket || !isConnected) return;
    
    // Send message via socket
    socket.emit('global-message', { content });
    
    // Clear input (the actual message will be added to the UI when it's received back from the server)
    setMessageInput('');
  }, [socket, isConnected, setMessageInput]);

  // Function to find or create a private conversation with a player
  const findOrCreatePrivateConversation = useCallback(async (targetPlayerId: string, targetPlayerName: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      // Check if conversation already exists
      const existingConversation = privateConversations.find(conv => 
        conv.participantIds.includes(characterId) && 
        conv.participantIds.includes(targetPlayerId)
      );
      
      if (existingConversation) {
        return existingConversation.id;
      }
      
      // If not, create new conversation
      const response = await axios.post('http://localhost:5000/api/chat/conversations', 
        { targetUserId: targetPlayerId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const newConversation: PrivateConversation = {
        id: response.data.id,
        participantIds: response.data.participantIds,
        participantNames: response.data.participantNames,
        messages: [], // We'll load messages when selecting the conversation
        lastActivity: new Date(response.data.lastActivity).getTime(),
        isAccepted: response.data.isAccepted
      };
      
      setPrivateConversations(prev => [...prev, newConversation]);
      return newConversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }, [privateConversations, characterId]);

  // Function to send a private message
  const sendPrivateMessage = useCallback((conversationId: string, content: string /* receiverId: string, receiverName: string */) => {
    if (!content.trim() || !socket || !isConnected) return;
    
    // Send message via socket
    socket.emit('private-message', {
      conversationId,
      content
    });
    
    // Clear input (the actual message will be added to the UI when it's received back from the server)
    setMessageInput('');
  }, [socket, isConnected, setMessageInput]);

  // Function to accept a conversation request
  const acceptConversationRequest = useCallback(async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await axios.put(`http://localhost:5000/api/chat/conversations/${conversationId}/accept`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setPrivateConversations(prev => 
        prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              isAccepted: true
            };
          }
          return conv;
        })
      );
      
      // Select the accepted conversation
      setSelectedConversation(conversationId);
      setActiveChatType(ChatType.PRIVATE);
      
      // Load conversation messages
      fetchConversationDetails(conversationId);
    } catch (error) {
      console.error('Error accepting conversation:', error);
    }
  }, [fetchConversationDetails]);

  // Function to reject a conversation request
  const rejectConversationRequest = useCallback(async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await axios.delete(`http://localhost:5000/api/chat/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setPrivateConversations(prev => 
        prev.filter(conv => conv.id !== conversationId)
      );
    } catch (error) {
      console.error('Error rejecting conversation:', error);
    }
  }, []);

  // Function to close and delete a private conversation
  const closePrivateConversation = useCallback(async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await axios.delete(`http://localhost:5000/api/chat/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setPrivateConversations(prev => 
        prev.filter(conv => conv.id !== conversationId)
      );
    } catch (error) {
      console.error('Error closing conversation:', error);
    }
  }, []);

  // Function to mark messages in a conversation as read
  const markConversationAsRead = useCallback((conversationId: string) => {
    // Check if this conversationId was recently processed
    if (processedConversationsRef.current.has(conversationId)) {
      return; // Skip if already being processed
    }

    // Temporarily add conversationId to processed set
    processedConversationsRef.current.add(conversationId);

    // Check if conversation has unread messages
    const conversation = privateConversations.find(conv => conv.id === conversationId);
    if (!conversation) return;
    
    const hasUnreadMessages = conversation.messages.some(
      msg => msg.receiverId === characterId && !msg.isRead
    );
    
    if (!hasUnreadMessages) return;
    
    // Send read receipt via socket
    if (socket && isConnected) {
      socket.emit('mark-as-read', { conversationId });
    }
    
    setPrivateConversations(prev => {
      const updatedConversations = prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg => {
              if (msg.receiverId === characterId && !msg.isRead) {
                return { ...msg, isRead: true };
              }
              return msg;
            })
          };
        }
        return conv;
      });

      // Remove conversationId from processed set after a short delay
      setTimeout(() => {
        processedConversationsRef.current.delete(conversationId);
      }, 100);

      return updatedConversations;
    });
  }, [privateConversations, characterId, socket, isConnected]);

  // Initiate a new private chat
  const initiatePrivateChat = useCallback(async (targetPlayerId: string, targetPlayerName: string) => {
    const conversationId = await findOrCreatePrivateConversation(targetPlayerId, targetPlayerName);
    if (!conversationId) return;
    
    // Get fresh conversation data
    await fetchConversationDetails(conversationId);
    
    setSelectedConversation(conversationId);
    setActiveChatType(ChatType.PRIVATE);
    setShowPlayerSearch(false);
    setSearchPlayerInput('');
  }, [findOrCreatePrivateConversation, fetchConversationDetails, setSelectedConversation, setActiveChatType, setShowPlayerSearch, setSearchPlayerInput]);

  // Get total unread messages count
  const getUnreadMessagesCount = useCallback(() => {
    return privateConversations.reduce((count, conv) => {
      const unreadMessages = conv.messages.filter(
        msg => msg.receiverId === characterId && !msg.isRead
      );
      return count + unreadMessages.length;
    }, 0);
  }, [privateConversations, characterId]);

  return {
    globalMessages,
    privateConversations,
    pendingRequests,
    selectedConversation,
    setSelectedConversation,
    activeChatType,
    setActiveChatType,
    messageInput,
    setMessageInput,
    searchPlayerInput,
    setSearchPlayerInput,
    showPlayerSearch,
    setShowPlayerSearch,
    sendGlobalMessage,
    sendPrivateMessage,
    acceptConversationRequest,
    rejectConversationRequest,
    markConversationAsRead,
    initiatePrivateChat,
    getUnreadMessagesCount,
    closePrivateConversation
  };
}; 