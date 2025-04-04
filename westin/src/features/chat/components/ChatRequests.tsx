import React from 'react';
import { useChatContext } from '../context/ChatContext';
import { formatTimestamp } from '../utils/formatTimestamp';
import { PrivateConversation } from '../../../types/chat';

interface ChatRequestsProps {
  characterId: string;
  onClose: () => void;
}

const ChatRequests: React.FC<ChatRequestsProps> = ({ characterId, onClose }) => {
  const { 
    pendingRequests, 
    acceptConversationRequest, 
    rejectConversationRequest 
  } = useChatContext();

  // Găsește numele expeditorului pentru fiecare cerere
  const getSenderName = (request: PrivateConversation) => {
    const senderIndex = request.participantIds.findIndex((id: string) => id !== characterId);
    return request.participantNames[senderIndex] || 'Jucător necunoscut';
  };

  // Găsește ultimul mesaj din conversație
  const getLastMessage = (request: PrivateConversation) => {
    const messages = request.messages;
    return messages.length > 0 ? messages[messages.length - 1] : null;
  };

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-metin-dark/90 border border-metin-gold/40 rounded-md p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-metin-gold text-lg font-semibold">Cereri de conversație</h3>
          <button
            onClick={onClose}
            className="text-metin-gold/70 hover:text-metin-gold"
            aria-label="Închide"
          >
            ×
          </button>
        </div>
        
        <div className="text-center py-4 text-metin-light/70">
          Nu ai cereri de conversație noi
        </div>
      </div>
    );
  }

  return (
    <div className="bg-metin-dark/90 border border-metin-gold/40 rounded-md p-4 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-metin-gold text-lg font-semibold">Cereri de conversație</h3>
        <button
          onClick={onClose}
          className="text-metin-gold/70 hover:text-metin-gold"
          aria-label="Închide"
        >
          ×
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        <ul className="space-y-3">
          {pendingRequests.map((request) => {
            const senderName = getSenderName(request);
            const lastMessage = getLastMessage(request);
            
            return (
              <li key={request.id} className="bg-metin-dark/60 border border-metin-gold/30 rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-metin-gold font-medium">{senderName}</span>
                    <span className="text-xs text-metin-light/50 ml-2">
                      {formatTimestamp(request.lastActivity)}
                    </span>
                  </div>
                </div>
                
                {lastMessage && (
                  <div className="mb-3">
                    <p className="text-sm text-metin-light truncate">{lastMessage.content}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => rejectConversationRequest(request.id)}
                    className="bg-metin-red/20 border border-metin-red/40 text-metin-light/90 px-3 py-1 rounded-md text-sm hover:bg-metin-red/30"
                  >
                    Refuză
                  </button>
                  <button
                    onClick={() => {
                      acceptConversationRequest(request.id);
                      onClose();
                    }}
                    className="bg-metin-gold/20 border border-metin-gold/40 text-metin-gold px-3 py-1 rounded-md text-sm hover:bg-metin-gold/30"
                  >
                    Acceptă
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ChatRequests; 