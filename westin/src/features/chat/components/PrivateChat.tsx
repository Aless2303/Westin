import React, { useRef, useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';
import { formatTimestamp } from '../utils/formatTimestamp';
import { ChatType } from '../../../types/chat';
import Image from 'next/image';

interface PrivateChatProps {
  characterId: string;
}

const PrivateChat: React.FC<PrivateChatProps> = ({ characterId }) => {
  const { 
    privateConversations,
    selectedConversation,
    setSelectedConversation,
    messageInput,
    setMessageInput,
    sendPrivateMessage,
    markConversationAsRead,
    setActiveChatType
  } = useChatContext();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Găsește conversația selectată
  const conversation = selectedConversation
    ? privateConversations.find(conv => conv.id === selectedConversation)
    : null;

  // Funcție pentru a derula la ultimul mesaj
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Derulează în jos la fiecare mesaj nou și marchează ca citite
  useEffect(() => {
    if (conversation) {
      scrollToBottom();
      
      // Verificăm dacă există mesaje necitite înainte de a marca toate ca citite
      const hasUnreadMessages = conversation.messages.some(
        msg => msg.receiverId === characterId && !msg.isRead
      );
      
      if (hasUnreadMessages) {
        markConversationAsRead(conversation.id);
      }
    }
  }, [conversation?.id, conversation?.messages.length, characterId, markConversationAsRead]);

  // Găsim ID-ul și numele celuilalt participant
  const getOtherParticipant = () => {
    if (!conversation) return { id: '', name: '' };
    
    const otherParticipantIndex = conversation.participantIds.findIndex(id => id !== characterId);
    
    return {
      id: conversation.participantIds[otherParticipantIndex] || '',
      name: conversation.participantNames[otherParticipantIndex] || ''
    };
  };

  const otherParticipant = getOtherParticipant();

  // Handler pentru trimiterea mesajului
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && conversation) {
      sendPrivateMessage(
        conversation.id,
        messageInput,
        otherParticipant.id,
        otherParticipant.name
      );
    }
  };

  // Funcție pentru a determina dacă trebuie să afișăm antetul mesajului
  const shouldShowHeader = (index: number) => {
    if (!conversation) return true;
    if (index === 0) return true;
    
    const currentMessage = conversation.messages[index];
    const previousMessage = conversation.messages[index - 1];
    
    // Verificăm dacă mesajul curent este de la același expeditor ca și mesajul precedent
    // și dacă nu a trecut prea mult timp între ele (mai puțin de 5 minute)
    return (
      currentMessage.senderId !== previousMessage.senderId ||
      currentMessage.timestamp - previousMessage.timestamp > 5 * 60 * 1000
    );
  };

  // Funcție pentru a obține calea către imaginea personajului
  const getCharacterImagePath = (senderId: string, senderName: string) => {
    if (senderId === characterId) {
      return "/Races/Masculin/Warrior.png"; // Personajul jucătorului (hardcodat pentru demo)
    }
    
    // În funcție de numele expeditorului, returnăm o imagine diferită
    // Aceasta este o simplificare, în realitate ar trebui să consulți o bază de date
    if (senderName === "KnightShadow") {
      return "/Races/Masculin/Warrior.png";
    }
    
    if (senderName === "WizardFrost") {
      return "/Races/Feminin/Shaman.png";
    }
    
    // Imagine implicită pentru alți jucători
    return "/Races/Masculin/Ninja.png";
  };

  // Dacă nu există nicio conversație selectată
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <p className="text-metin-light mb-4">Nu ai selectat nicio conversație</p>
        <button
          onClick={() => {
            setActiveChatType(ChatType.GLOBAL);
            setSelectedConversation(null);
          }}
          className="bg-metin-gold/20 border border-metin-gold/30 text-metin-gold px-4 py-2 rounded-md hover:bg-metin-gold/30"
        >
          Înapoi la chat-ul global
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Zona de mesaje */}
      <div className="flex-1 overflow-y-auto mb-2 pr-1">
        <div className="space-y-3">
          {conversation.messages.map((message, index) => (
            <div key={message.id} className={`message ${message.senderId === characterId ? 'flex flex-row-reverse' : ''}`}>
              <div className={`flex items-start ${message.senderId === characterId ? 'flex-row-reverse' : ''}`}>
                {/* Imaginea de profil - afișată doar la primul mesaj dintr-un grup */}
                {shouldShowHeader(index) ? (
                  <div className={`flex-shrink-0 ${message.senderId === characterId ? 'ml-2' : 'mr-2'}`}>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-metin-gold/30">
                      <Image
                        src={getCharacterImagePath(message.senderId, message.senderName)}
                        alt={message.senderName}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                ) : (
                  // Spațiu gol pentru a alinia mesajele din același grup
                  <div className={`flex-shrink-0 w-8 ${message.senderId === characterId ? 'ml-2' : 'mr-2'}`}></div>
                )}
                
                <div className={`flex-grow ${message.senderId === characterId ? 'text-right' : ''}`}>
                  {/* Antetul mesajului - afișat doar la primul mesaj dintr-un grup */}
                  {shouldShowHeader(index) && (
                    <div className={`flex items-center mb-1 ${message.senderId === characterId ? 'justify-end' : ''}`}>
                      <span className="text-sm font-semibold text-metin-gold">
                        {message.senderId === characterId ? 'Tu' : message.senderName}
                      </span>
                    </div>
                  )}
                  
                  <div className={`p-2 rounded-md border max-w-[80%] inline-block relative ${
                    message.senderId === characterId 
                      ? 'bg-metin-gold/15 border-metin-gold/30' 
                      : 'bg-metin-dark/60 border-metin-gold/20'
                  }`}>
                    <p className="text-sm text-metin-light text-left">{message.content}</p>
                    
                    {/* Timestamp în colțul din dreapta jos */}
                    <span className="text-[10px] text-metin-light/40 absolute bottom-1 right-2">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Formularul de mesaj */}
      <form onSubmit={handleSendMessage} className="mt-auto">
        <div className="flex items-center bg-metin-dark/80 border border-metin-gold/30 rounded-md overflow-hidden">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Scrie un mesaj către ${otherParticipant.name}...`}
            className="flex-1 bg-transparent text-metin-light px-3 py-2 focus:outline-none"
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
  );
};

export default PrivateChat; 