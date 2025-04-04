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
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [globalMessages, selectedConversation, privateConversations]);
  
  // Filtrăm doar conversațiile acceptate pentru tab-uri
  const acceptedConversations = privateConversations.filter(conv => conv.isAccepted);

  // Găsește conversația selectată
  const selectedConvo = selectedConversation
    ? privateConversations.find(conv => conv.id === selectedConversation)
    : null;

  // Dacă panoul nu este deschis
  if (!isOpen) return null;

  // Găsește numele participantului pentru o conversație
  const getParticipantName = (conversationId: string) => {
    const conversation = privateConversations.find(conv => conv.id === conversationId);
    if (!conversation) return '';
    const otherParticipantIndex = conversation.participantIds.findIndex(id => id !== characterId);
    return conversation.participantNames[otherParticipantIndex] || '';
  };

  // Verifică dacă o conversație are mesaje necitite
  const hasUnreadMessages = (conversationId: string) => {
    const conversation = privateConversations.find(conv => conv.id === conversationId);
    if (!conversation) return false;
    return conversation.messages.some(msg => msg.receiverId === characterId && !msg.isRead);
  };

  // Selectează o conversație privată
  const selectPrivateConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setActiveChatType(ChatType.PRIVATE);

    // Marchează mesajele ca citite când selectăm conversația
    const conversation = privateConversations.find(conv => conv.id === conversationId);
    if (conversation && conversation.messages.some(msg => msg.receiverId === characterId && !msg.isRead)) {
      markConversationAsRead(conversationId);
    }
  };

  // Închide și șterge o conversație privată
  const handleCloseConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation(); // Oprește propagarea click-ului pentru a nu declanșa și selectarea tab-ului
    
    // Dacă conversația care se închide este cea activă, comutăm pe global
    if (selectedConversation === conversationId) {
      setActiveChatType(ChatType.GLOBAL);
      setSelectedConversation(null);
    }
    
    // Închide și șterge conversația
    closePrivateConversation(conversationId);
  };

  // Funcție pentru a determina dacă trebuie să afișăm antetul mesajului
  const shouldShowHeader = (messages: any[], index: number) => {
    if (index === 0) return true;
    
    const currentMessage = messages[index];
    const previousMessage = messages[index - 1];
    
    // Verificăm dacă mesajul curent este de la același expeditor ca și mesajul precedent
    // și dacă nu a trecut prea mult timp între ele (mai puțin de 5 minute)
    return (
      currentMessage.senderId !== previousMessage.senderId ||
      currentMessage.timestamp - previousMessage.timestamp > 5 * 60 * 1000
    );
  };

  // Funcție pentru a obține calea către imaginea personajului
  const getCharacterImagePath = (senderId: string, senderName: string) => {
    if (senderId === 'system') {
      return "/Icons/system.png"; // Imagine pentru sistem
    }
    
    if (senderId === characterId) {
      return "/Races/Masculin/Ninja.png"; // Personajul jucătorului
    }
    
    // În funcție de numele expeditorului, returnăm o imagine diferită
    if (senderName === "KnightShadow") {
      return "/Races/Masculin/Warrior.png";
    }
    
    if (senderName === "WizardFrost") {
      return "/Races/Feminin/Shaman.png";
    }
    
    // Imagine implicită pentru alți jucători
    return "/Races/Masculin/Sura.png";
  };

  // Handler pentru trimiterea mesajului
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

  // Găsim ID-ul și numele celuilalt participant pentru chat privat
  const getOtherParticipant = () => {
    if (!selectedConvo) return { id: '', name: '' };
    
    const otherParticipantIndex = selectedConvo.participantIds.findIndex(id => id !== characterId);
    
    return {
      id: selectedConvo.participantIds[otherParticipantIndex] || '',
      name: selectedConvo.participantNames[otherParticipantIndex] || ''
    };
  };
  

  
  // Renderizare pentru mesajele din chat-ul global și privat
  const renderMessages = () => {
    const messages = activeChatType === ChatType.GLOBAL
      ? globalMessages
      : (selectedConvo?.messages || []);
    
    return (
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={message.id} className={`message ${message.senderId === characterId ? 'flex flex-row-reverse' : 'flex'}`}>
            <div className={`flex max-w-[85%] ${message.senderId === characterId ? 'flex-row-reverse' : ''}`}>
                {/* Imaginea de profil - afișată doar la primul mesaj dintr-un grup */}
                {shouldShowHeader(messages, index) ? (
                  <div className={`flex-shrink-0 ${message.senderId === characterId ? 'ml-2' : 'mr-2'}`}>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-metin-gold/30 bg-metin-dark/70 flex items-center justify-center">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                          src={getCharacterImagePath(message.senderId, message.senderName)}
                          alt={message.senderName}
                          width={32}
                          height={32}
                          className="object-contain"
                          style={{ 
                            objectPosition: "center 10%", 
                            maxWidth: "100%", 
                            maxHeight: "100%" 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`flex-shrink-0 w-8 ${message.senderId === characterId ? 'ml-2' : 'mr-2'}`}></div>
                )}
              
              <div className={`flex-grow max-w-[calc(100%-2.5rem)] ${message.senderId === characterId ? 'text-right' : ''}`}>
                {/* Antetul mesajului - afișat doar la primul mesaj dintr-un grup */}
                {shouldShowHeader(messages, index) && (
                  <div className={`flex items-center mb-1 ${message.senderId === characterId ? 'justify-end' : ''}`}>
                    <span className={`text-sm font-semibold ${message.senderId === 'system' ? 'text-metin-red' : 'text-metin-gold'}`}>
                      {message.senderId === characterId ? 'Tu' : message.senderName}
                    </span>
                  </div>
                )}
                
                <div className={`p-2 pt-1.5 pb-4 rounded-md border relative inline-block ${
                  message.senderId === characterId 
                    ? 'bg-metin-gold/15 border-metin-gold/30 text-right' 
                    : 'bg-metin-dark/60 border-metin-gold/20 text-left'
                }`}>
                  <p className="text-sm text-metin-light break-words">{message.content}</p>
                  
                  {/* Timestamp în colțul din dreapta jos */}
                  <span className="text-[10px] text-metin-light/50 absolute bottom-1 right-2 min-w-[32px] text-right whitespace-nowrap">
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
    <div className="absolute bottom-16 left-4 z-30">
      <div className="bg-metin-dark/95 backdrop-blur-sm border border-metin-gold/40 rounded-lg overflow-hidden shadow-lg w-96">
        {/* Header cu tab-uri */}
        <div className="flex items-center justify-between px-2 py-2 bg-metin-dark/90 border-b border-metin-gold/30">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 flex-grow scrollbar-thin scrollbar-thumb-metin-gold/20 scrollbar-track-transparent">
            {/* Tab Global - mereu vizibil */}
            <button
              onClick={() => {
                setActiveChatType(ChatType.GLOBAL);
                setSelectedConversation(null);
              }}
              className={`px-3 py-1 text-xs rounded-t-md border-t border-l border-r whitespace-nowrap
                ${activeChatType === ChatType.GLOBAL && !selectedConversation
                  ? 'bg-metin-gold/20 text-metin-gold border-metin-gold/40'
                  : 'text-metin-light/70 hover:bg-metin-gold/10 border-metin-gold/20'}`}
            >
              Global
            </button>
            
            {/* Tab-uri pentru conversații private */}
            {acceptedConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectPrivateConversation(conv.id)}
                className={`group px-3 py-1 text-xs rounded-t-md border-t border-l border-r flex items-center whitespace-nowrap
                  ${activeChatType === ChatType.PRIVATE && selectedConversation === conv.id
                    ? 'bg-metin-gold/20 text-metin-gold border-metin-gold/40'
                    : 'text-metin-light/70 hover:bg-metin-gold/10 border-metin-gold/20'}`}
              >
                <span className="mr-1">{getParticipantName(conv.id)}</span>
                
                {/* Indicator de mesaje necitite */}
                {hasUnreadMessages(conv.id) && (
                  <span className="ml-1 bg-metin-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    !
                  </span>
                )}
                
                {/* Buton de închidere conversație */}
                <span 
                  onClick={(e) => handleCloseConversation(e, conv.id)}
                  className="ml-1 text-metin-light/40 hover:text-metin-light cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Închide conversația"
                >
                  ×
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 ml-1">
            {/* Indicator cereri noi */}
            {pendingRequests.length > 0 && (
              <button
                onClick={() => setShowPendingRequests(true)}
                className="relative p-1 text-metin-gold/80 hover:text-metin-gold focus:outline-none"
                title="Cereri de conversație noi"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-metin-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              </button>
            )}

            {/* Buton pentru adăugare conversație privată (+) */}
            <button
              onClick={() => setShowPlayerSearch(true)}
              className="p-1 text-metin-gold/80 hover:text-metin-gold focus:outline-none"
              title="Conversație nouă"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Buton închidere */}
            <button
              onClick={onClose}
              className="p-1 text-metin-gold/80 hover:text-metin-gold focus:outline-none"
              title="Închide chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conținutul chat-ului */}
        <div className="flex flex-col h-72">
          {/* Zona de mesaje */}
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-metin-gold/20 scrollbar-track-transparent">
            {renderMessages()}
          </div>

          {/* Formularul de mesaj */}
          <form onSubmit={handleSendMessage} className="p-2 border-t border-metin-gold/30 bg-metin-dark/80">
            <div className="flex items-center bg-metin-dark/70 border border-metin-gold/30 rounded-md overflow-hidden">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={activeChatType === ChatType.GLOBAL 
                  ? "Scrie un mesaj în canalul global..." 
                  : `Scrie un mesaj către ${getOtherParticipant().name}...`
                }
                className="flex-1 bg-transparent text-metin-light px-3 py-2 focus:outline-none placeholder-metin-light/40"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className={`bg-metin-gold/20 text-metin-gold px-4 py-2 
                  ${messageInput.trim() ? 'hover:bg-metin-gold/30' : 'opacity-50 cursor-not-allowed'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Dialog pentru căutare jucători */}
      {showPlayerSearch && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <PlayerSearch />
        </div>
      )}

      {/* Dialog pentru cereri de conversație */}
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