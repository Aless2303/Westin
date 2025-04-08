import React from 'react';
import Image from 'next/image';
import { PlayerType } from '../../../types/player';
import { formatNumber } from '../utils/formatting';

interface LeaderboardMobileCardsProps {
  players: PlayerType[];
  isRefreshing: boolean;
  onPlayerSelect: (player: PlayerType) => void;
}

const LeaderboardMobileCards: React.FC<LeaderboardMobileCardsProps> = ({
  players,
  isRefreshing,
  onPlayerSelect
}) => {
  return (
    <div className={`flex flex-col gap-2 ${isRefreshing ? 'opacity-50' : ''}`}>
      {players.map((player, index) => {
        const isCurrentPlayer = player.id === "current-player";
        const cardStyles = `p-2 rounded-lg border-b border-metin-gold/10 
          ${index < 3 ? 'bg-gradient-to-r from-metin-gold/10 to-transparent' : ''} 
          ${isCurrentPlayer ? 'bg-metin-gold/5' : ''} 
          hover:bg-metin-gold/10 transition-colors`;

        return (
          <div key={player.id} className={cardStyles}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {index === 0 && (
                  <div className="w-6 h-6 mr-2 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-bold text-metin-dark shadow-lg border border-yellow-300">
                    1
                  </div>
                )}
                {index === 1 && (
                  <div className="w-6 h-6 mr-2 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-metin-dark shadow-lg border border-gray-200">
                    2
                  </div>
                )}
                {index === 2 && (
                  <div className="w-6 h-6 mr-2 rounded-full bg-amber-700 flex items-center justify-center text-[10px] font-bold text-metin-dark shadow-lg border border-amber-600">
                    3
                  </div>
                )}
                {index > 2 && (
                  <span className="text-metin-light/70 mr-2 w-6 text-center text-xs">{index + 1}</span>
                )}
                <div className="w-8 h-8 bg-metin-dark rounded-full overflow-hidden border border-metin-gold/30 mr-2 shadow-md">
                  <div className="relative w-full h-full bg-gradient-to-b from-black/0 to-black/50">
                    <Image
                      src={player.image}
                      alt={player.name}
                      fill
                      sizes="32px"
                      className="object-contain"
                      style={{ objectPosition: 'center 10%' }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => onPlayerSelect(player)}
                  className={`font-medium truncate max-w-[120px] text-xs ${isCurrentPlayer ? 'text-metin-gold' : 'text-metin-light hover:text-metin-gold'} transition-colors`}
                  title={`Vezi profilul lui ${player.name}`}
                >
                  {player.name} {isCurrentPlayer && "(Tu)"}
                </button>
              </div>
              <span className="inline-block px-2 py-0.5 rounded bg-metin-gold/10 text-metin-gold text-xs font-bold border border-metin-gold/20">
                {player.level}
              </span>
            </div>
            <div className="mt-1 flex justify-between items-center">
              <span 
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm
                  ${player.race === 'Warrior' ? 'bg-red-950/60 text-red-300 border border-red-800/50' : ''}
                  ${player.race === 'Ninja' ? 'bg-blue-950/60 text-blue-300 border border-blue-800/50' : ''}
                  ${player.race === 'Sura' ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50' : ''}
                  ${player.race === 'Shaman' ? 'bg-green-950/60 text-green-300 border border-green-800/50' : ''}
                `}
              >
                {player.race}
              </span>
              <div className="text-right text-metin-light">
                <div className="font-medium text-xs">{formatNumber(player.experience?.current || 0)}</div>
                <div className="w-24 h-1 mt-1 bg-metin-dark rounded-full overflow-hidden border border-metin-gold/20">
                  <div 
                    className="h-full bg-gradient-to-r from-metin-gold/50 to-metin-gold/80" 
                    style={{ width: `${player.experience?.percentage || 0}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeaderboardMobileCards;