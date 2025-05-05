"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useChatState } from '../hooks/useChatState';
import { GlobalChatMessage, PrivateConversation, ChatType } from '../../../types/chat';

interface ChatContextType {
  globalMessages: GlobalChatMessage[];
  privateConversations: PrivateConversation[];
  pendingRequests: PrivateConversation[];
  selectedConversation: string | null;
  setSelectedConversation: (id: string | null) => void;
  activeChatType: ChatType;
  setActiveChatType: (type: ChatType) => void;
  messageInput: string;
  setMessageInput: (input: string) => void;
  searchPlayerInput: string;
  setSearchPlayerInput: (input: string) => void;
  showPlayerSearch: boolean;
  setShowPlayerSearch: (show: boolean) => void;
  sendGlobalMessage: (content: string) => void;
  sendPrivateMessage: (conversationId: string, content: string, receiverId: string, receiverName: string) => void;
  acceptConversationRequest: (conversationId: string) => void;
  rejectConversationRequest: (conversationId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  initiatePrivateChat: (targetPlayerId: string, targetPlayerName: string) => void;
  getUnreadMessagesCount: () => number;
  closePrivateConversation: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
  characterId: string;
  characterName: string;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ 
  children,
  characterId,
  characterName
}) => {
  const chatState = useChatState(characterId, characterName);

  return (
    <ChatContext.Provider value={chatState}>
      {children}
    </ChatContext.Provider>
  );
}; 