import React from 'react';
import { useChatContext } from '../context/ChatContext';
import { ChatType } from '../../../types/chat';
import GlobalChat from './GlobalChat';
import PrivateChat from './PrivateChat';
import PlayerSearch from './PlayerSearch';

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
    closePrivateConversation
  } = useChatContext();

  // Filtrăm doar conversațiile acceptate pentru tab-uri
  const acceptedConversations = privateConversations.filter(conv => conv.isAccepted);

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

  return (
    <div className="absolute bottom-16 left-4 z-30 bg-metin-dark/90 backdrop-blur-sm border border-metin-gold/40 rounded-lg overflow-hidden shadow-lg">
      <div className="flex flex-col w-96 h-96">
        {/* Header cu tab-uri */}
        <div className="flex items-center justify-between px-2 py-2 bg-metin-dark border-b border-metin-gold/30">
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

          <div className="flex space-x-1 ml-1">
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
        <div className="flex-1 overflow-hidden p-3">
          {activeChatType === ChatType.GLOBAL ? (
            <GlobalChat />
          ) : (
            <PrivateChat characterId={characterId} />
          )}
        </div>
      </div>

      {/* Dialog pentru căutare jucători */}
      {showPlayerSearch && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <PlayerSearch />
        </div>
      )}
    </div>
  );
};

export default ChatPanel; 