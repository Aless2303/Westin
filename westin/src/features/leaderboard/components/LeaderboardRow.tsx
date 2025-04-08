import React from 'react';
import Image from 'next/image';
import { PlayerType } from '../../../types/player';
import { formatNumber } from '../utils/formatting';

interface LeaderboardRowProps {
  player: PlayerType;
  index: number;
  isCurrentPlayer: boolean;
  onPlayerSelect: (player: PlayerType) => void;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ 
  player, 
  index,
  isCurrentPlayer,
  onPlayerSelect
}) => {
  return (
    <tr 
      className={`border-b border-metin-gold/10 
        ${index < 3 ? 'bg-gradient-to-r from-metin-gold/10 to-transparent' : ''} 
        ${isCurrentPlayer ? 'bg-metin-gold/5' : ''}
        hover:bg-metin-gold/10 transition-colors`}
    >
      <td className="py-3 px-4">
        <div className="flex items-center">
          {index === 0 && (
            <div className="w-7 h-7 mr-2 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-metin-dark shadow-lg border border-yellow-300">
              1
            </div>
          )}
          {index === 1 && (
            <div className="w-7 h-7 mr-2 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-metin-dark shadow-lg border border-gray-200">
              2
            </div>
          )}
          {index === 2 && (
            <div className="w-7 h-7 mr-2 rounded-full bg-amber-700 flex items-center justify-center text-xs font-bold text-metin-dark shadow-lg border border-amber-600">
              3
            </div>
          )}
          {index > 2 && (
            <span className="text-metin-light/70 ml-2 w-7 text-center text-base">{index + 1}</span>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-metin-dark rounded-full overflow-hidden border border-metin-gold/30 mr-3 shadow-md">
            <div className="relative w-full h-full bg-gradient-to-b from-black/0 to-black/50">
              <Image
                src={player.image}
                alt={player.name}
                fill
                sizes="40px"
                className="object-contain"
                style={{ objectPosition: 'center 10%' }}
              />
            </div>
          </div>
          <button
            onClick={() => onPlayerSelect(player)}
            className={`font-medium truncate max-w-[150px] text-base ${isCurrentPlayer ? 'text-metin-gold' : 'text-metin-light hover:text-metin-gold'} transition-colors`}
            title={`Vezi profilul lui ${player.name}`}
          >
            {player.name} {isCurrentPlayer && "(Tu)"}
          </button>
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="inline-block px-3 py-1 rounded bg-metin-gold/10 text-metin-gold text-sm font-bold border border-metin-gold/20">
          {player.level}
        </span>
      </td>
      <td className="py-3 px-4 text-right text-metin-light">
        <div className="font-medium text-base">{formatNumber(player.experience?.current || 0)}</div>
        <div className="w-full h-2 mt-1 bg-metin-dark rounded-full overflow-hidden border border-metin-gold/20">
          <div 
            className="h-full bg-gradient-to-r from-metin-gold/50 to-metin-gold/80" 
            style={{ width: `${player.experience?.percentage || 0}%` }} 
          />
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span 
          className={`inline-block px-4 py-1 rounded-full text-xs font-bold shadow-sm
            ${player.race === 'Warrior' ? 'bg-red-950/60 text-red-300 border border-red-800/50' : ''}
            ${player.race === 'Ninja' ? 'bg-blue-950/60 text-blue-300 border border-blue-800/50' : ''}
            ${player.race === 'Sura' ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50' : ''}
            ${player.race === 'Shaman' ? 'bg-green-950/60 text-green-300 border border-green-800/50' : ''}
          `}
        >
          {player.race}
        </span>
      </td>
    </tr>
  );
};

export default LeaderboardRow;