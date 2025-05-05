"use client";

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useChatContext } from '../context/ChatContext';
import { ChatType } from '../../../types/chat';
import { formatTimestamp } from '../utils/formatTimestamp';
import PlayerSearch from './PlayerSearch';
import ChatRequests from './ChatRequests';

interface ChatPanelProps {
  characterId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  characterId, 
  isOpen, 
  onClose 
}) => {
  const { 
    activeChatType,
    setActiveChatType,
    showPlayerSearch,
    setShowPlayerSearch,
    privateConversations,
    selectedConversation,
    setSelectedConversation,
    closePrivateConversation,
    globalMessages,
    messageInput,
    setMessageInput,
    sendGlobalMessage,
    sendPrivateMessage,
    markConversationAsRead,
    pendingRequests
  } = useChatContext();

  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [globalMessages, selectedConversation, privateConversations]);
  
  const acceptedConversations = privateConversations.filter(conv => conv.isAccepted);
  const selectedConvo = selectedConversation
    ? privateConversations.find(conv => conv.id === selectedConversation)
    : null;

  if (!isOpen) return null;

  const getParticipantName = (conversationId: string) => {
    const conversation = privateConversations.find(conv => conv.id === conversationId);
    if (!conversation) return '';
    const otherParticipantIndex = conversation.participantIds.findIndex(id => id !== characterId);
    return conversation.participantNames[otherParticipantIndex] || '';
  };

  const hasUnreadMessages = (conversationId: string) => {
    const conversation = privateConversations.find(conv => conv.id === conversationId);
    if (!conversation) return false;
    return conversation.messages.some(msg => msg.receiverId === characterId && !msg.isRead);
  };

  const selectPrivateConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setActiveChatType(ChatType.PRIVATE);
    const conversation = privateConversations.find(conv => conv.id === conversationId);
    if (conversation && conversation.messages.some(msg => msg.receiverId === characterId && !msg.isRead)) {
      markConversationAsRead(conversationId);
    }
  };

  const handleCloseConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (selectedConversation === conversationId) {
      setActiveChatType(ChatType.GLOBAL);
      setSelectedConversation(null);
    }
    closePrivateConversation(conversationId);
  };

  const shouldShowHeader = (messages: Array<{
    senderId: string;
    timestamp: number;
  }>, index: number) => {
    if (index === 0) return true;
    const currentMessage = messages[index];
    const previousMessage = messages[index - 1];
    return (
      currentMessage.senderId !== previousMessage.senderId ||
      currentMessage.timestamp - previousMessage.timestamp > 5 * 60 * 1000
    );
  };

  const getCharacterImagePath = (senderId: string, senderName: string) => {
    if (senderId === 'system') return "/Icons/system.png";
    if (senderId === characterId) return "/Races/Masculin/Ninja.png";
    if (senderName === "KnightShadow") return "/Races/Masculin/Warrior.png";
    if (senderName === "WizardFrost") return "/Races/Feminin/Shaman.png";
    return "/Races/Masculin/Sura.png";
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    if (activeChatType === ChatType.GLOBAL) {
      sendGlobalMessage(messageInput);
    } else if (selectedConvo) {
      const otherParticipantIndex = selectedConvo.participantIds.findIndex(id => id !== characterId);
      sendPrivateMessage(
        selectedConvo.id,
        messageInput,
        selectedConvo.participantIds[otherParticipantIndex],
        selectedConvo.participantNames[otherParticipantIndex]
      );
    }
  };

  const getOtherParticipant = () => {
    if (!selectedConvo) return { id: '', name: '' };
    const otherParticipantIndex = selectedConvo.participantIds.findIndex(id => id !== characterId);
    return {
      id: selectedConvo.participantIds[otherParticipantIndex] || '',
      name: selectedConvo.participantNames[otherParticipantIndex] || ''
    };
  };

  const renderMessages = () => {
    const messages = activeChatType === ChatType.GLOBAL ? globalMessages : (selectedConvo?.messages || []);
    return (
      <div className="space-y-1 sm:space-y-4">
        {messages.map((message, index) => (
          <div key={message.id || `message-${index}`} className={`message ${message.senderId === characterId ? 'flex flex-row-reverse' : 'flex'}`}>
            <div className={`flex max-w-full ${message.senderId === characterId ? 'flex-row-reverse' : ''}`}>
              {shouldShowHeader(messages, index) ? (
                <div className={`flex-shrink-0 ${message.senderId === characterId ? 'ml-0.5 sm:ml-2' : 'mr-0.5 sm:mr-2'}`}>
                  <div className="w-5 sm:w-8 h-5 sm:h-8 rounded-full overflow-hidden border border-metin-gold/30 bg-metin-dark/70">
                    <Image
                      src={getCharacterImagePath(message.senderId, message.senderName)}
                      alt={message.senderName}
                      width={32}
                      height={32}
                      className="object-contain"
                      style={{ objectPosition: "center 10%", maxWidth: "100%", maxHeight: "100%" }}
                    />
                  </div>
                </div>
              ) : (
                <div className={`flex-shrink-0 w-5 sm:w-8 ${message.senderId === characterId ? 'ml-0.5 sm:ml-2' : 'mr-0.5 sm:mr-2'}`}></div>
              )}
              <div className={`flex-grow ${message.senderId === characterId ? 'text-right' : ''}`}>
                {shouldShowHeader(messages, index) && (
                  <div className={`flex items-center mb-0.5 sm:mb-1 ${message.senderId === characterId ? 'justify-end' : ''}`}>
                    <span className={`text-[10px] sm:text-sm font-semibold ${message.senderId === 'system' ? 'text-metin-red' : 'text-metin-gold'}`}>
                      {message.senderId === characterId ? 'Tu' : message.senderName}
                    </span>
                  </div>
                )}
                <div className={`p-1 sm:p-2 pt-0.5 sm:pt-1.5 pb-2 sm:pb-4 rounded-md border relative inline-block max-w-[90%] sm:max-w-[80%] ${
                  message.senderId === characterId 
                    ? 'bg-metin-gold/15 border-metin-gold/30' 
                    : 'bg-metin-dark/60 border-metin-gold/20'
                }`}>
                  <p className="text-[10px] sm:text-sm text-metin-light whitespace-pre-wrap">{message.content}</p>
                  <span className="text-[6px] sm:text-[10px] text-metin-light/50 absolute bottom-0.5 sm:bottom-1 right-1 sm:right-2 min-w-[24px] sm:min-w-[32px] text-right whitespace-nowrap">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  return (
    <div className="fixed sm:bottom-16 sm:left-4 inset-x-0 bottom-0 z-30">
      <div className="bg-metin-dark/95 backdrop-blur-sm border border-metin-gold/40 rounded-lg sm:rounded-lg rounded-b-none border-b-0 sm:border-b overflow-hidden shadow-lg w-full sm:w-96 max-w-full">
        <div className="flex items-center justify-between px-1 py-0.5 sm:px-2 sm:py-2 bg-metin-dark/90 border-b border-metin-gold/30">
          <div className="flex flex-row items-center space-x-1 overflow-x-auto pb-0.5 sm:pb-1 flex-grow scrollbar-thin scrollbar-thumb-metin-gold/20 scrollbar-track-transparent">
            <button
              onClick={() => {
                setActiveChatType(ChatType.GLOBAL);
                setSelectedConversation(null);
              }}
              className={`px-1.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs rounded-t-md border-t border-l border-r whitespace-nowrap
                ${activeChatType === ChatType.GLOBAL && !selectedConversation
                  ? 'bg-metin-gold/20 text-metin-gold border-metin-gold/40'
                  : 'text-metin-light/70 hover:bg-metin-gold/10 border-metin-gold/20'}`}
            >
              Global
            </button>
            {acceptedConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectPrivateConversation(conv.id)}
                className={`group px-1.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs rounded-t-md border-t border-l border-r flex items-center whitespace-nowrap
                  ${activeChatType === ChatType.PRIVATE && selectedConversation === conv.id
                    ? 'bg-metin-gold/20 text-metin-gold border-metin-gold/40'
                    : 'text-metin-light/70 hover:bg-metin-gold/10 border-metin-gold/20'}`}
              >
                <span className="truncate max-w-[60px] sm:max-w-[100px]">{getParticipantName(conv.id)}</span>
                {hasUnreadMessages(conv.id) && (
                  <span className="ml-0.5 sm:ml-1 bg-metin-red text-white text-[6px] sm:text-xs rounded-full h-2.5 sm:h-4 w-2.5 sm:w-4 flex items-center justify-center">
                    !
                  </span>
                )}
                <span 
                  onClick={(e) => handleCloseConversation(e, conv.id)}
                  className="ml-0.5 sm:ml-1 text-metin-light/40 hover:text-metin-light cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-[8px] sm:text-xs"
                  title="Închide conversația"
                >
                  ×
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-0.5 sm:space-x-1 ml-0.5">
            {pendingRequests.length > 0 && (
              <button
                onClick={() => setShowPendingRequests(true)}
                className="relative p-0.5 text-metin-gold/80 hover:text-metin-gold focus:outline-none"
                title="Cereri de conversație noi"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 sm:h-5 w-3.5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-metin-red text-white text-[6px] sm:text-xs rounded-full h-2.5 sm:h-4 w-2.5 sm:w-4 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              </button>
            )}
            <button
              onClick={() => setShowPlayerSearch(true)}
              className="p-0.5 text-metin-gold/80 hover:text-metin-gold focus:outline-none"
              title="Conversație nouă"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 sm:h-5 w-3.5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-0.5 text-metin-gold/80 hover:text-metin-gold focus:outline-none"
              title="Închide chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 sm:h-5 w-3.5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex flex-col h-60 sm:h-72">
          <div className="flex-1 overflow-y-auto p-1 sm:p-3 scrollbar-thin scrollbar-thumb-metin-gold/20 scrollbar-track-transparent">
            {renderMessages()}
          </div>
          <form onSubmit={handleSendMessage} className="p-1 sm:p-2 border-t border-metin-gold/30 bg-metin-dark/80">
            <div className="flex items-center bg-metin-dark/70 border border-metin-gold/30 rounded-md overflow-hidden">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={activeChatType === ChatType.GLOBAL 
                  ? "Mesaj global..." 
                  : `Mesaj către ${getOtherParticipant().name}...`
                }
                className="flex-1 bg-transparent text-metin-light px-1 sm:px-3 py-0.5 sm:py-2 text-[10px] sm:text-base focus:outline-none placeholder-metin-light/40"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className={`bg-metin-gold/20 text-metin-gold px-1.5 sm:px-4 py-0.5 sm:py-2 
                  ${messageInput.trim() ? 'hover:bg-metin-gold/30' : 'opacity-50 cursor-not-allowed'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 sm:h-5 w-3.5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
      {showPlayerSearch && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <PlayerSearch />
        </div>
      )}
      {showPendingRequests && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <ChatRequests 
            characterId={characterId} 
            onClose={() => setShowPendingRequests(false)} 
          />
        </div>
      )}
    </div>
  );
};

export default ChatPanel;