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

  // Efectuează căutarea când se schimbă input-ul
  useEffect(() => {
    if (searchPlayerInput.trim().length >= 2) { // Caută doar dacă sunt minim 2 caractere
      const results = mockData.players.filter((player) =>
        player.name.toLowerCase().includes(searchPlayerInput.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchPlayerInput]);

  // Handler pentru selectarea unui jucător din listă
  const handleSelectPlayer = (playerId: string, playerName: string) => {
    initiatePrivateChat(playerId, playerName);
  };

  return (
    <div className="bg-metin-dark/90 border border-metin-gold/40 rounded-md p-4 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-metin-gold text-lg font-semibold">Caută un jucător</h3>
        <button
          onClick={() => setShowPlayerSearch(false)}
          className="text-metin-gold/70 hover:text-metin-gold"
          aria-label="Închide"
        >
          ×
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchPlayerInput}
          onChange={(e) => setSearchPlayerInput(e.target.value)}
          placeholder="Numele jucătorului..."
          className="w-full bg-metin-dark/80 text-metin-light border border-metin-gold/30 rounded-md px-3 py-2 focus:outline-none focus:border-metin-gold/70"
          autoFocus
        />
      </div>

      {searchResults.length > 0 ? (
        <div className="max-h-60 overflow-y-auto">
          <ul className="space-y-2">
            {searchResults.map((player) => (
              <li 
                key={player.id}
                onClick={() => handleSelectPlayer(player.id, player.name)}
                className="bg-metin-dark/60 hover:bg-metin-gold/20 border border-metin-gold/30 rounded-md p-3 cursor-pointer transition-colors duration-150"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-metin-gold/30 mr-3 flex-shrink-0">
                    <Image
                      src={player.image}
                      alt={player.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-metin-gold font-medium">{player.name}</span>
                      <span className="text-metin-light/70 text-xs ml-2">Nivel {player.level}</span>
                    </div>
                    <div className="text-xs text-metin-light/70 mt-1">{player.race} - {player.gender}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : searchPlayerInput.trim().length >= 2 ? (
        <div className="text-center py-4 text-metin-light/70">
          Nu a fost găsit niciun jucător cu acest nume
        </div>
      ) : null}

      <div className="mt-4 text-xs text-metin-light/60 text-center">
        Tastează cel puțin 2 caractere pentru a căuta
      </div>
    </div>
  );
};

export default PlayerSearch; 