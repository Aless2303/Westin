import React from 'react';
import LeaderboardRow from './LeaderboardRow';
import { PlayerType } from '../../../types/player';

interface LeaderboardTableProps {
  players: PlayerType[];
  isRefreshing: boolean;
  onPlayerSelect: (player: PlayerType) => void; // Adăugăm prop-ul
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ 
  players, 
  isRefreshing,
  onPlayerSelect
}) => {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gradient-to-r from-metin-gold/15 to-metin-gold/5 text-left border-b-2 border-metin-gold/20">
          <th className="py-3 px-4 text-metin-gold">Rang</th>
          <th className="py-3 px-4 text-metin-gold">Nume jucător</th>
          <th className="py-3 px-4 text-metin-gold text-center">Nivel</th>
          <th className="py-3 px-4 text-metin-gold text-right">Experiență</th>
          <th className="py-3 px-4 text-metin-gold text-center">Clasă</th>
        </tr>
      </thead>
      <tbody className={isRefreshing ? "opacity-50" : ""}>
        {players.map((player, index) => (
          <LeaderboardRow 
            key={player.id} 
            player={player} 
            index={index}
            isCurrentPlayer={player.id === "current-player"}
            onPlayerSelect={onPlayerSelect} // Transmitem prop-ul
          />
        ))}
      </tbody>
    </table>
  );
};

export default LeaderboardTable;