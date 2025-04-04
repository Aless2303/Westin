import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GlobalChatMessage, PrivateConversation, ChatType } from '../../../types/chat';
import mockData from '../../../data/mock';

export const useChatState = (characterId: string, characterName: string) => {
  // Stare pentru mesajele din chat-ul global
  const [globalMessages, setGlobalMessages] = useState<GlobalChatMessage[]>(
    mockData.chat.globalMessages
  );

  // Stare pentru conversațiile private
  const [privateConversations, setPrivateConversations] = useState<PrivateConversation[]>(
    mockData.chat.privateConversations
  );

  // Stare pentru conversația privată selectată
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Stare pentru noi cereri de conversație
  const [pendingRequests, setPendingRequests] = useState<PrivateConversation[]>([]);

  // Tipul de chat activ (global sau privat)
  const [activeChatType, setActiveChatType] = useState<ChatType>(ChatType.GLOBAL);

  // Stare pentru mesajul scris
  const [messageInput, setMessageInput] = useState('');

  // Stare pentru jucătorul căutat
  const [searchPlayerInput, setSearchPlayerInput] = useState('');

  // Arătăm dialogul de căutare jucători
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);

  // Referință pentru a evita bucla infinită în markConversationAsRead
  const processedConversationsRef = useRef<Set<string>>(new Set());

  // Efect pentru a actualiza cererile în așteptare
  useEffect(() => {
    const pendingConvs = privateConversations.filter(
      conv => !conv.isAccepted && conv.participantIds.includes(characterId) && conv.messages.some(msg => msg.receiverId === characterId)
    );
    setPendingRequests(pendingConvs);
  }, [privateConversations, characterId]);

  // Funcție pentru a adăuga un mesaj în chat-ul global
  const sendGlobalMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    
    const newMessage: GlobalChatMessage = {
      id: uuidv4(),
      senderId: characterId,
      senderName: characterName,
      content,
      timestamp: Date.now()
    };
    
    setGlobalMessages(prev => [...prev, newMessage]);
    setMessageInput('');
  }, [characterId, characterName]);

  // Funcție pentru a găsi o conversație privată cu un anumit jucător
  const findOrCreatePrivateConversation = useCallback((targetPlayerId: string, targetPlayerName: string) => {
    // Verificăm dacă există deja o conversație
    const conversation = privateConversations.find(conv => 
      conv.participantIds.includes(characterId) && 
      conv.participantIds.includes(targetPlayerId)
    );
    
    // Dacă nu există, o creăm
    if (!conversation) {
      const newConversation: PrivateConversation = {
        id: uuidv4(),
        participantIds: [characterId, targetPlayerId],
        participantNames: [characterName, targetPlayerName],
        messages: [],
        lastActivity: Date.now(),
        isAccepted: false
      };
      
      setPrivateConversations(prev => [...prev, newConversation]);
      return newConversation.id;
    }
    
    return conversation.id;
  }, [privateConversations, characterId, characterName]);

  // Funcție pentru a trimite un mesaj privat
  const sendPrivateMessage = useCallback((conversationId: string, content: string, receiverId: string, receiverName: string) => {
    if (!content.trim()) return;
    
    const newMessage = {
      id: uuidv4(),
      senderId: characterId,
      senderName: characterName,
      receiverId,
      receiverName,
      content,
      timestamp: Date.now(),
      isRead: false
    };
    
    setPrivateConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastActivity: Date.now()
          };
        }
        return conv;
      })
    );
    
    setMessageInput('');
  }, [characterId, characterName]);

  // Funcție pentru a accepta o cerere de conversație
  const acceptConversationRequest = useCallback((conversationId: string) => {
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
    
    // Selectăm automat conversația acceptată
    setSelectedConversation(conversationId);
    setActiveChatType(ChatType.PRIVATE);
  }, []);

  // Funcție pentru a respinge o cerere de conversație
  const rejectConversationRequest = useCallback((conversationId: string) => {
    setPrivateConversations(prev => 
      prev.filter(conv => conv.id !== conversationId)
    );
  }, []);

  // Funcție pentru a închide și șterge o conversație privată
  const closePrivateConversation = useCallback((conversationId: string) => {
    setPrivateConversations(prev => 
      prev.filter(conv => conv.id !== conversationId)
    );
  }, []);

  // Funcție pentru a marca toate mesajele dintr-o conversație ca citite - corectată pentru a evita bucla infinită
  const markConversationAsRead = useCallback((conversationId: string) => {
    // Verifică dacă acest conversationId a fost recent procesat
    if (processedConversationsRef.current.has(conversationId)) {
      return; // Dacă da, nu face nimic
    }

    // Temporar adaugă conversationId la set-ul de procesate
    processedConversationsRef.current.add(conversationId);

    setPrivateConversations(prev => {
      const updatedConversations = prev.map(conv => {
        if (conv.id === conversationId) {
          // Verifică dacă există mesaje necitite
          const hasUnreadMessages = conv.messages.some(
            msg => msg.receiverId === characterId && !msg.isRead
          );

          if (!hasUnreadMessages) {
            return conv; // Nu modifica conversația dacă nu există mesaje necitite
          }

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

      // Elimină conversationId din set-ul de procesate după un scurt delay
      setTimeout(() => {
        processedConversationsRef.current.delete(conversationId);
      }, 100);

      return updatedConversations;
    });
  }, [characterId]);

  // Inițierea unei noi conversații private
  const initiatePrivateChat = useCallback((targetPlayerId: string, targetPlayerName: string) => {
    const conversationId = findOrCreatePrivateConversation(targetPlayerId, targetPlayerName);
    
    // Asigurăm că, la crearea unei noi conversații, aceasta va fi marcată ca acceptată
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
    
    setSelectedConversation(conversationId);
    setActiveChatType(ChatType.PRIVATE);
    setShowPlayerSearch(false);
    setSearchPlayerInput('');
  }, [findOrCreatePrivateConversation]);

  // Numărul total de mesaje necitite
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