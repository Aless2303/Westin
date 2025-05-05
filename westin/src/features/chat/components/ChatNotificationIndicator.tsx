"use client";

import React from 'react';
import { useChatContext } from '../context/ChatContext';

const ChatNotificationIndicator: React.FC = () => {
  const { 
    newMessageNotification, 
    dismissNotification, 
    openConversationFromNotification
  } = useChatContext();

  if (!newMessageNotification.show) return null;

  return (
    <div 
      className="fixed top-16 right-4 z-50 bg-metin-dark border border-metin-gold/60 shadow-lg rounded-md p-4 max-w-xs"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-metin-gold font-semibold text-sm">
            Mesaj nou de la {newMessageNotification.senderName}
          </h4>
          <button 
            onClick={dismissNotification}
            className="text-metin-light/60 hover:text-metin-light"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-metin-light text-xs mb-3 line-clamp-2">
          {newMessageNotification.content}
        </p>
        
        <button
          onClick={openConversationFromNotification}
          className="self-end bg-metin-gold/20 border border-metin-gold/40 hover:bg-metin-gold/30 text-metin-gold text-xs px-3 py-1 rounded"
        >
          Deschide conversația
        </button>
      </div>
    </div>
  );
};

export default ChatNotificationIndicator; 