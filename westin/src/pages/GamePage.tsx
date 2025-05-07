import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import mapImage from '../assets/images/westinmap.jpg';
import CharacterStatus from '../components/ui/CharacterStatus';
import BottomPanel from '../components/ui/BottomPanel';
import MoneyDisplay from '../components/ui/MoneyDisplay';
import { MobDetailsPanel } from '../features/mobs';
import { WorksProvider } from '../features/works';
import { ReportsProvider } from '../features/reports';
import { ChatProvider, ChatPanel } from '../features/chat';
import { TownProvider, TownButton, TownPanel } from '../features/town';
import { AdminPanel } from '../features/admin';
import { useAuth } from '../context/AuthContext';
import mockData from '../data/mock';
import { MobType } from '../types/mob';
import { CharacterType } from '../types/character';
import ChatNotificationIndicator from '../features/chat/components/ChatNotificationIndicator';
import { useChatContext } from '../features/chat/context/ChatContext';

// Separate component for chat features that need the ChatContext
const ChatFeatures = ({ isChatOpen, setIsChatOpen, characterId }: { 
  isChatOpen: boolean, 
  setIsChatOpen: (isOpen: boolean) => void,
  characterId: string
}) => {
  const { newMessageNotification } = useChatContext();
  
  return (
    <>
      {/* Floating notification for new messages when chat is closed */}
      {!isChatOpen && newMessageNotification.show && (
        <div className="absolute bottom-16 left-4 z-40 animate-bounce">
          <div 
            className="bg-metin-dark/90 border border-metin-gold text-metin-gold px-3 py-1.5 rounded-lg shadow-lg cursor-pointer flex items-center"
            onClick={() => setIsChatOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="flex flex-col">
              <span className="text-xs font-semibold">Mesaj nou de la {newMessageNotification.senderName}</span>
              <span className="text-xs text-metin-light truncate max-w-[200px]">Clic pentru a deschide</span>
            </div>
          </div>
        </div>
      )}
      
      {isChatOpen && (
        <ChatPanel
          characterId={characterId}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
      
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="absolute bottom-4 left-4 z-30 bg-metin-dark/90 hover:bg-metin-dark border border-metin-gold/50 text-metin-gold rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        title="Chat"
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          
          {!isChatOpen && (
            <ChatNotificationIndicator />
          )}
        </div>
      </button>
    </>
  );
};

const GamePage: React.FC = () => {
  const MAP_WIDTH = 2048;
  const MAP_HEIGHT = 2048;
  const { isAdmin, currentUser } = useAuth();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [animation, setAnimation] = useState<{ x: number; y: number; visible: boolean } | null>(null);
  const [isMobDetailsOpen, setIsMobDetailsOpen] = useState(false);
  const [selectedMob, setSelectedMob] = useState<MobType | null>(null);
  const [showSystemMessage, setShowSystemMessage] = useState(false);
  const [systemMessage, setSystemMessage] = useState('');
  const [characterData, setCharacterData] = useState<CharacterType>(mockData.character);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const MIN_SCALE = 1.0;
  const MAX_SCALE = 2.5;

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Immediate effect to load character data on mount
  useEffect(() => {
    if (currentUser?.characterId) {
      const loadInitialCharacterData = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          
          const response = await fetch(`http://localhost:5000/api/characters/${currentUser.characterId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) return;
          
          const data = await response.json();
          setCharacterData(prevData => ({
            ...prevData,
            name: data.name,
            race: data.race,
            gender: data.gender,
            motto: data.motto,
            duelsWon: data.duelsWon || 0,
            duelsLost: data.duelsLost || 0
          }));
        } catch (err) {
          console.error("Error loading initial character data:", err);
        }
      };
      
      loadInitialCharacterData();
    }
  }, [currentUser?.characterId]);

  // Function to fetch character data from the API
  const fetchCharacterData = useCallback(async () => {
    if (!currentUser?.characterId) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/characters/${currentUser.characterId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      
      // Update character data with the new data from the server
      // But preserve the local changes we've made (like position)
      setCharacterData(prevData => ({
        ...prevData,
        name: data.name,
        race: data.race,
        gender: data.gender,
        hp: data.hp,
        stamina: data.stamina,
        experience: data.experience,
        level: data.level,
        money: data.money,
        attack: data.attack,
        defense: data.defense,
        motto: data.motto,
        duelsWon: data.duelsWon || 0,
        duelsLost: data.duelsLost || 0
      }));
      
    } catch (err) {
      console.error("Error fetching character data:", err);
    }
  }, [currentUser?.characterId]);

  // Fetch character data initially and set up periodic refresh
  useEffect(() => {
    // Fetch immediately with higher priority
    fetchCharacterData();
    
    // Set up interval to refresh character data
    const refreshInterval = setInterval(() => {
      fetchCharacterData();
    }, 3000); // Refresh every 3 seconds
    
    return () => clearInterval(refreshInterval);
  }, [fetchCharacterData]);

  const updatePlayerHp = useCallback(async (newHp: number) => {
    if (!currentUser?.characterId) return;
    
    // Update local state immediately for UI responsiveness
    setCharacterData((prev) => {
      const updatedHp = Math.max(0, Math.min(prev.hp.max, newHp));
      
      if (updatedHp <= 0) {
        setSystemMessage('Ai pierdut toată viața! Folosește poțiuni pentru a te vindeca.');
        setShowSystemMessage(true);
        setTimeout(() => setShowSystemMessage(false), 5000);
        return { ...prev, hp: { ...prev.hp, current: 0 } };
      }
      
      return { ...prev, hp: { ...prev.hp, current: updatedHp } };
    });
    
    // Then update the server data
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      
      await fetch(`http://localhost:5000/api/characters/${currentUser.characterId}/hp`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hp: newHp })
      });
      
      // We don't need to update state again here as fetchCharacterData will do that
    } catch (err) {
      console.error("Error updating character HP:", err);
    }
  }, [currentUser?.characterId]);

  const updatePlayerStamina = useCallback(async (newStamina: number) => {
    if (!currentUser?.characterId) return;
    
    // Update local state immediately for UI responsiveness
    setCharacterData((prev) => {
      const updatedStamina = Math.max(0, Math.min(prev.stamina.max, newStamina));
      
      if (updatedStamina === 0) {
        setSystemMessage('Nu mai ai stamină! Odihnește-te pentru a o regenera.');
        setShowSystemMessage(true);
        setTimeout(() => setShowSystemMessage(false), 5000);
      } else if (updatedStamina <= 10 && prev.stamina.current > 10) {
        setSystemMessage('Stamina scăzută! Ai grijă cum o folosești.');
        setShowSystemMessage(true);
        setTimeout(() => setShowSystemMessage(false), 3000);
      }
      
      return { ...prev, stamina: { ...prev.stamina, current: updatedStamina } };
    });
    
    // Then update the server data
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      
      await fetch(`http://localhost:5000/api/characters/${currentUser.characterId}/stamina`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stamina: newStamina })
      });
      
      // We don't need to update state again here as fetchCharacterData will do that
    } catch (err) {
      console.error("Error updating character stamina:", err);
    }
  }, [currentUser?.characterId]);

  useEffect(() => {
    const staminaRegenInterval = setInterval(async () => {
      // Check if character has max stamina
      if (characterData.stamina.current < characterData.stamina.max) {
        // Update local state
        setCharacterData((prev) => ({
          ...prev,
          stamina: { 
            ...prev.stamina, 
            current: Math.min(prev.stamina.max, prev.stamina.current + 1) 
          },
        }));
        
        // Update server state
        if (currentUser?.characterId) {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              console.error("No authentication token found");
              return;
            }
            
            const newStamina = Math.min(
              characterData.stamina.max, 
              characterData.stamina.current + 1
            );
            
            await fetch(`http://localhost:5000/api/characters/${currentUser.characterId}/stamina`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ stamina: newStamina })
            });
          } catch (err) {
            console.error("Error updating character stamina during regeneration:", err);
          }
        }
      }
    }, 60000); // Regenerate 1 stamina every minute
    
    return () => clearInterval(staminaRegenInterval);
  }, [characterData.stamina, currentUser?.characterId]);

  const updateCharacterPosition = useCallback(async (newX: number, newY: number) => {
    // Update local state
    setCharacterData((prev) => ({ ...prev, x: newX, y: newY }));
    setAnimation({ x: newX, y: newY, visible: true });
    setTimeout(() => setAnimation(null), 1500);
    
    // Update server state
    if (currentUser?.characterId) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("No authentication token found");
          return;
        }
        
        await fetch(`http://localhost:5000/api/characters/${currentUser.characterId}/position`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ x: newX, y: newY })
        });
      } catch (err) {
        console.error("Error updating character position:", err);
      }
    }
  }, [currentUser?.characterId]);

  const findClosestMob = (characterX: number, characterY: number): MobType => {
    let closestMob = mockData.mobs[0];
    let minDistance = Infinity;
    mockData.mobs.forEach((mob) => {
      const distance = Math.sqrt(Math.pow(mob.x - characterX, 2) + Math.pow(mob.y - characterY, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestMob = mob;
      }
    });
    return closestMob;
  };

  const closestMob = findClosestMob(characterData.x, characterData.y);
  const characterImagePath = `/Races/${characterData.gender.toLowerCase()}/${characterData.race.toLowerCase()}.png`;

  // Helper function to update position with bounds
  const updatePosition = (newX: number, newY: number) => {
    const container = mapContainerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const scaledWidth = MAP_WIDTH * scale;
    const scaledHeight = MAP_HEIGHT * scale;

    const minX = containerWidth - scaledWidth;
    const minY = containerHeight - scaledHeight;
    const maxX = 0;
    const maxY = 0;

    const boundedX = Math.max(minX, Math.min(maxX, newX));
    const boundedY = Math.max(minY, Math.min(maxY, newY));

    setPosition({ x: boundedX, y: boundedY });
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    updatePosition(newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) setIsDragging(false);
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    updatePosition(newX, newY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom Handler (Mouse Wheel)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));

    if (newScale === scale) return;

    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const pointXOnImage = mouseX - position.x;
    const pointYOnImage = mouseY - position.y;
    const newPointXOnImage = pointXOnImage * (newScale / scale);
    const newPointYOnImage = pointYOnImage * (newScale / scale);
    const newX = mouseX - newPointXOnImage;
    const newY = mouseY - newPointYOnImage;

    const container = mapContainerRef.current;
    if (container) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const scaledWidth = MAP_WIDTH * newScale;
      const scaledHeight = MAP_HEIGHT * newScale;
      const minX = containerWidth - scaledWidth;
      const minY = containerHeight - scaledHeight;
      const maxX = 0;
      const maxY = 0;

      const boundedX = Math.max(minX, Math.min(maxX, newX));
      const boundedY = Math.max(minY, Math.min(maxY, newY));

      setPosition({ x: boundedX, y: boundedY });
      setScale(newScale);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setScale(1.0);
  }, []);

  const handleItemClick = (item: MobType) => {
    setSelectedMob(item);
    setIsMobDetailsOpen(true);
  };

  return (
    <ChatProvider characterId={currentUser?._id || ""}>
      <ReportsProvider>
        <WorksProvider
          characterPositionUpdater={updateCharacterPosition}
          characterStats={characterData}
          updatePlayerHp={updatePlayerHp}
          updatePlayerStamina={updatePlayerStamina}
        >
          <TownProvider characterData={characterData}>
            <div className="relative w-full h-screen overflow-hidden bg-black">
              <MoneyDisplay cash={characterData.money.cash} bank={characterData.money.bank} />
              <div
                ref={mapContainerRef}
                className="fixed inset-0 overflow-hidden bg-gray-900"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  zIndex: 0,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  overflow: 'hidden',
                  touchAction: 'none', // Prevents default touch behaviors like pinch-zoom or scroll
                }}
              >
                <CharacterStatus characterData={{
                  _id: currentUser?.characterId || '',
                  ...characterData,
                  userId: currentUser?._id || ''
                }} />
                <BottomPanel
                  playerRace={characterData.race}
                  characterData={characterData}
                  updatePlayerHp={updatePlayerHp}
                  updatePlayerStamina={updatePlayerStamina}
                />
                <MobDetailsPanel
                  isOpen={isMobDetailsOpen}
                  onClose={() => setIsMobDetailsOpen(false)}
                  selectedMob={selectedMob}
                  characterX={characterData.x}
                  characterY={characterData.y}
                />
                <div
                  className="absolute will-change-transform"
                  style={{
                    transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                    transformOrigin: '0 0',
                    transition: 'none',
                    width: `${MAP_WIDTH}px`,
                    height: `${MAP_HEIGHT}px`,
                    pointerEvents: 'none',
                  }}
                >
                  <div className="relative w-full h-full pointer-events-auto">
                    <img
                      src={mapImage.src}
                      alt="Harta jocului Westin"
                      width={MAP_WIDTH}
                      height={MAP_HEIGHT}
                      draggable="false"
                      className="select-none block"
                      style={{
                        imageRendering: 'crisp-edges',
                        width: '100%',
                        height: '100%',
                        objectFit: 'fill',
                      }}
                    />
                    <TownButton
                      mapWidth={MAP_WIDTH}
                      mapHeight={MAP_HEIGHT}
                      onOpenTown={() => {
                        if (isMobDetailsOpen) {
                          setIsMobDetailsOpen(false);
                          setSelectedMob(null);
                        }
                      }}
                    />
                    {mockData.mobs
                      .filter((item) => Math.sqrt(Math.pow(item.x - 1420, 2) + Math.pow(item.y - 1060, 2)) > 50)
                      .map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleItemClick(item)}
                          className="absolute rounded-full transition-all hover:bg-metin-gold/20"
                          style={{
                            width: '60px',
                            height: '60px',
                            left: `${(item.x / MAP_WIDTH) * 100}%`,
                            top: `${(item.y / MAP_HEIGHT) * 100}%`,
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'transparent',
                            border: 'none',
                            pointerEvents: 'auto',
                            zIndex: 20,
                          }}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-xs text-metin-gold/30">
                            {item.type === 'boss' ? '⚔️' : '🗿'}
                          </span>
                        </button>
                      ))}
                    {mockData.players.map((player, index) => (
                      <div
                        key={`player-${index}`}
                        className="absolute rounded-full bg-white border-2 border-blue-500"
                        style={{
                          width: '40px',
                          height: '40px',
                          left: `${((player.x - 40) / MAP_WIDTH) * 100}%`,
                          top: `${((player.y + 20) / MAP_HEIGHT) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          pointerEvents: 'none',
                          zIndex: 22,
                          overflow: 'hidden',
                        }}
                        title={player.name}
                      >
                        <Image src={player.image} alt={`${player.name} marker`} width={40} height={40} className="object-cover" />
                      </div>
                    ))}
                    <div
                      className="absolute rounded-full bg-white border-2 border-black"
                      style={{
                        width: '40px',
                        height: '40px',
                        left: `${((closestMob.x - 40) / MAP_WIDTH) * 100}%`,
                        top: `${((closestMob.y + 20) / MAP_HEIGHT) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 25,
                        overflow: 'hidden',
                      }}
                      title={characterData.name}
                    >
                      <Image
                        src={characterImagePath}
                        alt={`${characterData.name} marker`}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    {animation && (
                      <div
                        className="absolute rounded-full bg-metin-gold/10 animate-fade-pulse"
                        style={{
                          width: '65px',
                          height: '65px',
                          left: `${(animation.x / MAP_WIDTH) * 100}%`,
                          top: `${(animation.y / MAP_HEIGHT) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 30,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              {showSystemMessage && (
                <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-black/80 text-red-500 border border-red-700 px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
                  <div className="flex items-center">
                    <span className="mr-2 text-2xl">⚠️</span>
                    <span className="font-medium">{systemMessage}</span>
                  </div>
                </div>
              )}
              <ChatFeatures 
                isChatOpen={isChatOpen} 
                setIsChatOpen={setIsChatOpen}
                characterId={currentUser?._id || ""}
              />
              {isAdmin && (
                <button
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="absolute bottom-4 right-1/2 z-30 bg-purple-700/90 hover:bg-purple-800 border border-purple-500/50 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
                  title="Panou Admin"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                </button>
              )}
              <TownPanel />
              {isAdmin && isAdminPanelOpen && <AdminPanel onClose={() => setIsAdminPanelOpen(false)} />}
            </div>
          </TownProvider>
        </WorksProvider>
      </ReportsProvider>
    </ChatProvider>
  );
};

export default GamePage;