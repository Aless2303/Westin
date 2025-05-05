"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { GlobalChatMessage, PrivateConversation, ChatType } from '../../../types/chat';
import { useSocket } from '../../../context/SocketContext';
import axios from 'axios';

// Constants for message limits
const MAX_GLOBAL_MESSAGES = 50;
const MAX_PRIVATE_MESSAGES = 30;

export const useChatState = (characterId: string) => {
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

  // Add notification state for new messages
  const [newMessageNotification, setNewMessageNotification] = useState<{
    show: boolean;
    conversationId: string | null;
    senderName: string;
    content: string;
  }>({
    show: false,
    conversationId: null,
    senderName: '',
    content: ''
  });

  // Reference to avoid infinite loops in markConversationAsRead
  const processedConversationsRef = useRef<Set<string>>(new Set());
  
  // Function to show a notification for a new message
  const showMessageNotification = useCallback((conversationId: string, senderName: string, content: string) => {
    setNewMessageNotification({
      show: true,
      conversationId,
      senderName,
      content
    });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNewMessageNotification(prev => {
        // Only clear if it's still the same notification
        if (prev.conversationId === conversationId) {
          return {
            show: false,
            conversationId: null,
            senderName: '',
            content: ''
          };
        }
        return prev;
      });
    }, 5000);
  }, []);

  // Function to dismiss notification
  const dismissNotification = useCallback(() => {
    setNewMessageNotification({
      show: false,
      conversationId: null,
      senderName: '',
      content: ''
    });
  }, []);

  // Function to open conversation from notification
  const openConversationFromNotification = useCallback(() => {
    if (newMessageNotification.conversationId) {
      handleSelectConversation(newMessageNotification.conversationId);
      setActiveChatType(ChatType.PRIVATE);
      dismissNotification();
    }
  }, [newMessageNotification.conversationId]);

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
        
        // Limit the number of messages
        const messages = response.data;
        if (messages.length > MAX_GLOBAL_MESSAGES) {
          setGlobalMessages(messages.slice(messages.length - MAX_GLOBAL_MESSAGES));
        } else {
          setGlobalMessages(messages);
        }
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
      setGlobalMessages(prev => {
        const newMessages = [...prev, {
          id: message.id,
          senderId: message.senderId,
          senderName: message.senderName,
          content: message.content,
          timestamp: new Date(message.timestamp).getTime()
        }];
        
        // Keep only the most recent messages
        if (newMessages.length > MAX_GLOBAL_MESSAGES) {
          return newMessages.slice(newMessages.length - MAX_GLOBAL_MESSAGES);
        }
        return newMessages;
      });
    });
    
    // Listen for new private messages
    socket.on('private-message', (message) => {
      console.log('Received private message via socket:', message);

      // Show notification if not viewing this conversation
      if (activeChatType !== ChatType.PRIVATE || selectedConversation !== message.conversationId) {
        if (message.senderId !== characterId) {
          showMessageNotification(message.conversationId, message.senderName, message.content);
        }
      }
      
      setPrivateConversations(prev => {
        const conversationExists = prev.some(conv => conv.id === message.conversationId);
        
        if (!conversationExists) {
          // If this is a new conversation, we should fetch full conversation data
          console.log('New conversation detected, fetching details for:', message.conversationId);
          fetchConversationDetails(message.conversationId);
          return prev;
        }
        
        console.log('Updating existing conversation with new message:', message.conversationId);
        return prev.map(conv => {
          if (conv.id === message.conversationId) {
            const newMessages = [...conv.messages, {
              id: message.id,
              senderId: message.senderId,
              senderName: message.senderName,
              receiverId: message.receiverId,
              receiverName: message.receiverName,
              content: message.content,
              timestamp: new Date(message.timestamp).getTime(),
              isRead: message.isRead
            }];
            
            // Keep only the most recent messages in the conversation
            if (newMessages.length > MAX_PRIVATE_MESSAGES) {
              newMessages.splice(0, newMessages.length - MAX_PRIVATE_MESSAGES);
            }
            
            return {
              ...conv,
              messages: newMessages,
              lastActivity: new Date(message.timestamp).getTime()
            };
          }
          return conv;
        });
      });
    });
    
    // Listen for when a user leaves a conversation
    socket.on('conversation-user-left', (data) => {
      console.log('User left conversation:', data);
      
      // No longer show a notification for user leaving
      if (data.userId !== characterId) {
        // If this is the currently selected conversation, close it immediately
        if (selectedConversation === data.conversationId) {
          setSelectedConversation(null);
          setActiveChatType(ChatType.GLOBAL);
        }
        
        // Remove the conversation from UI immediately
        setPrivateConversations(prev => 
          prev.filter(conv => conv.id !== data.conversationId)
        );
      }
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
      socket.off('conversation-user-left');
    };
  }, [socket, isConnected, activeChatType, selectedConversation, characterId, showMessageNotification]);
  
  // Fetch conversation details when selecting a conversation
  const fetchConversationDetails = async (conversationId: string) => {
    try {
      console.log('Fetching conversation details for:', conversationId);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`http://localhost:5000/api/chat/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Conversation messages from API:', response.data);
      
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
      
      console.log('Mapped messages:', messages);
      
      // Limit the messages to the most recent ones
      const limitedMessages = messages.length > MAX_PRIVATE_MESSAGES
        ? messages.slice(messages.length - MAX_PRIVATE_MESSAGES)
        : messages;
      
      // Get the conversation to check participants
      const conversation = privateConversations.find(conv => conv.id === conversationId);
      if (conversation) {
        console.log('Conversation participants:', {
          ids: conversation.participantIds,
          names: conversation.participantNames
        });
      } else {
        console.warn('Conversation not found in state:', conversationId);
      }
      
      setPrivateConversations(prev => 
        prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: limitedMessages
            };
          }
          return conv;
        })
      );
      
      // Verify the conversation was updated
      setTimeout(() => {
        const updatedConv = privateConversations.find(conv => conv.id === conversationId);
        console.log('Updated conversation:', updatedConv);
      }, 100);
      
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    }
  };
  
  // Normalizează un ID pentru a fi siguri că comparațiile funcționează corect
  const normalizeId = (id: string | { toString(): string } | null | undefined): string => {
    if (!id) return '';
    return typeof id === 'string' ? id : id.toString();
  };

  // Update pending requests
  useEffect(() => {
    const pendingConvs = privateConversations.filter(
      conv => !conv.isAccepted && 
        conv.participantIds.some(id => normalizeId(id) === normalizeId(characterId)) && 
        normalizeId(conv.participantIds[0]) !== normalizeId(characterId) // Only show requests initiated by others
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
  const findOrCreatePrivateConversation = useCallback(async (targetPlayerId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return null;
      }
      
      console.log('Finding or creating conversation with target player ID:', targetPlayerId);
      console.log('Current user/character ID:', characterId);
      
      // Verificăm că ID-urile sunt diferite
      if (targetPlayerId === characterId) {
        console.error('Cannot create conversation with yourself');
        alert('Nu poți începe o conversație cu tine însuți');
        return null;
      }
      
      // Verificăm dacă ID-urile sunt valide
      if (!targetPlayerId || !characterId) {
        console.error('Invalid user IDs:', { targetPlayerId, characterId });
        alert('ID-uri de utilizator invalide');
        return null;
      }
      
      // Check if conversation already exists
      const existingConversations = privateConversations.filter(conv => {
        const participantIds = conv.participantIds || [];
        return (
          participantIds.some(id => normalizeId(id) === normalizeId(characterId)) && 
          participantIds.some(id => normalizeId(id) === normalizeId(targetPlayerId))
        );
      });
      
      console.log('Existing conversations found:', existingConversations.length);
      
      if (existingConversations.length > 0) {
        const existingConversation = existingConversations[0];
        console.log('Using existing conversation:', existingConversation);
        return existingConversation.id;
      }
      
      console.log('Creating new conversation with player:', targetPlayerId);
      
      // If not, create new conversation
      const response = await axios.post('http://localhost:5000/api/chat/conversations', 
        { targetUserId: targetPlayerId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Server response for new conversation:', response.data);
      
      // Immediately add the new conversation to state so it appears in UI
      const newConversation: PrivateConversation = {
        id: response.data.id,
        participantIds: response.data.participantIds,
        participantNames: response.data.participantNames,
        messages: [], // We'll load messages when selecting the conversation
        lastActivity: new Date(response.data.lastActivity).getTime(),
        isAccepted: response.data.isAccepted
      };
      
      console.log('New conversation object:', newConversation);
      
      // Update conversations state with new conversation
      setPrivateConversations(prev => {
        // Check if it already exists to avoid duplicates
        if (!prev.some(conv => conv.id === newConversation.id)) {
          return [...prev, newConversation];
        }
        return prev;
      });
      
      return newConversation.id;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Unknown error';
        console.error(`Error creating conversation: ${errorMessage}`, error.response?.data);
        alert(`Could not create conversation: ${errorMessage}`);
      } else {
        console.error('Error creating conversation:', error);
        alert('Could not create conversation. Please try again later.');
      }
      return null;
    }
  }, [privateConversations, characterId, setPrivateConversations]);

  // Function to send a private message
  const sendPrivateMessage = useCallback((conversationId: string, content: string) => {
    if (!content.trim() || !socket || !isConnected) {
      console.warn('Cannot send message - validation failed:', { 
        hasContent: !!content.trim(), 
        hasSocket: !!socket, 
        isConnected 
      });
      return;
    }
    
    console.log('Sending private message via socket:', { conversationId, content });
    
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
      
      // Join the socket room for this conversation
      if (socket && isConnected) {
        socket.emit('join-conversation', { conversationId });
      }
      
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
  }, [fetchConversationDetails, socket, isConnected, setSelectedConversation, setActiveChatType]);

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

  // Function to close and leave a private conversation
  const closePrivateConversation = useCallback(async (conversationId: string) => {
    try {
      console.log('Leaving conversation:', conversationId);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // If we're closing the currently selected conversation, reset to global chat
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        setActiveChatType(ChatType.GLOBAL);
      }
      
      // Remove from frontend state first for faster UI response
      setPrivateConversations(prev => 
        prev.filter(conv => conv.id !== conversationId)
      );
      
      // Then notify backend that user is leaving the conversation
      await axios.delete(`http://localhost:5000/api/chat/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Left conversation successfully:', conversationId);
    } catch (error) {
      console.error('Error leaving conversation:', error);
      // If there was an error, we might want to re-fetch conversations
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/chat/conversations', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          // Update state with current conversations from server
          const conversations = response.data.map((conv: {
            id: string;
            participantIds: string[];
            participantNames: string[];
            lastActivity: string;
            isAccepted: boolean;
          }) => ({
            id: conv.id,
            participantIds: conv.participantIds,
            participantNames: conv.participantNames,
            messages: [], 
            lastActivity: new Date(conv.lastActivity).getTime(),
            isAccepted: conv.isAccepted
          }));
          
          setPrivateConversations(conversations);
        } catch (fetchError) {
          console.error('Error refreshing conversations after failed leave:', fetchError);
        }
      }
    }
  }, [selectedConversation, setSelectedConversation, setActiveChatType]);

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
  const initiatePrivateChat = useCallback(async (targetPlayerId: string) => {
    try {
      const conversationId = await findOrCreatePrivateConversation(targetPlayerId);
      if (!conversationId) return;
      
      // Join the socket room for this conversation
      if (socket && isConnected) {
        socket.emit('join-conversation', { conversationId });
      }
      
      // Get fresh conversation data
      await fetchConversationDetails(conversationId);
      
      // Select the new conversation automatically
      setSelectedConversation(conversationId);
      setActiveChatType(ChatType.PRIVATE);
      setShowPlayerSearch(false);
      setSearchPlayerInput('');
      
      console.log('Conversation created and selected:', conversationId);
    } catch (error) {
      console.error('Error initiating private chat:', error);
    }
  }, [findOrCreatePrivateConversation, fetchConversationDetails, setSelectedConversation, setActiveChatType, setShowPlayerSearch, setSearchPlayerInput, socket, isConnected]);

  // Also modify the setSelectedConversation handler to join the room
  const handleSelectConversation = useCallback((conversationId: string | null) => {
    if (conversationId && socket && isConnected) {
      // Join the socket room for this conversation if not already joined
      socket.emit('join-conversation', { conversationId });
      
      // When selecting a conversation, always fetch its messages to ensure they're loaded
      fetchConversationDetails(conversationId);
    }
    setSelectedConversation(conversationId);
  }, [socket, isConnected, setSelectedConversation, fetchConversationDetails]);

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
    setSelectedConversation: handleSelectConversation,
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
    closePrivateConversation,
    newMessageNotification,
    showMessageNotification,
    dismissNotification,
    openConversationFromNotification
  };
}; 