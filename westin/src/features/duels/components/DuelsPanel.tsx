import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { PlayerType } from '../types';
import { useReports } from '../../reports/hooks/useReports';
import { fetchNearbyPlayers } from '../api';
import { useWorks } from '../../works/context/WorksContext';

interface DuelsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  characterData: {
    name: string;
    level: number;
    race: string;
    x: number;
    y: number;
    hp: { current: number; max: number };
    stamina: { current: number; max: number };
    attack: number;
    defense: number;
  };
  updatePlayerHp: (newHp: number) => void;
  updatePlayerStamina: (newStamina: number) => void;
}

// Extended PlayerType with distance property
interface PlayerWithDistance extends PlayerType {
  distance: number;
}

const DuelsPanel: React.FC<DuelsPanelProps> = ({
  isOpen,
  onClose,
  characterData,
  updatePlayerHp,
  updatePlayerStamina,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithDistance | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDuels, setActiveDuels] = useState<Set<string>>(new Set());

  // Use the Works context to add the duel as a job
  const { addJob, jobs } = useWorks();
  const { addReport } = useReports();
  const playersPerPage = 4;

  // Calcul poziție inițială pentru a fi centrată pe ecran
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const panelWidth = panelRef.current.offsetWidth;
      const panelHeight = panelRef.current.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const initialX = Math.max(0, (windowWidth - panelWidth) / 2);
      const initialY = Math.max(0, (windowHeight - panelHeight) / 2);
      setPosition({ x: initialX, y: initialY });
    }
  }, [isOpen]);

  // Fetch nearby players when panel opens
  useEffect(() => {
    if (isOpen) {
      loadNearbyPlayers();
    }
  }, [isOpen, characterData.x, characterData.y]);

  const panelRef = useRef<HTMLDivElement>(null);

  function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  // Function to load nearby players from API
  const loadNearbyPlayers = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log('Starting to load nearby players...');
      const nearbyPlayers = await fetchNearbyPlayers();
      
      if (!nearbyPlayers || nearbyPlayers.length === 0) {
        console.log('No nearby players found');
        setPlayers([]);
        setCurrentPage(1);
        setIsLoading(false);
        return;
      }
      
      // Calculate distance for each player
      console.log(`Processing ${nearbyPlayers.length} players...`);
      const playersWithDistance = nearbyPlayers.map(player => {
        if (!player || typeof player.x !== 'number' || typeof player.y !== 'number') {
          console.warn('Invalid player data:', player);
          return null;
        }
        
        const distance = calculateDistance(characterData.x, characterData.y, player.x, player.y);
        return { ...player, distance } as PlayerWithDistance;
      }).filter((player): player is PlayerWithDistance => player !== null);
      
      // Sort by distance
      const sortedPlayers = playersWithDistance.sort((a, b) => a.distance - b.distance);
      console.log(`Sorted ${sortedPlayers.length} players by distance`);
      
      setPlayers(sortedPlayers);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to load nearby players:', error);
      setErrorMessage('Nu s-au putut încărca jucătorii din apropiere');
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(players.length / playersPerPage);
  const currentPlayers = players.slice(
    (currentPage - 1) * playersPerPage,
    currentPage * playersPerPage
  );

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0
      ? `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  function calculateTravelTime(distance: number): number {
    return Math.round((distance / 141.42) * 60);
  }

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === panelRef.current?.querySelector('.header')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !panelRef.current) return;
    const panelWidth = panelRef.current.offsetWidth;
    const panelHeight = panelRef.current.offsetHeight;
    const maxX = window.innerWidth - panelWidth;
    const maxY = window.innerHeight - panelHeight;

    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handlePlayerSelect = (player: PlayerWithDistance) => {
    setSelectedPlayer(player);
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.target === panelRef.current?.querySelector('.header')) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !panelRef.current) return;
    const panelWidth = panelRef.current.offsetWidth;
    const panelHeight = panelRef.current.offsetHeight;
    const maxX = window.innerWidth - panelWidth;
    const maxY = window.innerHeight - panelHeight;

    let newX = e.touches[0].clientX - dragStart.x;
    let newY = e.touches[0].clientY - dragStart.y;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    } else {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // Function to simulate the duel combat when the job completes
  const simulateDuel = useCallback((player: PlayerWithDistance) => {
    const playerAttack = characterData.attack;
    const playerDefense = characterData.defense;
    const playerHp = characterData.hp.current;
    const opponentAttack = player.attack;
    const opponentDefense = player.defense;
    const opponentHp = player.hp.current;
    let currentPlayerHp = playerHp;
    let currentOpponentHp = opponentHp;
    const totalRounds = 30;
    const combatLogs: string[] = [];
    combatLogs.push(
      `[Duel început] ${player.name} (Nivel ${player.level}) vs Tine (Nivel ${characterData.level})`
    );
    const playerFirst = characterData.level >= player.level;
    
    for (let round = 1; round <= totalRounds; round++) {
      if (currentPlayerHp <= 0 || currentOpponentHp <= 0) break;
      
      if (playerFirst) {
        // Player attacks first
        const damageToOpponent = Math.round(playerAttack * (1 - opponentDefense / (opponentDefense + 300)));
        currentOpponentHp = Math.max(0, currentOpponentHp - damageToOpponent);
        combatLogs.push(
          `[Runda ${round}] Tu ataci ${player.name} pentru ${damageToOpponent} damage. HP-ul adversarului: ${currentOpponentHp}`
        );
        
        if (currentOpponentHp <= 0) {
          combatLogs.push(`[Victorie] Ai învins pe ${player.name}!`);
          break;
        }
        
        // Opponent attacks second
        const damageToPlayer = Math.round(opponentAttack * (1 - playerDefense / (playerDefense + 300)));
        currentPlayerHp = Math.max(0, currentPlayerHp - damageToPlayer);
        combatLogs.push(
          `[Runda ${round}] ${player.name} te atacă pentru ${damageToPlayer} damage. HP-ul tău: ${currentPlayerHp}`
        );
        
        if (currentPlayerHp <= 0) {
          combatLogs.push(`[Înfrângere] Ai fost învins de ${player.name}!`);
          break;
        }
      } else {
        // Opponent attacks first
        const damageToPlayer = Math.round(opponentAttack * (1 - playerDefense / (playerDefense + 300)));
        currentPlayerHp = Math.max(0, currentPlayerHp - damageToPlayer);
        combatLogs.push(
          `[Runda ${round}] ${player.name} te atacă pentru ${damageToPlayer} damage. HP-ul tău: ${currentPlayerHp}`
        );
        
        if (currentPlayerHp <= 0) {
          combatLogs.push(`[Înfrângere] Ai fost învins de ${player.name}!`);
          break;
        }
        
        // Player attacks second
        const damageToOpponent = Math.round(playerAttack * (1 - opponentDefense / (opponentDefense + 300)));
        currentOpponentHp = Math.max(0, currentOpponentHp - damageToOpponent);
        combatLogs.push(
          `[Runda ${round}] Tu ataci ${player.name} pentru ${damageToOpponent} damage. HP-ul adversarului: ${currentOpponentHp}`
        );
        
        if (currentOpponentHp <= 0) {
          combatLogs.push(`[Victorie] Ai învins pe ${player.name}!`);
          break;
        }
      }
    }

    // Determine result and rewards
    const result = currentOpponentHp <= 0 ? 'victory' : currentPlayerHp <= 0 ? 'defeat' : 'impartial';
    const playerHpLost = playerHp - currentPlayerHp;
    
    // Calculate rewards based on result
    const baseLevelDiff = player.level - characterData.level;
    const levelMultiplier = Math.max(0.5, 1 + baseLevelDiff * 0.02);
    
    let expGained = 0;
    let yangGained = 0;
    
    if (result === 'victory') {
      expGained = Math.round(player.level * 50 * levelMultiplier);
      yangGained = Math.round(player.level * 100 * levelMultiplier);
    }

    // Return the duel results to be used by the works system
    return {
      result,
      currentPlayerHp,
      playerHpLost,
      opponentHp,
      currentOpponentHp,
      combatLogs,
      expGained,
      yangGained,
      totalRounds
    };
  }, [characterData]);

  // Monitorizare jobs-uri pentru a detecta când se termină un duel
  useEffect(() => {
    // Pentru fiecare duel activ, verificăm dacă a dispărut din jobs
    const activeJobIds = new Set(jobs.map(job => job.mobName));
    const completedDuels = new Set<string>();
    
    // Identificăm duelurile finalizate (nu mai sunt în lista de jobs)
    activeDuels.forEach(duelId => {
      if (!activeJobIds.has(duelId)) {
        completedDuels.add(duelId);
      }
    });
    
    // Procesăm duelurile finalizate
    if (completedDuels.size > 0) {
      // Actualizăm lista de dueluri active
      const updatedDuels = new Set(activeDuels);
      completedDuels.forEach(duelId => {
        updatedDuels.delete(duelId);
      });
      setActiveDuels(updatedDuels);
    }
  }, [jobs, activeDuels]);

  const handleStartDuel = () => {
    if (!selectedPlayer) {
      setErrorMessage('Selectează un jucător pentru duel');
      return;
    }

    if (characterData.stamina.current < 50) {
      setErrorMessage('Nu ai suficientă stamină pentru duel');
      return;
    }

    if (characterData.hp.current === 0) {
      setErrorMessage('Nu poți lupta cu 0 HP!');
      return;
    }

    // Calculate distance and travel time
    const distance = calculateDistance(characterData.x, characterData.y, selectedPlayer.x, selectedPlayer.y);
    const travelTimeSeconds = calculateTravelTime(distance);
    
    // Store the opponent data as a JSON string to be retrieved later
    const opponentData = {
      name: selectedPlayer.name,
      race: selectedPlayer.race,
      level: selectedPlayer.level,
      attack: selectedPlayer.attack,
      defense: selectedPlayer.defense,
      hp: selectedPlayer.hp
    };
    
    // Creăm un ID unic pentru acest duel
    const duelId = `Duel cu ${selectedPlayer.name}`;
    
    // Add duel as a job - 15 second duration
    const duelDuration = 15;
    addJob({
      type: '15s',
      remainingTime: duelDuration,
      travelTime: travelTimeSeconds,
      isInProgress: false,
      mobName: duelId,
      mobImage: selectedPlayer.image,
      mobX: selectedPlayer.x,
      mobY: selectedPlayer.y,
      mobType: 'duel',
      mobLevel: selectedPlayer.level,
      mobHp: selectedPlayer.hp.max,
      mobAttack: selectedPlayer.attack,
      mobExp: 0,
      mobYang: 0,
      staminaCost: 50,
      duelOpponent: JSON.stringify(opponentData)
    }).then(success => {
      if (success) {
        // Update player stamina immediately
        updatePlayerStamina(characterData.stamina.current - 50);
        
        // Adăugăm duelul la lista de dueluri active
        setActiveDuels(prev => new Set(prev).add(duelId));
        
        // Calculăm timpul total până la finalizarea duelului (călătorie + durată duel)
        const totalDuelTimeMs = (travelTimeSeconds + duelDuration + 0.5) * 1000;
        
        // Setăm un timer pentru a simula duelul DOAR după finalizarea job-ului
        setTimeout(() => {
          // Verificăm dacă duelul este încă activ (s-ar putea să fi fost anulat)
          if (!activeDuels.has(duelId)) {
            return;
          }
          
          // When the duel completes, simulate the combat and create a report
          const duelResults = simulateDuel(selectedPlayer);
          
          // Update player's HP with the result
          const newHp = Math.max(0, duelResults.currentPlayerHp);
          updatePlayerHp(newHp);
          
          // Create report for duel
          const reportContent = duelResults.result === 'victory'
            ? `Ai câștigat duelul împotriva jucătorului ${selectedPlayer.name}!\n\n` +
              `Ai primit ${duelResults.expGained.toLocaleString()} experiență și ${duelResults.yangGained.toLocaleString()} yang.\n\n` +
              `Detalii luptă:\n` +
              `- Ai provocat ${(duelResults.opponentHp - duelResults.currentOpponentHp).toLocaleString()} damage\n` +
              `- Ai pierdut ${duelResults.playerHpLost.toLocaleString()} HP\n\n` +
              `Ultimele acțiuni:\n` +
              duelResults.combatLogs.slice(-3).join('\n')
            : `Ai pierdut duelul împotriva jucătorului ${selectedPlayer.name}!\n\n` +
              `Nu ai primit nicio recompensă.\n\n` +
              `Detalii luptă:\n` +
              `- Ai provocat ${(duelResults.opponentHp - duelResults.currentOpponentHp).toLocaleString()} damage\n` +
              `- Ai pierdut ${duelResults.playerHpLost.toLocaleString()} HP\n\n` +
              `Ultimele acțiuni:\n` +
              duelResults.combatLogs.slice(-3).join('\n');
          
          // Add report to database via API - folosim tipul 'duel' pentru a-l diferenția de cel generat de backend
          addReport({
            type: 'duel',
            subject: `Duel: ${selectedPlayer.name} vs ${characterData.name}`,
            content: reportContent,
            read: false,
            playerName: selectedPlayer.name,
            result: duelResults.result as 'victory' | 'defeat' | 'impartial',
            combatStats: {
              playerHpLost: duelResults.playerHpLost,
              damageDealt: duelResults.opponentHp - duelResults.currentOpponentHp,
              expGained: duelResults.expGained,
              yangGained: duelResults.yangGained,
              totalRounds: duelResults.totalRounds,
              remainingMobHp: duelResults.currentOpponentHp,
            },
          });
          
          // Eliminăm duelul din lista de dueluri active
          setActiveDuels(prev => {
            const updatedDuels = new Set(prev);
            updatedDuels.delete(duelId);
            return updatedDuels;
          });
        }, totalDuelTimeMs);
        
        onClose();
      } else {
        setErrorMessage('Nu poți avea mai mult de 3 munci active!');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-50 bg-metin-dark/95 border-2 border-metin-gold/40 rounded-lg shadow-lg w-[90vw] max-w-[500px] h-[80vh] max-h-[450px] sm:w-[500px] sm:h-[450px]"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={handleTouchStart}
    >
      <div
        className="header bg-gradient-to-r from-metin-brown to-metin-dark border-b border-metin-gold/40 px-4 py-2 flex justify-between items-center cursor-grab"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <h2 className="text-metin-gold font-bold text-lg sm:text-base">Duele</h2>
        <button
          onClick={onClose}
          className="text-metin-light/70 hover:text-metin-gold text-xl sm:text-lg transition-colors"
        >
          ×
        </button>
      </div>

      <div className="p-4 h-[calc(100%-44px)] flex flex-col">
        <div className="flex items-center mb-4 flex-col sm:flex-row">
          <h3 className="text-metin-gold text-lg sm:text-base">Jucători din apropiere</h3>
          <div className="ml-auto text-metin-light/70 text-sm sm:text-xs mt-2 sm:mt-0">
            Pagina {currentPage}/{totalPages}
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-900/50 border border-red-500/50 p-2 rounded-lg mb-4 text-center animate-pulse">
            <span className="text-red-400 text-sm sm:text-xs">{errorMessage}</span>
          </div>
        )}

        <div className="flex-grow overflow-y-auto mb-4 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-metin-light/50">
              <div className="animate-spin mr-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
                    stroke="#D4AF37"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              Se încarcă jucătorii...
            </div>
          ) : currentPlayers.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {currentPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`p-3 border ${
                    selectedPlayer?.id === player.id
                      ? 'border-metin-gold bg-metin-gold/10'
                      : 'border-metin-light/20 hover:border-metin-light/40'
                  } rounded-lg flex items-stretch transition-colors cursor-pointer`}
                  onClick={() => handlePlayerSelect(player)}
                >
                  <div className="relative w-12 h-12 sm:w-10 sm:h-10 mr-3 bg-metin-dark/70 rounded-md overflow-hidden">
                    <Image
                      src={player.image}
                      alt={player.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="text-metin-gold text-sm sm:text-xs">{player.name}</div>
                    <div className="flex items-center text-xs sm:text-[10px] text-metin-light/70 mt-1">
                      <span className="mr-2">Nivel {player.level}</span>
                      <span>{player.race}</span>
                    </div>
                    <div className="text-xs sm:text-[10px] text-metin-light/50 mt-1">
                      {Math.round(player.distance)} unități distanță (~
                      {formatTime(calculateTravelTime(player.distance))})
                    </div>
                  </div>
                  <button
                    className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center bg-metin-dark/80 border border-metin-gold/30 rounded-lg hover:bg-metin-red/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayerSelect(player);
                      handleStartDuel();
                    }}
                    title="Duel"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M18 3L21 6L10 17L6 13L18 3Z"
                        stroke="#D4AF37"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 21L3.4 18.4L5.5 16.2L9 19.5L6.8 21.6L3 21Z"
                        stroke="#D4AF37"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-metin-light/50 text-base sm:text-sm">
              Nu s-au găsit jucători în apropiere
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-md border ${
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
              className={`w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-md border ${
                currentPage === totalPages || totalPages === 0
                  ? 'border-metin-light/20 text-metin-light/30 cursor-not-allowed'
                  : 'border-metin-gold/30 text-metin-light hover:bg-metin-gold/20 hover:text-metin-gold'
              }`}
            >
              &gt;
            </button>
          </div>

          {selectedPlayer && (
            <div className="flex items-center flex-col sm:flex-row gap-2">
              <div className="text-metin-light/80 text-sm sm:text-xs text-center sm:text-left">
                <div>
                  Duel cu <span className="text-metin-gold">{selectedPlayer.name}</span>
                </div>
                <div className="text-xs">Cost: <span className="text-cyan-400">50 stamină</span></div>
              </div>
              <button
                onClick={handleStartDuel}
                className="px-4 py-2 bg-metin-red/30 border border-metin-gold/50 rounded-md text-metin-gold hover:bg-metin-red/40 transition-colors flex items-center text-sm sm:text-base"
                disabled={characterData.stamina.current < 50}
              >
                <svg
                  width="16"
                  height="16"
                  className="mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 3L21 6L10 17L6 13L18 3Z"
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 21L3.4 18.4L5.5 16.2L9 19.5L6.8 21.6L3 21Z"
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Duel 2h
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuelsPanel;