import React from 'react';
import Image from 'next/image';
import { useChatContext } from '../context/ChatContext';
import { formatTimestamp } from '../utils/formatTimestamp';
import { PrivateConversation } from '../../../types/chat';

interface ChatRequestsProps {
  characterId: string;
  onClose: () => void;
}

const ImprovedChatRequests: React.FC<ChatRequestsProps> = ({ characterId, onClose }) => {
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

  // Obține imaginea jucătorului
  const getPlayerImage = (playerName: string) => {
    if (playerName === "KnightShadow") {
      return "/Races/Masculin/Warrior.png";
    } else if (playerName === "WizardFrost") {
      return "/Races/Feminin/Shaman.png";
    }
    return "/Races/Masculin/Sura.png"; // Default
  };

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-metin-dark/95 backdrop-blur-sm border-2 border-metin-gold/40 rounded-lg shadow-xl p-5 w-full max-w-md animate-fade-in">
        {/* Decorative elements */}
        <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-metin-gold/60 rounded-tl-lg"></div>
        <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-metin-gold/60 rounded-tr-lg"></div>
        <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-metin-gold/60 rounded-bl-lg"></div>
        <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-metin-gold/60 rounded-br-lg"></div>
        
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-metin-gold text-xl font-serif">Cereri de conversație</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-metin-dark/90 border border-metin-gold/30 rounded-full flex items-center justify-center text-metin-gold hover:bg-metin-gold/20 transition-colors"
            aria-label="Închide"
          >
            ×
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center py-10 text-metin-light/70 border border-dashed border-metin-gold/20 rounded-md bg-metin-dark/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-metin-gold/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p>Nu ai cereri de conversație noi</p>
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-metin-gold/20 border border-metin-gold/50 text-metin-gold rounded hover:bg-metin-gold/30 transition-colors"
          >
            Închide
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-metin-dark/95 backdrop-blur-sm border-2 border-metin-gold/40 rounded-lg shadow-xl p-5 w-full max-w-md animate-fade-in">
      {/* Decorative elements */}
      <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-metin-gold/60 rounded-tl-lg"></div>
      <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-metin-gold/60 rounded-tr-lg"></div>
      <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-metin-gold/60 rounded-bl-lg"></div>
      <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-metin-gold/60 rounded-br-lg"></div>

      <div className="flex justify-between items-center mb-5">
        <h3 className="text-metin-gold text-xl font-serif">Cereri de conversație</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-metin-dark/90 border border-metin-gold/30 rounded-full flex items-center justify-center text-metin-gold hover:bg-metin-gold/20 transition-colors"
          aria-label="Închide"
        >
          ×
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto pr-1 mb-5 scrollbar-thin scrollbar-thumb-metin-gold/20 scrollbar-track-transparent">
        <ul className="space-y-4">
          {pendingRequests.map((request) => {
            const senderName = getSenderName(request);
            const lastMessage = getLastMessage(request);
            
            return (
              <li key={request.id} className="bg-metin-dark/60 border border-metin-gold/30 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-metin-gold/40 mr-3 flex-shrink-0 bg-metin-dark/50">
                      <Image
                        src={getPlayerImage(senderName)}
                        alt={senderName}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="text-metin-gold font-semibold">{senderName}</span>
                        <span className="text-metin-light/40 text-xs ml-2">
                          {formatTimestamp(request.lastActivity)}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-xs text-metin-light/60">
                        dorește să înceapă o conversație cu tine
                      </div>
                    </div>
                  </div>
                  
                  {lastMessage && (
                    <div className="bg-metin-dark/40 p-3 rounded border border-metin-gold/20 mb-3">
                      <p className="text-sm text-metin-light/90 italic">"{lastMessage.content}"</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => rejectConversationRequest(request.id)}
                      className="px-3 py-1.5 bg-metin-red/10 border border-metin-red/30 text-metin-light/90 rounded hover:bg-metin-red/20 transition-colors text-sm"
                    >
                      Refuză
                    </button>
                    <button
                      onClick={() => {
                        acceptConversationRequest(request.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-metin-gold/20 border border-metin-gold/40 text-metin-gold rounded hover:bg-metin-gold/30 transition-colors text-sm"
                    >
                      Acceptă
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-metin-gold/30 text-metin-light/80 rounded hover:bg-metin-dark/50 transition-colors"
        >
          Închide
        </button>
      </div>
    </div>
  );
};

export default ImprovedChatRequests;