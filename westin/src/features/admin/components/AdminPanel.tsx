import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

interface Character {
  _id: string;
  name: string;
  level: number;
  race: string;
  gender: string;
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
    required: number;
  };
  money: {
    cash: number;
    bank: number;
  };
  attack: number;
  defense: number;
  duelsWon: number;
  duelsLost: number;
  motto: string;
  userId: string;
  isBanned?: boolean;
}

interface Mob {
  _id: string;
  name: string;
  x: number;
  y: number;
  type: string;
  level: number;
  hp: number;
  attack: number;
  exp: number;
  yang: number;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('players');
  const [players, setPlayers] = useState<Character[]>([]);
  const [mobs, setMobs] = useState<Mob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Character | null>(null);
  const [editingMob, setEditingMob] = useState<Mob | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<Character | Mob>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Utility function to format image source - keeping it for edit form
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatImageSrc = (imageData: string): string => {
    if (!imageData) return 'https://i.ibb.co/nQm2RHF/metin.png';
    
    try {
      // Check if it's a URL
      if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
        return imageData;
      }
      
      // Check if it's already a data URL
      if (imageData.startsWith('data:')) {
        return imageData;
      }
      
      // Check for binary data by looking for non-printable characters in the first few bytes
      if (/[^\x20-\x7E]/.test(imageData.substring(0, 20))) {
        // This is likely binary data incorrectly converted to a string
        return 'https://i.ibb.co/nQm2RHF/metin.png';
      }
      
      // Check if it looks like valid base64 content (most base64 strings are longer and have specific characters)
      const base64Regex = /^[A-Za-z0-9+/=]+$/;
      if (!base64Regex.test(imageData) || imageData.length < 20) {
        // Not valid base64 format
        return 'https://i.ibb.co/nQm2RHF/metin.png';
      }
      
      // It seems to be valid base64 content, add the data URL prefix
      return `data:image/png;base64,${imageData}`;
    } catch (error) {
      console.error('Error formatting image source:', error);
      return 'https://i.ibb.co/nQm2RHF/metin.png'; // Fallback to default image
    }
  };

  const tabs = [
    { id: 'players', label: 'Jucători' },
    { id: 'mobs', label: 'Mobi' }
  ];

  // Încarcă lista de jucători
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAllPlayers();
        setPlayers(data);
        setError(null);
      } catch (err) {
        setError('Nu s-au putut încărca datele jucătorilor.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'players') {
      fetchPlayers();
    }
  }, [activeTab]);
  
  // Încarcă lista de mobi
  useEffect(() => {
    const fetchMobs = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAllMobs();
        setMobs(data);
        setError(null);
      } catch (err) {
        setError('Nu s-au putut încărca datele mobilor.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'mobs') {
      fetchMobs();
    }
  }, [activeTab]);

  // Filtrează jucătorii în funcție de termenul de căutare
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.race.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filtrează mobii în funcție de termenul de căutare
  const filteredMobs = mobs.filter(mob => 
    mob.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mob.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gestionează începerea editării unui jucător
  const handleEditPlayer = (player: Character) => {
    setEditingPlayer(player);
    setEditedValues({});
  };

  // Gestionează anularea editării
  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setEditedValues({});
  };

  // Gestionează modificarea valorilor în timpul editării
  const handleInputChange = (field: string, value: string | number) => {
    setEditedValues(prev => {
      if (field === 'money.cash' || field === 'money.bank') {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Character] as object || {}),
            [child]: Number(value)
          }
        };
      } else if (field === 'hp.current' || field === 'hp.max' || 
                 field === 'stamina.current' || field === 'stamina.max' ||
                 field === 'experience.current' || field === 'experience.required') {
        const [parent, child] = field.split('.');
        
        // Pentru câmpurile de experiență, verificăm că valoarea este un număr pozitiv
        if (parent === 'experience') {
          const numValue = Number(value);
          if (isNaN(numValue) || numValue < 0) {
            return prev; // Nu actualizăm dacă valoarea nu este validă
          }
        }
        
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Character] as object || {}),
            [child]: Number(value)
          }
        };
      }
      return { ...prev, [field]: isNaN(Number(value)) ? value : Number(value) };
    });
  };

  // Salvează modificările jucătorului
  const handleSavePlayer = async () => {
    if (!editingPlayer) return;
    
    try {
      setLoading(true);
      
      // Creăm o copie a valorilor editate pentru a evita referințele
      const playerDataToUpdate = { ...editedValues };
      
      // Verificăm dacă avem valori de experiență și ne asigurăm că sunt complete
      if (playerDataToUpdate.experience) {
        // Dacă doar unul dintre câmpuri a fost modificat, adăugăm și celălalt
        if (playerDataToUpdate.experience.current !== undefined && 
            playerDataToUpdate.experience.required === undefined) {
          playerDataToUpdate.experience.required = editingPlayer.experience.required;
        }
        
        if (playerDataToUpdate.experience.required !== undefined && 
            playerDataToUpdate.experience.current === undefined) {
          playerDataToUpdate.experience.current = editingPlayer.experience.current;
        }
      }
      
      await adminService.updatePlayer(editingPlayer._id, playerDataToUpdate);
      
      // Actualizează lista de jucători cu valorile modificate
      setPlayers(players.map(player => 
        player._id === editingPlayer._id 
          ? { ...player, ...playerDataToUpdate } 
          : player
      ));
      
      setEditingPlayer(null);
      setEditedValues({});
      setError(null);
    } catch (err) {
      setError('Nu s-au putut salva modificările.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gestionează ban/unban jucător
  const handleToggleBan = async (playerId: string, currentBanStatus: boolean) => {
    try {
      setLoading(true);
      
      // Inversează statusul de ban
      const newBanStatus = !currentBanStatus;
      
      // Trimite cererea către server
      await adminService.toggleBanStatus(playerId, newBanStatus);
      
      // Actualizează lista de jucători cu noul status de ban
      setPlayers(players.map(player => 
        player._id === playerId 
          ? { ...player, isBanned: newBanStatus } 
          : player
      ));
      
      setError(null);
    } catch (err) {
      setError('Nu s-a putut actualiza statusul de ban al utilizatorului.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gestionează începerea editării unui mob
  const handleEditMob = (mob: Mob) => {
    setEditingMob(mob);
    setEditedValues({});
  };

  // Gestionează anularea editării mobului
  const handleCancelEditMob = () => {
    setEditingMob(null);
    setEditedValues({});
  };

  // Gestionează modificarea valorilor în timpul editării mobului
  const handleMobInputChange = (field: string, value: string | number) => {
    setEditedValues(prev => {
      return { ...prev, [field]: isNaN(Number(value)) ? value : Number(value) };
    });
  };

  // Salvează modificările mobului
  const handleSaveMob = async () => {
    if (!editingMob) return;
    
    try {
      setLoading(true);
      
      // Creăm o copie a valorilor editate pentru a evita referințele
      const mobDataToUpdate = { ...editedValues };
      
      await adminService.updateMob(editingMob._id, mobDataToUpdate);
      
      // Actualizează lista de mobi cu valorile modificate
      setMobs(mobs.map(mob => 
        mob._id === editingMob._id 
          ? { ...mob, ...mobDataToUpdate } 
          : mob
      ));
      
      setEditingMob(null);
      setEditedValues({});
      setError(null);
    } catch (err) {
      setError('Nu s-au putut salva modificările.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Gestionează ștergerea unui mob
  const handleDeleteMob = async (mobId: string) => {
    if (!confirm('Sigur doriți să ștergeți acest mob?')) return;
    
    try {
      setLoading(true);
      
      await adminService.deleteMob(mobId);
      
      // Elimină mobul șters din lista de mobi
      setMobs(mobs.filter(mob => mob._id !== mobId));
      
      setError(null);
    } catch (err) {
      setError('Nu s-a putut șterge mobul.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Gestionează crearea unui mob nou
  const handleCreateMob = async () => {
    // Base64 encoded transparent PNG as default image
    const defaultImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdwI2QHdOdAAAAABJRU5ErkJggg==';
    
    try {
      setLoading(true);
      
      const newMobData = {
        name: 'Mob nou',
        x: 0,
        y: 0,
        type: 'metin',
        level: 1,
        hp: 100,
        attack: 10,
        exp: 10,
        yang: 10,
        image: defaultImage // Using Base64 data directly
      };
      
      const createdMob = await adminService.createMob(newMobData);
      
      // Adaugă mobul nou în lista de mobi
      setMobs([...mobs, createdMob]);
      
      // Începe editarea mobului nou
      handleEditMob(createdMob);
      
      setError(null);
    } catch (err) {
      setError('Nu s-a putut crea mobul nou.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4">
      <div className="bg-metin-dark border-2 border-metin-gold/60 rounded-lg w-full h-full sm:w-11/12 sm:h-5/6 md:w-4/5 md:h-4/5 max-w-6xl overflow-hidden shadow-2xl">
        {/* Header */}
        <header className="bg-gradient-to-r from-metin-brown to-metin-brown/80 px-3 sm:px-6 py-3 flex justify-between items-center border-b border-metin-gold/40">
          <h2 className="text-xl sm:text-2xl font-bold text-metin-gold">Panou Administrare</h2>
          <button
            onClick={onClose}
            className="text-metin-light/80 hover:text-metin-light text-xl p-2"
            aria-label="Închide"
          >
            ✕
          </button>
        </header>

        {/* Main content - Flex column on mobile, row on larger screens */}
        <div className="flex flex-col md:flex-row h-[calc(100%-3.5rem)]">
          {/* Sidebar - Horizontal tabs on mobile, vertical on larger screens */}
          <div className="md:w-64 bg-metin-dark border-b md:border-b-0 md:border-r border-metin-gold/30 overflow-x-auto md:overflow-x-visible">
            <ul className="flex md:flex-col py-1 md:py-2">
              {tabs.map((tab) => (
                <li key={tab.id} className="px-1 py-1 md:px-2">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap w-full text-center md:text-left px-3 py-2 md:px-4 md:py-3 rounded-md text-sm sm:text-base ${
                      activeTab === tab.id
                        ? 'bg-metin-gold/20 text-metin-gold'
                        : 'text-metin-light/70 hover:bg-metin-gold/10 hover:text-metin-light'
                    }`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-metin-dark/90 p-3 sm:p-4 md:p-6 overflow-auto">
            {activeTab === 'players' && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-metin-gold mb-3 sm:mb-4">Gestionare Jucători</h3>
                
                {/* Căutare */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Caută după nume sau rasă..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 bg-metin-brown/30 border border-metin-gold/30 rounded-md text-metin-light"
                  />
                </div>
                
                {/* Mesaj de eroare */}
                {error && (
                  <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-md">
                    {error}
                  </div>
                )}
                
                {/* Indicator de încărcare */}
                {loading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-metin-gold"></div>
                  </div>
                )}
                
                {/* Lista de jucători */}
                {!loading && filteredPlayers.length === 0 && (
                  <p className="text-metin-light/70 text-center py-8">Nu s-au găsit jucători.</p>
                )}
                
                <div className="mt-4 space-y-4">
                  {!loading && filteredPlayers.map((player) => (
                    <div key={player._id} className="bg-metin-brown/30 rounded-md p-4 border border-metin-gold/20">
                      {editingPlayer && editingPlayer._id === player._id ? (
                        // Formular de editare
                        <div className="space-y-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-metin-gold">Editare Jucător</h4>
                            <div className="space-x-2">
                              <button 
                                onClick={handleSavePlayer}
                                className="text-xs bg-green-700/70 hover:bg-green-700 text-metin-light px-3 py-1 rounded"
                              >
                                Salvează
                              </button>
                              <button 
                                onClick={handleCancelEdit}
                                className="text-xs bg-metin-brown/50 hover:bg-metin-brown/70 text-metin-light px-3 py-1 rounded"
                              >
                                Anulează
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Nume</label>
                              <input
                                type="text"
                                value={editedValues.name !== undefined ? editedValues.name : player.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Nivel</label>
                              <input
                                type="number"
                                value={editedValues.level !== undefined ? editedValues.level : player.level}
                                onChange={(e) => handleInputChange('level', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Rasă</label>
                              <select
                                value={editedValues.race !== undefined ? editedValues.race : player.race}
                                onChange={(e) => handleInputChange('race', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              >
                                <option value="Warrior">Warrior</option>
                                <option value="Ninja">Ninja</option>
                                <option value="Sura">Sura</option>
                                <option value="Shaman">Shaman</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Gen</label>
                              <select
                                value={editedValues.gender !== undefined ? editedValues.gender : player.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              >
                                <option value="Masculin">Masculin</option>
                                <option value="Feminin">Feminin</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">HP Curent</label>
                              <input
                                type="number"
                                value={editedValues.hp?.current !== undefined ? editedValues.hp.current : player.hp.current}
                                onChange={(e) => handleInputChange('hp.current', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">HP Maxim</label>
                              <input
                                type="number"
                                value={editedValues.hp?.max !== undefined ? editedValues.hp.max : player.hp.max}
                                onChange={(e) => handleInputChange('hp.max', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Stamina Curentă</label>
                              <input
                                type="number"
                                value={editedValues.stamina?.current !== undefined ? editedValues.stamina.current : player.stamina.current}
                                onChange={(e) => handleInputChange('stamina.current', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Stamina Maximă</label>
                              <input
                                type="number"
                                value={editedValues.stamina?.max !== undefined ? editedValues.stamina.max : player.stamina.max}
                                onChange={(e) => handleInputChange('stamina.max', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Experiență Curentă</label>
                              <input
                                type="number"
                                value={editedValues.experience?.current !== undefined ? editedValues.experience.current : player.experience.current}
                                onChange={(e) => handleInputChange('experience.current', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Experiență Necesară</label>
                              <input
                                type="number"
                                value={editedValues.experience?.required !== undefined ? editedValues.experience.required : player.experience.required}
                                onChange={(e) => handleInputChange('experience.required', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Bani Cash</label>
                              <input
                                type="number"
                                value={editedValues.money?.cash !== undefined ? editedValues.money.cash : player.money.cash}
                                onChange={(e) => handleInputChange('money.cash', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Bani Bancă</label>
                              <input
                                type="number"
                                value={editedValues.money?.bank !== undefined ? editedValues.money.bank : player.money.bank}
                                onChange={(e) => handleInputChange('money.bank', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Atac</label>
                              <input
                                type="number"
                                value={editedValues.attack !== undefined ? editedValues.attack : player.attack}
                                onChange={(e) => handleInputChange('attack', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Apărare</label>
                              <input
                                type="number"
                                value={editedValues.defense !== undefined ? editedValues.defense : player.defense}
                                onChange={(e) => handleInputChange('defense', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Dueluri Câștigate</label>
                              <input
                                type="number"
                                value={editedValues.duelsWon !== undefined ? editedValues.duelsWon : player.duelsWon}
                                onChange={(e) => handleInputChange('duelsWon', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Dueluri Pierdute</label>
                              <input
                                type="number"
                                value={editedValues.duelsLost !== undefined ? editedValues.duelsLost : player.duelsLost}
                                onChange={(e) => handleInputChange('duelsLost', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div className="sm:col-span-2">
                              <label className="block text-xs text-metin-light/70 mb-1">Motto</label>
                              <input
                                type="text"
                                value={editedValues.motto !== undefined ? editedValues.motto : player.motto}
                                onChange={(e) => handleInputChange('motto', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Vizualizare jucător
                        <>
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-metin-gold/90">{player.name}</h4>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleToggleBan(player._id, player.isBanned || false)}
                                className={`text-xs ${player.isBanned ? 'bg-green-600/70 hover:bg-green-600' : 'bg-red-700/70 hover:bg-red-700'} text-metin-light px-2 py-1 rounded`}
                              >
                                {player.isBanned ? 'Debanează' : 'Banează'}
                              </button>
                              <button 
                                onClick={() => handleEditPlayer(player)}
                                className="text-xs bg-metin-gold/30 hover:bg-metin-gold/50 text-metin-light px-2 py-1 rounded"
                              >
                                Editează
                              </button>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm mt-2 text-metin-light/80">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-1">
                              <span>Nivel: {player.level}</span>
                              <span>Rasă: {player.race}</span>
                              <span>Gen: {player.gender}</span>
                              <span>Atac: {player.attack}</span>
                              <span>HP: {player.hp.current}/{player.hp.max}</span>
                              <span>Stamina: {player.stamina.current}/{player.stamina.max}</span>
                              <span>Apărare: {player.defense}</span>
                              <span>XP: {player.experience.current}/{player.experience.required}</span>
                              <span>Cash: {player.money.cash}</span>
                              <span>Bancă: {player.money.bank}</span>
                              <span>Dueluri W/L: {player.duelsWon}/{player.duelsLost}</span>
                              {player.motto && <span className="col-span-2">Motto: {player.motto}</span>}
                              {player.isBanned && (
                                <span className="text-red-400 font-semibold">
                                  Status: BANAT
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'mobs' && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-metin-gold mb-3 sm:mb-4">Gestionare Mobi</h3>
                
                <div className="flex justify-between items-center mb-4">
                  {/* Căutare */}
                  <div className="flex-1 mr-4">
                    <input
                      type="text"
                      placeholder="Caută după nume sau tip..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 bg-metin-brown/30 border border-metin-gold/30 rounded-md text-metin-light"
                    />
                  </div>
                  
                </div>
                
                {/* Mesaj de eroare */}
                {error && (
                  <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-md">
                    {error}
                  </div>
                )}
                
                {/* Indicator de încărcare */}
                {loading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-metin-gold"></div>
                  </div>
                )}
                
                {/* Lista de mobi */}
                {!loading && filteredMobs.length === 0 && (
                  <p className="text-metin-light/70 text-center py-8">Nu s-au găsit mobi.</p>
                )}
                
                <div className="mt-4 space-y-4">
                  {!loading && filteredMobs.map((mob) => (
                    <div key={mob._id} className="bg-metin-brown/30 rounded-md p-4 border border-metin-gold/20">
                      {editingMob && editingMob._id === mob._id ? (
                        // Formular de editare mob
                        <div className="space-y-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-metin-gold">Editare Mob</h4>
                            <div className="space-x-2">
                              <button 
                                onClick={handleSaveMob}
                                className="text-xs bg-green-700/70 hover:bg-green-700 text-metin-light px-3 py-1 rounded"
                              >
                                Salvează
                              </button>
                              <button 
                                onClick={handleCancelEditMob}
                                className="text-xs bg-metin-brown/50 hover:bg-metin-brown/70 text-metin-light px-3 py-1 rounded"
                              >
                                Anulează
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Nume</label>
                              <input
                                type="text"
                                value={editedValues.name !== undefined ? editedValues.name : mob.name}
                                onChange={(e) => handleMobInputChange('name', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Tip</label>
                              <select
                                value={editedValues.type !== undefined ? editedValues.type : mob.type}
                                onChange={(e) => handleMobInputChange('type', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              >
                                <option value="boss">Boss</option>
                                <option value="metin">Metin</option>
                                <option value="Oras">Oraș</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Coordonată X</label>
                              <input
                                type="number"
                                value={editedValues.x !== undefined ? editedValues.x : mob.x}
                                onChange={(e) => handleMobInputChange('x', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Coordonată Y</label>
                              <input
                                type="number"
                                value={editedValues.y !== undefined ? editedValues.y : mob.y}
                                onChange={(e) => handleMobInputChange('y', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Nivel</label>
                              <input
                                type="number"
                                value={editedValues.level !== undefined ? editedValues.level : mob.level}
                                onChange={(e) => handleMobInputChange('level', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">HP</label>
                              <input
                                type="number"
                                value={editedValues.hp !== undefined ? editedValues.hp : mob.hp}
                                onChange={(e) => handleMobInputChange('hp', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Atac</label>
                              <input
                                type="number"
                                value={editedValues.attack !== undefined ? editedValues.attack : mob.attack}
                                onChange={(e) => handleMobInputChange('attack', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Experiență</label>
                              <input
                                type="number"
                                value={editedValues.exp !== undefined ? editedValues.exp : mob.exp}
                                onChange={(e) => handleMobInputChange('exp', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-metin-light/70 mb-1">Yang</label>
                              <input
                                type="number"
                                value={editedValues.yang !== undefined ? editedValues.yang : mob.yang}
                                onChange={(e) => handleMobInputChange('yang', e.target.value)}
                                className="w-full p-2 bg-metin-brown/50 border border-metin-gold/30 rounded-md text-metin-light text-sm"
                              />
                            </div>
                          

                          </div>
                        </div>
                      ) : (
                        // Vizualizare mob
                        <>
                          <div className="flex justify-between items-center">
                            <h4 className="text-metin-gold font-medium text-lg">{mob.name}</h4>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleDeleteMob(mob._id)}
                                className="text-xs bg-red-700/70 hover:bg-red-700 text-metin-light px-2 py-1 rounded"
                              >
                                Șterge
                              </button>
                              <button 
                                onClick={() => handleEditMob(mob)}
                                className="text-xs bg-metin-gold/30 hover:bg-metin-gold/50 text-metin-light px-2 py-1 rounded"
                              >
                                Editează
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 bg-metin-brown/20 border border-metin-gold/20 rounded-md p-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                              <div className="flex flex-col">
                                <span className="text-metin-gold/80 text-xs">Tip</span>
                                <span className="text-metin-light/90">{mob.type}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-metin-gold/80 text-xs">Nivel</span>
                                <span className="text-metin-light/90">{mob.level}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-metin-gold/80 text-xs">HP</span>
                                <span className="text-metin-light/90">{mob.hp}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-metin-gold/80 text-xs">Atac</span>
                                <span className="text-metin-light/90">{mob.attack}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-metin-gold/80 text-xs">Experiență</span>
                                <span className="text-metin-light/90">{mob.exp}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-metin-gold/80 text-xs">Yang</span>
                                <span className="text-metin-light/90">{mob.yang}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-metin-gold/80 text-xs">Poziție</span>
                                <span className="text-metin-light/90">({mob.x}, {mob.y})</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 