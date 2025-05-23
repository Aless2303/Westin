// src/components/ui/CharacterStatus.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Leaderboard } from '../../features/leaderboard';
import { ProfileWindow } from '../../features/profile';
import { EquipmentSlot, InventoryItem } from '../../types/inventory';
import { useAuth } from '../../context/AuthContext';

// Define Character type to fix the any
interface Character {
  _id?: string;
  name: string;
  level: number;
  race: string;
  gender: string;
  background: string;
  image?: string; // Adăugat pentru compatibilitate cu ProfileType
  hp: {
    current: number;
    max: number;
  };
  stamina: {
    current: number;
    max: number;
  };
  experience: {
    current: number;
    percentage: number;
  };
  money: {
    cash: number;
    bank: number;
  };
  x?: number;
  y?: number;
  attack?: number;
  defense?: number;
  duelsWon?: number;
  duelsLost?: number;
  motto?: string;
  userId?: string;
}

interface CharacterStatusProps {
  characterData?: Character | null;
}

const CharacterStatus: React.FC<CharacterStatusProps> = ({ characterData: propCharacterData }) => {
  const { currentUser } = useAuth();
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [characterData, setCharacterData] = useState<Character | null>(null);
  const [characterEquipment, setCharacterEquipment] = useState<EquipmentSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingProfile, setRefreshingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update internal state when prop changes
  useEffect(() => {
    if (propCharacterData) {
      setCharacterData(propCharacterData);
      setLoading(false);
      setError(null);
    }
  }, [propCharacterData]);

  // Fetch character data function
  const fetchCharacterData = useCallback(async () => {
    // Only fetch if no character data was provided via props
    if (propCharacterData) {
      return propCharacterData;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Obține token-ul salvat în localStorage
      const token = localStorage.getItem('token');
      
      if (!currentUser?.characterId || !token) {
        setError("Nu s-a găsit ID-ul caracterului");
        setLoading(false);
        return null;
      }
      
      // Fă cererea către backend cu token-ul de autentificare
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
      setCharacterData(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching character data:", err);
      setError("Nu s-a putut încărca personajul");
      setLoading(false);
      return null;
    }
  }, [currentUser, propCharacterData]);

  // Initial fetch of character data on component mount, only if not provided via props
  useEffect(() => {
    if (!propCharacterData) {
      fetchCharacterData();
    }
  }, [fetchCharacterData, propCharacterData]);

  // Fetch inventory and equipped items
  useEffect(() => {
    if (!characterData?._id) return;
    
    // Initial load of inventory data
    fetchInventory();
  }, [characterData]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setIsPanelVisible(false);
      } else {
        setIsPanelVisible(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const toggleLeaderboard = () => {
    setIsLeaderboardOpen(!isLeaderboardOpen);
  };

  // Fetch inventory data function
  const fetchInventory = useCallback(async () => {
    if (!characterData?._id) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/inventory/${characterData._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      const inventoryData = await response.json();
      
      // Create equipment slots based on equipped items
      const equipment: EquipmentSlot[] = [
        { id: 'weapon', name: 'Armă', item: null, gridArea: 'weapon', size: 'large' },
        { id: 'helmet', name: 'Coif', item: null, gridArea: 'helmet', size: 'medium' },
        { id: 'armor', name: 'Armură', item: null, gridArea: 'armor', size: 'large' },
        { id: 'shield', name: 'Scut', item: null, gridArea: 'shield', size: 'medium' },
        { id: 'earrings', name: 'Cercei', item: null, gridArea: 'earrings', size: 'small' },
        { id: 'bracelet', name: 'Brățară', item: null, gridArea: 'bracelet', size: 'small' },
        { id: 'necklace', name: 'Colier', item: null, gridArea: 'necklace', size: 'small' },
        { id: 'boots', name: 'Papuci', item: null, gridArea: 'boots', size: 'medium' },
      ];
      
      // Map equipped items from inventory to equipment slots
      if (inventoryData.equippedItems) {
        // Get all slot types
        const slotTypes = ['weapon', 'helmet', 'armor', 'shield', 'earrings', 'bracelet', 'necklace', 'boots'];
        
        slotTypes.forEach(slotType => {
          // The backend now returns the full item object directly in equippedItems
          const itemData = inventoryData.equippedItems[slotType];
          if (itemData) {
            const slot = equipment.find(slot => slot.id === slotType);
            if (slot) {
              // Create InventoryItem from the item data
              const item: InventoryItem = {
                id: itemData._id,
                name: itemData.name,
                // Tratează imaginea în format base64
                imagePath: itemData.image || '', 
                type: itemData.type,
                stackable: itemData.tradeable || false,
                stats: itemData.stats || {},
                description: itemData.description || '',
                requiredLevel: itemData.requiredLevel || 1
              };
              slot.item = item;
            }
          }
        });
      }
      
      setCharacterEquipment(equipment);
      console.log("Inventory data refreshed for profile");
    } catch (err) {
      console.error("Error fetching inventory data:", err);
    }
  }, [characterData]);

  const toggleProfile = async () => {
    if (!isProfileOpen) {
      // If we're opening the profile, refresh all character data first
      setRefreshingProfile(true);
      try {
        // First refresh the character data to get updated stats
        const updatedChar = await fetchCharacterData();
        
        if (updatedChar) {
          // Then refresh the inventory with the updated character
          await fetchInventory();
        }
        
        setIsProfileOpen(true);
      } catch (error) {
        console.error("Error refreshing profile data:", error);
      } finally {
        setRefreshingProfile(false);
      }
    } else {
      setIsProfileOpen(false);
    }
  };

  // Verifică dacă un string este o imagine base64
  const isBase64Image = (str: string) => {
    if (!str) return false;
    return typeof str === 'string' && (
      str.startsWith('data:image') || 
      str.startsWith('iVBOR') || // PNG în base64
      str.startsWith('/9j/') // JPEG în base64
    );
  };

  // Funcție auxiliară pentru a genera URL-ul corect pentru imagini
  const getImageUrl = (src: string) => {
    if (!src) return '/Backgrounds/western1.jpg'; // Default fallback
    
    // Handle already formatted data URLs
    if (src.startsWith('data:image')) return src;
    
    // Handle absolute URLs or paths starting with /
    if (src.startsWith('http') || src.startsWith('/')) {
      // If it's a relative path to the Backgrounds folder but doesn't have the full path
      if (src.includes('western') && !src.startsWith('/Backgrounds/')) {
        return `/Backgrounds/${src}`;
      }
      return src;
    }
    
    // Handle base64 without headers
    if (src.startsWith('iVBOR')) {
      return `data:image/png;base64,${src}`;
    }
    if (src.startsWith('/9j/')) {
      return `data:image/jpeg;base64,${src}`;
    }
    
    // If it's just a filename for a background, add the proper path
    if (src.includes('western')) {
      return `/Backgrounds/${src}`;
    }
    
    return src;
  };

  // Afișare stare de încărcare inițială
  if (loading && !refreshingProfile) {
    return (
      <div className="absolute top-3 left-3 z-50">
        <div className="w-56 bg-metin-dark/95 border border-metin-gold/40 rounded-lg p-4 flex items-center justify-center">
          <div className="text-metin-gold">Se încarcă personajul...</div>
        </div>
      </div>
    );
  }

  // Afișare eroare
  if (error || !characterData) {
    return (
      <div className="absolute top-3 left-3 z-50">
        <div className="w-56 bg-metin-dark/95 border border-red-500/40 rounded-lg p-4">
          <div className="text-red-500">{error || "Eroare la încărcarea personajului"}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-metin-gold text-sm underline"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  // Calculăm procentajele pentru barele de progres
  const hpPercentage = Math.min(100, Math.max(0, (characterData.hp.current / characterData.hp.max) * 100));
  const staminaPercentage = Math.min(100, Math.max(0, (characterData.stamina.current / characterData.stamina.max) * 100));
  const expPercentage = Math.min(100, Math.max(0, characterData.experience.percentage));

  // Construim calea către imaginea caracterului
  const characterImagePath = `/Races/${characterData.gender.toLowerCase()}/${characterData.race.toLowerCase()}.png`;

  return (
    <div className="absolute top-3 left-3 z-50">
      {isPanelVisible ? (
        <div className="w-56 sm:w-56 md:w-56 lg:w-56 xl:w-56 relative max-w-[90vw] sm:max-w-none mx-auto sm:mx-0">
          <div className="absolute -top-2 right-9 w-9 h-9 rounded-full bg-metin-gold/20 animate-pulse-slow z-10"></div>
          
          <button 
            onClick={togglePanel}
            className="absolute -top-2 -right-2 w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full bg-metin-dark border border-metin-gold/50 flex items-center justify-center text-metin-gold text-xs hover:bg-metin-gold/20 transition-colors z-30"
            title="Ascunde panoul"
          >
            ×
          </button>

          <button 
            onClick={toggleLeaderboard}
            className="absolute -top-2 right-8 w-8 h-8 rounded-full bg-metin-dark border border-metin-gold/50 flex items-center justify-center text-metin-gold text-xs hover:bg-metin-gold/30 transition-colors z-20 overflow-hidden shadow-md"
            title="Deschide Leaderboard"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-metin-gold/30 to-transparent opacity-50"></div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 relative z-10">
              <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 0019.5 18.75h-1.5a.75.75 0 000 1.5h1.5a5.25 5.25 0 01-5.25 5.25h-3a5.25 5.25 0 01-5.25-5.25v-.75a.75.75 0 011.5 0v.75a3.75 3.75 0 003.75 3.75h3a3.75 3.75 0 003.75-3.75V18a.75.75 0 00-.75-.75h-7.5a.75.75 0 00-.75.75v1.5a.75.75 0 01-1.5 0V18a.75.75 0 00-.75-.75H2.25a.75.75 0 010-1.5H4.5a.75.75 0 00.75-.75v-1.5a.75.75 0 011.5 0v1.5a.75.75 0 00.75.75h7.5a.75.75 0 00.75-.75v-1.5a.75.75 0 011.5 0v1.5a.75.75 0 00.75.75h2.25a.75.75 0 010 1.5H18a.75.75 0 00-.75.75v.774a1.75 1.75 0 01-1.75 1.75h-6a1.75 1.75 0 01-1.75-1.75v-.774a.75.75 0 00-.75-.75H4.5a.75.75 0 00-.75.75v.774a1.75 1.75 0 01-1.75 1.75h-.583c-.827 0-1.5-.673-1.5-1.5V18.75c0-.492.239-.952.642-1.229a61.31 61.31 0 016.557-3.426A6.713 6.713 0 013.174 7.744a.75.75 0 01.584-.859c1.012-.212 2.036-.394 3.068-.542V4.5a.75.75 0 01.75-.75H4.5a.75.75 0 010-1.5h3.751a.75.75 0 01.75.75v3.123c1.012.148 2.036.33 3.068.542a.75.75 0 01.584.859 6.713 6.713 0 01-4.008 6.322 61.303 61.303 0 016.557 3.426c.403.277.642.737.642 1.229v2.309c0 .827-.673 1.5-1.5 1.5h-.583a1.75 1.75 0 01-1.75-1.75v-.774a.75.75 0 00-.75-.75H9a.75.75 0 01-.75-.75v-1.5a.75.75 0 01.75-.75h5.834a4.75 4.75 0 10-9.179-1.7c-.223.409-.729.626-1.19.429a30.78 30.78 0 00-4.968-1.645c-.452-.128-.685-.552-.603-1.013a6.753 6.753 0 014.453-5.157 30.736 30.736 0 002.922-.8 29.596 29.596 0 002.443-.892A.75.75 0 019 6.75V2.625c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V6.75c0 .266-.145.513-.389.644-.952.406-1.894.761-2.443.892a29.51 29.51 0 01-2.925.8 6.753 6.753 0 01-4.428 5.134 32.25 32.25 0 014.533 1.5A6.75 6.75 0 0119.5 18V10.2a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v7.8a5.25 5.25 0 01-2.759 4.632 58.756 58.756 0 00-5.467-2.994.75.75 0 01.585-1.379c.642.273 1.347.578 2.101.922V10.2a.75.75 0 011.5 0v6.75c0 .218-.043.417-.121.596 1.272.516 2.342.978 3.05 1.294a3.75 3.75 0 001.564-3.839 61.207 61.207 0 00-2.345-.444.75.75 0 01.33-1.465c.65.146 1.292.306 1.926.479a5.24 5.24 0 01-2.14 3.049v2.178c0 .827-.673 1.5-1.5 1.5h-.583a1.75 1.75 0 01-1.75-1.75v-.774a.75.75 0 00-.75-.75h-3.75a.75.75 0 010-1.5zm9.085-4.127v2.876a58.88 58.88 0 00-3.362-1.49 6.75 6.75 0 003.362-1.386z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="bg-metin-dark/95 backdrop-blur-sm border border-metin-gold/40 rounded-lg overflow-hidden shadow-lg">
            <div className="relative h-20 sm:h-20 flex items-center">
              <button 
                onClick={toggleProfile}
                className="ml-3 w-16 h-16 sm:w-16 sm:h-16 rounded-full border-2 border-metin-gold/60 bg-black/80 overflow-hidden relative hover:border-metin-gold hover:shadow-gold transition-all"
                title="Deschide profilul"
              >
                <div className="absolute inset-0 z-0">
                  {isBase64Image(characterData.background) ? (
                    <img
                      src={getImageUrl(characterData.background)}
                      alt="Character background"
                      className="w-full h-full object-cover opacity-40"
                    />
                  ) : (
                    <div className="w-full h-full relative">
                      <Image
                        src={getImageUrl(characterData.background)}
                        alt="Character background"
                        fill
                        className="object-cover opacity-40"
                        unoptimized={true}
                        onError={(e) => {
                          // Fallback to default background if image fails to load
                          const target = e.target as HTMLImageElement;
                          console.warn("Background image failed to load, using fallback", characterData.background);
                          target.src = "/Backgrounds/western1.jpg";
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-metin-gold/20 to-transparent opacity-0 hover:opacity-60 transition-opacity z-20"></div>
                <Image
                  src={characterImagePath}
                  alt={`${characterData.name} character`}
                  fill
                  className="object-cover object-top z-10"
                />
              </button>
              
              <div className="ml-3 text-metin-light flex-1">
                <div className="font-semibold text-metin-gold truncate max-w-[120px] sm:max-w-[120px]">{characterData.name}</div>
                <div className="flex items-center mt-1">
                  <div className="w-6 h-6 flex items-center justify-center bg-metin-gold/20 rounded-full border border-metin-gold/50 text-metin-gold text-xs font-bold">
                    {characterData.level}
                  </div>
                  <div className="ml-2 text-xs text-metin-light/70">{characterData.race}</div>
                </div>
              </div>
            </div>

            <div className="p-3 pt-1 sm:p-3 sm:pt-1">
              <div className="mb-2">
                <div className="flex justify-between text-xs text-metin-light/80 mb-1">
                  <span>HP</span>
                  <span>{characterData.hp.current} / {characterData.hp.max}</span>
                </div>
                <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-metin-gold/30">
                  <div 
                    className="h-full bg-gradient-to-r from-red-900 to-red-600 rounded-full"
                    style={{ width: `${hpPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-xs text-metin-light/80 mb-1">
                  <span>Stamina</span>
                  <span>{characterData.stamina.current} / {characterData.stamina.max}</span>
                </div>
                <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-metin-gold/30">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-900 to-blue-600 rounded-full"
                    style={{ width: `${staminaPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-metin-light/80 mb-1">
                  <span>Experience</span>
                  <span>{characterData.experience.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-metin-gold/30">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-700 to-yellow-500 rounded-full"
                    style={{ width: `${expPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={togglePanel}
          className="w-8 h-8 rounded-full bg-metin-dark/95 border border-metin-gold/40 flex items-center justify-center text-metin-gold hover:bg-metin-gold/20 transition-colors shadow-lg"
          title="Afișează informații caracter"
        >
          <span className="text-xl">⚔</span>
        </button>
      )}

      <Leaderboard 
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
        refreshInterval={30000}
      />

      <ProfileWindow
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={{
          _id: characterData?._id || '',
          name: characterData?.name || '',
          level: characterData?.level || 1,
          race: characterData?.race || '',
          gender: characterData?.gender || '',
          background: getImageUrl(characterData?.background || '/Backgrounds/western1.jpg'),
          hp: characterData?.hp || { current: 0, max: 0 },
          stamina: characterData?.stamina || { current: 0, max: 0 },
          experience: characterData?.experience || { current: 0, percentage: 0 },
          duelsWon: characterData?.duelsWon || 0,
          duelsLost: characterData?.duelsLost || 0,
          motto: characterData?.motto || ''
        }}
        equipment={characterEquipment}
        isEditable={true}
        isRefreshing={refreshingProfile}
      />
    </div>
  );
};

export default CharacterStatus;