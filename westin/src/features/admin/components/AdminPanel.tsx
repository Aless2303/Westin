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
}

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('players');
  const [players, setPlayers] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Character | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<Character>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  const tabs = [
    { id: 'players', label: 'Jucători' }
    //aici mai pot adauga daca vreau alte tabs exact in aceeasi maniera.
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

  // Filtrează jucătorii în funcție de termenul de căutare
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.race.toLowerCase().includes(searchTerm.toLowerCase())
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
                            <button 
                              onClick={() => handleEditPlayer(player)}
                              className="text-xs bg-metin-gold/30 hover:bg-metin-gold/50 text-metin-light px-2 py-1 rounded"
                            >
                              Editează
                            </button>
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