import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import hardcodedPlayers from '../data/players';
import { PlayerType } from '../types';
import { useWorks } from '../../works/context/WorksContext';
import { useReports } from '../../reports/hooks/useReports';

interface DuelsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  characterData: {
    name: string;
    level: number;
    race: string;
    x: number;
    y: number;
    hp: {
      current: number;
      max: number;
    };
    stamina: {
      current: number;
      max: number;
    };
    attack: number;
    defense: number;
  };
  updatePlayerHp: (newHp: number) => void;
  updatePlayerStamina: (newStamina: number) => void;
}

const DuelsPanel: React.FC<DuelsPanelProps> = ({ 
  isOpen, 
  onClose, 
  characterData,
  updatePlayerHp,
  updatePlayerStamina
}) => {
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerType | null>(null);
  const [isDuelInProgress, setIsDuelInProgress] = useState(false);
  const [duelTimer, setDuelTimer] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const { addJob, characterPosition } = useWorks();
  const { addReport } = useReports();
  const playersPerPage = 4;
  
  // Sort players by distance from character
  const sortedPlayers = [...hardcodedPlayers].map(player => {
    const distance = calculateDistance(
      characterData.x,
      characterData.y,
      player.x,
      player.y
    );
    return { ...player, distance };
  }).sort((a, b) => a.distance - b.distance);
  
  // Paginate players
  const totalPages = Math.ceil(sortedPlayers.length / playersPerPage);
  const currentPlayers = sortedPlayers.slice(
    (currentPage - 1) * playersPerPage,
    currentPage * playersPerPage
  );
  
  // Format time display (minutes:seconds)
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate distance between two points
  function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  
  // Calculate travel time in seconds
  function calculateTravelTime(distance: number): number {
    // Convert to seconds (speed ratio: 141.42 units = 1 minute)
    return Math.round((distance / 141.42) * 60);
  }
  
  // Auto-hide error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === panelRef.current?.querySelector('.header')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  const handlePlayerSelect = (player: PlayerType) => {
    setSelectedPlayer(player);
  };
  
  const handleStartDuel = () => {
    if (!selectedPlayer) return;
    
    // Check if player has enough stamina
    if (characterData.stamina.current < 50) {
      setErrorMessage("Nu ai suficientă stamină! Ai nevoie de 50 stamină pentru un duel.");
      return;
    }
    
    // Calculate travel time
    const distance = calculateDistance(
      characterPosition.x, 
      characterPosition.y, 
      selectedPlayer.x, 
      selectedPlayer.y
    );
    const travelTimeSeconds = calculateTravelTime(distance);
    
    // Create a duel job
    const duelSuccess = addJob({
      type: '1h', // Using 1h job type for the 2 hour duel
      remainingTime: 7200, // 2 hours in seconds
      travelTime: travelTimeSeconds,
      isInProgress: false,
      mobName: `Duel cu ${selectedPlayer.name}`,
      mobImage: selectedPlayer.image,
      mobX: selectedPlayer.x,
      mobY: selectedPlayer.y,
      mobType: 'duel',
      mobLevel: selectedPlayer.level,
      mobHp: selectedPlayer.hp.max,
      mobAttack: selectedPlayer.attack,
      staminaCost: 50, // Duels cost 50 stamina
      // Adding custom fields for duel
      duelOpponent: selectedPlayer.name,
      duelOpponentRace: selectedPlayer.race,
      duelOpponentLevel: selectedPlayer.level,
      duelOpponentAttack: selectedPlayer.attack,
      duelOpponentDefense: selectedPlayer.defense
    });
    
    if (duelSuccess) {
      // Close panel after starting duel
      onClose();
    } else {
      setErrorMessage("Nu poți avea mai mult de 3 munci active!");
    }
  };
  
  // Simulate a duel (for demonstration)
  const simulateDuel = () => {
    if (!selectedPlayer) return;
    
    setIsDuelInProgress(true);
    
    // Start a 5-second countdown (in real implementation this would be longer)
    setDuelTimer(5);
    
    const duelInterval = setInterval(() => {
      setDuelTimer(prev => {
        if (prev <= 1) {
          clearInterval(duelInterval);
          completeDuel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Complete the duel and create a report
  const completeDuel = () => {
    if (!selectedPlayer) return;
    
    // Simulate duel combat
    const playerAttack = characterData.attack;
    const playerDefense = characterData.defense;
    const playerHp = characterData.hp.current;
    
    const opponentAttack = selectedPlayer.attack;
    const opponentDefense = selectedPlayer.defense;
    const opponentHp = selectedPlayer.hp.current;
    
    let currentPlayerHp = playerHp;
    let currentOpponentHp = opponentHp;
    const totalRounds = 30; // For simulation
    const combatLogs: string[] = [];
    
    // Log start of combat
    combatLogs.push(`[Duel început] ${selectedPlayer.name} (Nivel ${selectedPlayer.level}) vs Tine (Nivel ${characterData.level})`);
    
    // Determine who attacks first based on level
    const playerFirst = characterData.level >= selectedPlayer.level;
    
    // Simulate rounds
    for (let round = 1; round <= totalRounds; round++) {
      if (currentPlayerHp <= 0 || currentOpponentHp <= 0) break;
      
      if (playerFirst) {
        // Player attacks first
        const damageToOpponent = Math.round(playerAttack * (1 - (opponentDefense / (opponentDefense + 300))));
        currentOpponentHp = Math.max(0, currentOpponentHp - damageToOpponent);
        combatLogs.push(`[Runda ${round}] Tu ataci ${selectedPlayer.name} pentru ${damageToOpponent} damage. HP-ul adversarului: ${currentOpponentHp}`);
        
        if (currentOpponentHp <= 0) {
          combatLogs.push(`[Victorie] Ai învins pe ${selectedPlayer.name}!`);
          break;
        }
        
        // Opponent attacks
        const damageToPlayer = Math.round(opponentAttack * (1 - (playerDefense / (playerDefense + 300))));
        currentPlayerHp = Math.max(0, currentPlayerHp - damageToPlayer);
        combatLogs.push(`[Runda ${round}] ${selectedPlayer.name} te atacă pentru ${damageToPlayer} damage. HP-ul tău: ${currentPlayerHp}`);
        
        if (currentPlayerHp <= 0) {
          combatLogs.push(`[Înfrângere] Ai fost învins de ${selectedPlayer.name}!`);
          break;
        }
      } else {
        // Opponent attacks first
        const damageToPlayer = Math.round(opponentAttack * (1 - (playerDefense / (playerDefense + 300))));
        currentPlayerHp = Math.max(0, currentPlayerHp - damageToPlayer);
        combatLogs.push(`[Runda ${round}] ${selectedPlayer.name} te atacă pentru ${damageToPlayer} damage. HP-ul tău: ${currentPlayerHp}`);
        
        if (currentPlayerHp <= 0) {
          combatLogs.push(`[Înfrângere] Ai fost învins de ${selectedPlayer.name}!`);
          break;
        }
        
        // Player attacks
        const damageToOpponent = Math.round(playerAttack * (1 - (opponentDefense / (opponentDefense + 300))));
        currentOpponentHp = Math.max(0, currentOpponentHp - damageToOpponent);
        combatLogs.push(`[Runda ${round}] Tu ataci ${selectedPlayer.name} pentru ${damageToOpponent} damage. HP-ul adversarului: ${currentOpponentHp}`);
        
        if (currentOpponentHp <= 0) {
          combatLogs.push(`[Victorie] Ai învins pe ${selectedPlayer.name}!`);
          break;
        }
      }
    }
    
    // Determine result
    const result = currentOpponentHp <= 0 ? 'victory' : 'defeat';
    const playerHpLost = playerHp - currentPlayerHp;
    
    // Calculate rewards
    const expGained = result === 'victory' ? 2000 : 0;
    const yangGained = result === 'victory' ? 5000 : 0;
    
    // Update player HP
    updatePlayerHp(currentPlayerHp);
    
    // If player lost all HP, set stamina to 0
    if (currentPlayerHp <= 0) {
      updatePlayerStamina(0);
    }
    
    // Create duel report
    const reportId = Date.now().toString() + "_" + Math.random().toString(36).substring(2, 7);
    
    let reportContent = '';
    if (result === 'victory') {
      reportContent = `Ai câștigat duelul împotriva jucătorului ${selectedPlayer.name}!\n\n` +
        `Ai primit ${expGained.toLocaleString()} experiență și ${yangGained.toLocaleString()} yang.\n\n` +
        `Detalii luptă:\n` +
        `- Ai provocat ${(opponentHp - currentOpponentHp).toLocaleString()} damage\n` +
        `- Ai pierdut ${playerHpLost.toLocaleString()} HP\n\n` +
        `Ultimele acțiuni:\n` +
        combatLogs.slice(-3).join('\n');
    } else {
      reportContent = `Ai pierdut duelul împotriva jucătorului ${selectedPlayer.name}!\n\n` +
        `Nu ai primit nicio recompensă.\n\n` +
        `Detalii luptă:\n` +
        `- Ai provocat ${(opponentHp - currentOpponentHp).toLocaleString()} damage\n` +
        `- Ai pierdut ${playerHpLost.toLocaleString()} HP\n\n` +
        `Ultimele acțiuni:\n` +
        combatLogs.slice(-3).join('\n');
    }
    
    addReport({
      id: reportId,
      type: 'duel',
      subject: `Duel: ${selectedPlayer.name} vs ${characterData.name}`,
      content: reportContent,
      read: false,
      playerName: selectedPlayer.name,
      result: result,
      combatStats: {
        playerHpLost: playerHpLost,
        damageDealt: opponentHp - currentOpponentHp,
        expGained: expGained,
        yangGained: yangGained,
        totalRounds: totalRounds,
        remainingMobHp: currentOpponentHp
      }
    });
    
    // Reset duel state
    setIsDuelInProgress(false);
    setSelectedPlayer(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef}
      className="fixed z-50 bg-metin-dark/95 border-2 border-metin-gold/40 rounded-lg shadow-lg"
      style={{ 
        width: '500px', 
        height: '450px',
        top: `${position.y}px`, 
        left: `${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div 
        className="header bg-gradient-to-r from-metin-brown to-metin-dark border-b border-metin-gold/40 px-4 py-2 flex justify-between items-center cursor-grab"
        onMouseDown={handleMouseDown}
      >
        <h2 className="text-metin-gold font-bold text-lg">Duele</h2>
        <button 
          onClick={onClose}
          className="text-metin-light/70 hover:text-metin-gold text-xl transition-colors"
        >
          ×
        </button>
      </div>
      
      <div className="p-4 h-[calc(100%-44px)] flex flex-col">
        {isDuelInProgress ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-3xl text-metin-gold mb-4">Duel în progres</div>
            <div className="text-5xl text-metin-red mb-6">{duelTimer}</div>
            <div className="animate-pulse text-metin-light text-center">
              Se luptă cu {selectedPlayer?.name}...
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <h3 className="text-metin-gold text-lg">Jucători din apropiere</h3>
              <div className="ml-auto text-metin-light/70 text-sm">
                Pagina {currentPage}/{totalPages}
              </div>
            </div>
            
            {/* Error message */}
            {errorMessage && (
              <div className="bg-red-900/50 border border-red-500/50 p-2 rounded-lg mb-4 text-center animate-pulse">
                <span className="text-red-400 text-sm">{errorMessage}</span>
              </div>
            )}
            
            {/* Player list */}
            <div className="flex-grow overflow-y-auto mb-4">
              {currentPlayers.length > 0 ? (
                <div className="grid gap-3">
                  {currentPlayers.map((player) => (
                    <div 
                      key={player.id}
                      className={`bg-black/40 border rounded-lg p-3 flex items-center cursor-pointer transition-colors ${
                        selectedPlayer?.id === player.id 
                          ? 'border-metin-gold bg-metin-gold/10' 
                          : 'border-metin-gold/20 hover:border-metin-gold/50 hover:bg-black/60'
                      }`}
                      onClick={() => handlePlayerSelect(player)}
                    >
                      {/* Player image */}
                      <div className="relative w-14 h-14 bg-black/60 border border-metin-gold/30 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                        <Image 
                          src={player.image}
                          alt={player.name}
                          width={56}
                          height={56}
                          className="object-contain w-full h-full"
                          style={{ objectPosition: 'center' }}
                          quality={100}
                        />
                      </div>
                      
                      {/* Player info */}
                      <div className="flex-grow mr-3">
                        <div className="text-metin-gold font-medium text-sm mb-1">{player.name}</div>
                        <div className="grid grid-cols-3 gap-x-2 text-xs">
                          <div className="text-metin-light/80">
                            Nivel: <span className="text-metin-light">{player.level}</span>
                          </div>
                          <div className="text-metin-light/80">
                            Clasă: <span className="text-metin-light">{player.race}</span>
                          </div>
                          <div className="text-metin-light/80">
                            Distanță: <span className="text-yellow-300">
                              {formatTime(calculateTravelTime(player.distance))}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Duel button */}
                      <button 
                        className="w-8 h-8 flex items-center justify-center bg-metin-dark/80 border border-metin-gold/30 rounded-lg hover:bg-metin-red/20 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayerSelect(player);
                          handleStartDuel();
                        }}
                        title="Duel"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 3L21 6L10 17L6 13L18 3Z" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 21L3.4 18.4L5.5 16.2L9 19.5L6.8 21.6L3 21Z" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-metin-light/50">
                  Nu s-au găsit jucători în apropiere
                </div>
              )}
            </div>
            
            {/* Pagination and action buttons */}
            <div className="mt-auto flex justify-between items-center">
              {/* Pagination buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`w-8 h-8 flex items-center justify-center rounded-md border ${
                    currentPage === 1
                      ? 'border-metin-light/20 text-metin-light/30 cursor-not-allowed'
                      : 'border-metin-gold/30 text-metin-light hover:bg-metin-gold/20 hover:text-metin-gold'
                  }`}
                >
                  &lt;
                </button>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`w-8 h-8 flex items-center justify-center rounded-md border ${
                    currentPage === totalPages || totalPages === 0
                      ? 'border-metin-light/20 text-metin-light/30 cursor-not-allowed'
                      : 'border-metin-gold/30 text-metin-light hover:bg-metin-gold/20 hover:text-metin-gold'
                  }`}
                >
                  &gt;
                </button>
              </div>
              
              {/* Duel button */}
              {selectedPlayer && (
                <div className="flex items-center">
                  <div className="text-metin-light/80 mr-3 text-sm">
                    <div>Duel cu <span className="text-metin-gold">{selectedPlayer.name}</span></div>
                    <div className="text-xs">Cost: <span className="text-cyan-400">50 stamină</span></div>
                  </div>
                  
                  <button
                    onClick={handleStartDuel}
                    className="px-4 py-2 bg-metin-red/30 border border-metin-gold/50 rounded-md text-metin-gold hover:bg-metin-red/40 transition-colors flex items-center"
                    disabled={characterData.stamina.current < 50}
                  >
                    <svg width="16" height="16" className="mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 3L21 6L10 17L6 13L18 3Z" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 21L3.4 18.4L5.5 16.2L9 19.5L6.8 21.6L3 21Z" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Duel 2h
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DuelsPanel;