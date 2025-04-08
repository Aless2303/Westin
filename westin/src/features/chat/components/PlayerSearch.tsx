import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useChatContext } from '../context/ChatContext';
import mockData from '../../../data/mock';
import { PlayerType } from '../../../types/player';

const PlayerSearch: React.FC = () => {
  const { 
    searchPlayerInput, 
    setSearchPlayerInput, 
    initiatePrivateChat, 
    setShowPlayerSearch 
  } = useChatContext();
  
  const [searchResults, setSearchResults] = useState<PlayerType[]>([]);

  useEffect(() => {
    if (searchPlayerInput.trim().length >= 2) {
      const results = mockData.players.filter((player) =>
        player.name.toLowerCase().includes(searchPlayerInput.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchPlayerInput]);

  const handleSelectPlayer = (playerId: string, playerName: string) => {
    initiatePrivateChat(playerId, playerName);
  };

  return (
    <div className="bg-metin-dark/95 backdrop-blur-sm border-2 border-metin-gold/40 rounded-lg shadow-xl p-2 sm:p-5 w-[95vw] max-w-[95vw] sm:max-w-md animate-fade-in">
      <div className="absolute -top-2 sm:-top-3 -left-2 sm:-left-3 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 border-metin-gold/60 rounded-tl-lg"></div>
      <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 border-metin-gold/60 rounded-tr-lg"></div>
      <div className="absolute -bottom-2 sm:-bottom-3 -left-2 sm:-left-3 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 border-metin-gold/60 rounded-bl-lg"></div>
      <div className="absolute -bottom-2 sm:-bottom-3 -right-2 sm:-right-3 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 border-metin-gold/60 rounded-br-lg"></div>

      <div className="flex justify-between items-center mb-2 sm:mb-5">
        <h3 className="text-metin-gold text-base sm:text-xl font-serif">Caută un jucător</h3>
        <button
          onClick={() => setShowPlayerSearch(false)}
          className="w-5 sm:w-8 h-5 sm:h-8 bg-metin-dark/90 border border-metin-gold/30 rounded-full flex items-center justify-center text-metin-gold hover:bg-metin-gold/20 transition-colors"
          aria-label="Închide"
        >
          ×
        </button>
      </div>

      <div className="mb-2 sm:mb-5">
        <div className="relative">
          <input
            type="text"
            value={searchPlayerInput}
            onChange={(e) => setSearchPlayerInput(e.target.value)}
            placeholder="Numele jucătorului..."
            className="w-full bg-metin-dark/80 text-metin-light border border-metin-gold/30 rounded-md px-2 sm:px-4 py-1.5 sm:py-3 pr-6 sm:pr-10 focus:outline-none focus:border-metin-gold/70 placeholder-metin-light/40 text-[10px] sm:text-base"
            autoFocus
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-1 sm:pr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 sm:h-5 w-3.5 sm:w-5 text-metin-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {searchResults.length > 0 ? (
        <div className="max-h-60 sm:max-h-80 overflow-y-auto pr-0.5 sm:pr-1 scrollbar-thin scrollbar-thumb-metin-gold/20 scrollbar-track-transparent">
          <ul className="space-y-1.5 sm:space-y-3">
            {searchResults.map((player) => (
              <li 
                key={player.id}
                onClick={() => handleSelectPlayer(player.id, player.name)}
                className="bg-metin-dark/60 hover:bg-metin-gold/20 border border-metin-gold/30 rounded-md p-1.5 sm:p-3 cursor-pointer transition-colors duration-200 relative group"
              >
                <div className="absolute inset-0 border border-metin-gold opacity-0 group-hover:opacity-100 rounded-md transition-opacity duration-200"></div>
                <div className="flex items-center">
                  <div className="w-8 sm:w-12 h-8 sm:h-12 rounded-full overflow-hidden border border-metin-gold/50 mr-1 sm:mr-3 flex-shrink-0 bg-metin-dark/50">
                    <Image
                      src={player.image}
                      alt={player.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-0.5 sm:mb-1">
                      <span className="text-metin-gold font-semibold text-xs sm:text-base">{player.name}</span>
                      <span className="text-metin-light/70 text-[8px] sm:text-xs ml-1 sm:ml-2">Nivel {player.level}</span>
                    </div>
                    <div className="text-[8px] sm:text-xs text-metin-light/70 flex items-center">
                      <span className="mr-1 sm:mr-3">{player.race}</span>
                      <span className="text-metin-light/50">•</span>
                      <span className="ml-1 sm:ml-3">{player.gender}</span>
                    </div>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-metin-gold text-[10px] sm:text-base">➜</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : searchPlayerInput.trim().length >= 2 ? (
        <div className="flex flex-col items-center justify-center py-3 sm:py-6 text-metin-light/70 border border-dashed border-metin-gold/20 rounded-md bg-metin-dark/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 sm:h-10 w-6 sm:w-10 text-metin-gold/30 mb-1 sm:mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[10px] sm:text-sm">Niciun jucător găsit</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-3 sm:py-6 text-metin-light/70 border border-dashed border-metin-gold/20 rounded-md bg-metin-dark/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 sm:h-10 w-6 sm:w-10 text-metin-gold/30 mb-1 sm:mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-[10px] sm:text-sm">Minim 2 caractere</p>
        </div>
      )}

      <div className="flex justify-between mt-2 sm:mt-5">
        <button
          onClick={() => setShowPlayerSearch(false)}
          className="px-2 sm:px-4 py-0.5 sm:py-2 border border-metin-gold/30 text-metin-light/80 rounded hover:bg-metin-dark/50 transition-colors text-[10px] sm:text-base"
        >
          Anulează
        </button>
        <button 
          className="px-2 sm:px-4 py-0.5 sm:py-2 bg-metin-gold/20 border border-metin-gold/50 text-metin-gold rounded hover:bg-metin-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[10px] sm:text-base"
          disabled={searchResults.length === 0}
          onClick={() => {
            if (searchResults.length > 0) {
              handleSelectPlayer(searchResults[0].id, searchResults[0].name);
            }
          }}
        >
          Selectează
        </button>
      </div>
    </div>
  );
};

export default PlayerSearch;