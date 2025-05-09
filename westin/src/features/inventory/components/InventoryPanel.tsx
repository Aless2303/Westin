import React, { useState, useRef, useEffect, useCallback } from 'react';
import CharacterEquipment from './CharacterEquipment';
import Backpack from './Backpack';
import { useAuth } from '../../../context/AuthContext';

// Interface for inventory items
interface InventoryItem {
  id: string;
  name: string;
  imagePath: string;
  type: 'weapon' | 'armor' | 'helmet' | 'shield' | 'earrings' | 'bracelet' | 'necklace' | 'boots' | 'consumable' | 'quest' | 'material';
  stackable: boolean;
  quantity?: number;
  stats?: {
    [key: string]: number;
  };
  description: string;
  requiredLevel: number;
}

// Interface for equipment slots
interface EquipmentSlot {
  id: string;
  name: string;
  item: InventoryItem | null;
  gridArea: string;
  size: 'small' | 'medium' | 'large';
}

interface InventoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  playerRace: string;
}

// Tipurile de echipament care pot fi filtrate
type EquipmentFilterType = 'weapon' | 'helmet' | 'armor' | 'shield' | 'earrings' | 'bracelet' | 'necklace' | 'boots' | null;

// Configurația butoanelor de filtrare cu iconițe
interface FilterButtonConfig {
  type: EquipmentFilterType;
  name: string;
  icon: string;
}

interface BackpackItem {
  _id: string;
  quantity: number;
  itemId: {
    _id: string;
    name: string;
    image?: string;
    type: 'weapon' | 'armor' | 'helmet' | 'shield' | 'earrings' | 'bracelet' | 'necklace' | 'boots' | 'consumable' | 'quest' | 'material';
    tradeable: boolean;
    stats?: {
      [key: string]: number;
    };
    description?: string;
    requiredLevel?: number;
  };
}

interface InventoryData {
  equippedItems: {
    [key: string]: {
      _id: string;
      name: string;
      image?: string;
      type: 'weapon' | 'armor' | 'helmet' | 'shield' | 'earrings' | 'bracelet' | 'necklace' | 'boots' | 'consumable' | 'quest' | 'material';
      tradeable?: boolean;
      stats?: {
        [key: string]: number;
      };
      description?: string;
      requiredLevel?: number;
    } | null;
  };
  backpack: BackpackItem[];
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ isOpen, onClose, playerRace }) => {
  const { currentUser, currentCharacter } = useAuth();
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtru pentru tipul de echipament (null înseamnă că se afișează toate)
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilterType>(null);

  // Configurația butoanelor de filtrare cu iconițe
  const filterButtons: FilterButtonConfig[] = [
    { type: 'weapon', name: 'Armă', icon: '⚔️' },
    { type: 'helmet', name: 'Coif', icon: '🪖' },
    { type: 'armor', name: 'Armură', icon: '🛡️' },
    { type: 'shield', name: 'Scut', icon: '🛡️' },
    { type: 'earrings', name: 'Cercei', icon: '💎' },
    { type: 'bracelet', name: 'Brățară', icon: '⚜️' },
    { type: 'necklace', name: 'Colier', icon: '📿' },
    { type: 'boots', name: 'Papuci', icon: '👢' },
  ];

  // State for equipment
  const [equipmentSlots, setEquipmentSlots] = useState<EquipmentSlot[]>([
    { id: 'weapon', name: 'Armă', item: null, gridArea: 'weapon', size: 'large' },
    { id: 'helmet', name: 'Coif', item: null, gridArea: 'helmet', size: 'medium' },
    { id: 'armor', name: 'Armură', item: null, gridArea: 'armor', size: 'large' },
    { id: 'shield', name: 'Scut', item: null, gridArea: 'shield', size: 'medium' },
    { id: 'earrings', name: 'Cercei', item: null, gridArea: 'earrings', size: 'small' },
    { id: 'bracelet', name: 'Brățară', item: null, gridArea: 'bracelet', size: 'small' },
    { id: 'necklace', name: 'Colier', item: null, gridArea: 'necklace', size: 'small' },
    { id: 'boots', name: 'Papuci', item: null, gridArea: 'boots', size: 'medium' },
  ]);

  // State for backpack with fixed slots per page
  const [slotsPerPage, setSlotsPerPage] = useState(20); // Valoare implicită: 20 slots
  const [backpackItems, setBackpackItems] = useState<(InventoryItem | null)[]>([]);

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
    if (!src) return '';
    if (src.startsWith('http') || src.startsWith('/')) return src;
    
    // Verificăm dacă e base64 fără header și adăugăm header-ul
    if (src.startsWith('iVBOR')) {
      return `data:image/png;base64,${src}`;
    }
    if (src.startsWith('/9j/')) {
      return `data:image/jpeg;base64,${src}`;
    }
    
    return src;
  };
  
  // Verifică dimensiunea ecranului doar pe partea de client
  useEffect(() => {
    // Verifică dacă suntem în browser
    if (typeof window !== 'undefined') {
      setSlotsPerPage(window.innerWidth < 640 ? 10 : 20); // 10 slots pe telefon, 20 pe laptop
      
      // Adaugă un listener pentru redimensionarea ferestrei
      const handleResize = () => {
        setSlotsPerPage(window.innerWidth < 640 ? 10 : 20);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Încarcă datele inventarului din backend
  useEffect(() => {
    if (!isOpen || !currentUser?.characterId) return;

    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("No authentication token found");
          setError("Eroare de autentificare");
          setLoading(false);
          return;
        }
        
        const response = await fetch(`http://localhost:5000/api/inventory/${currentUser.characterId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }
        
        const inventoryData: InventoryData = await response.json();
        
        // Procesează datele pentru echipament
        const slots = [...equipmentSlots];
        
        // Populează sloturile de echipament din datele de backend
        if (inventoryData.equippedItems) {
          const slotTypes = ['weapon', 'helmet', 'armor', 'shield', 'earrings', 'bracelet', 'necklace', 'boots'];
          
          slotTypes.forEach(slotType => {
            const itemData = inventoryData.equippedItems[slotType];
            if (itemData) {
              const slotIndex = slots.findIndex(slot => slot.id === slotType);
              if (slotIndex !== -1) {
                // Creează un InventoryItem din datele din backend
                const item: InventoryItem = {
                  id: itemData._id,
                  name: itemData.name,
                  imagePath: itemData.image || '',
                  type: itemData.type,
                  stackable: itemData.tradeable || false,
                  stats: itemData.stats || {},
                  description: itemData.description || '',
                  requiredLevel: itemData.requiredLevel || 1
                };
                slots[slotIndex].item = item;
              }
            }
          });
        }
        
        setEquipmentSlots(slots);
        
        // Procesează datele pentru rucsac
        const backpackArray: InventoryItem[] = [];
        
        if (inventoryData.backpack && inventoryData.backpack.length > 0) {
          inventoryData.backpack.forEach((backpackItem: BackpackItem) => {
            if (backpackItem.itemId) {
              const item: InventoryItem = {
                id: backpackItem.itemId._id,
                name: backpackItem.itemId.name,
                imagePath: backpackItem.itemId.image || '',
                type: backpackItem.itemId.type,
                stackable: backpackItem.itemId.tradeable || false,
                quantity: backpackItem.quantity || 1,
                stats: backpackItem.itemId.stats || {},
                description: backpackItem.itemId.description || '',
                requiredLevel: backpackItem.itemId.requiredLevel || 1
              };
              backpackArray.push(item);
            }
          });
        }
        
        setBackpackItems(backpackArray);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching inventory data:", err);
        setError("Eroare la încărcarea inventarului");
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, [isOpen, currentUser?.characterId]);
  
  // Toggle pentru filtru - apăsând pe același buton de filtru se anulează (null)
  const toggleFilter = (type: EquipmentFilterType) => {
    if (equipmentFilter === type) {
      setEquipmentFilter(null);
    } else {
      setEquipmentFilter(type);
    }
    setCurrentPage(1);
  };

  // Filtrăm itemele conform filtrului selectat
  const filteredBackpackItems = equipmentFilter 
    ? backpackItems.filter(item => item && item.type === equipmentFilter)
    : backpackItems;

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredBackpackItems.filter((item) => item !== null).length / slotsPerPage);

  // Handler to unequip an item (move from equipment to backpack)
  const handleUnequip = useCallback(async (slotId: string) => {
    if (!currentUser?.characterId) {
      setError("Nu puteți modifica inventarul fără a fi autentificat");
      return;
    }
    
    const slot = equipmentSlots.find((s) => s.id === slotId);
    if (!slot || !slot.item) return;
    
    const item = slot.item;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Eroare de autentificare");
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/inventory/${currentUser.characterId}/unequip`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemType: slotId })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      // Adaugă item-ul în rucsac
      setBackpackItems((prevItems) => [...prevItems, item]);
      
      // Elimină item-ul din echipament
      setEquipmentSlots((prevSlots) =>
        prevSlots.map((s) => (s.id === slotId ? { ...s, item: null } : s))
      );
    } catch (err) {
      console.error("Error unequipping item:", err);
      setError("Eroare la dezechiparea item-ului");
    }
  }, [equipmentSlots, currentUser?.characterId]);

  // Handler to equip an item (move from backpack to equipment)
  const handleEquip = useCallback(async (item: InventoryItem, index: number) => {
    if (!currentUser?.characterId) {
      setError("Nu puteți modifica inventarul fără a fi autentificat");
      return;
    }
    
    // Check if player level is high enough to equip the item
    if (currentCharacter && item.requiredLevel > currentCharacter.level) {
      setError(`Nu poți echipa acest item. Nivel necesar: ${item.requiredLevel}. Nivelul tău: ${currentCharacter.level}.`);
      // Set a timer to clear the error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
      return;
    }
    
    const slot = equipmentSlots.find((s) => s.id === item.type);
    if (!slot) {
      console.log(`Itemul de tip ${item.type} nu poate fi echipat!`);
      return;
    }
    
    let actualItemIndex = -1;
    
    // If we're using a filter, we need to find the actual index of the item in the full backpack
    if (equipmentFilter) {
      // Get only items of the filtered type
      const filteredItems = backpackItems.filter(item => item && item.type === equipmentFilter);
      if (index < filteredItems.length) {
        // Get the selected item's id
        const selectedItemId = filteredItems[index]?.id;
        // Find the index of this item in the full backpack array
        actualItemIndex = backpackItems.findIndex(item => item && item.id === selectedItemId);
      }
    } else {
      // If no filter, use pagination to calculate the actual index
      const startIdx = (currentPage - 1) * slotsPerPage;
      actualItemIndex = startIdx + index;
    }
    
    // Safety check - make sure we have a valid index
    if (actualItemIndex === -1 || actualItemIndex >= backpackItems.length) {
      console.error("Invalid item index", { actualItemIndex, backpackLength: backpackItems.length });
      setError("Eroare la determinarea poziției item-ului în inventar");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Eroare de autentificare");
        return;
      }
      
      // Get the actual item from the backpack
      const backpackItemData = backpackItems[actualItemIndex];
      if (!backpackItemData) {
        console.error("Item not found at index", actualItemIndex);
        setError("Item-ul nu a fost găsit în inventar");
        return;
      }
      
      // Log for debugging
      console.log("Equipping item:", { 
        itemId: backpackItemData.id, 
        slot: actualItemIndex,
        name: backpackItemData.name,
        type: backpackItemData.type
      });
      
      const response = await fetch(`http://localhost:5000/api/inventory/${currentUser.characterId}/equip`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          itemId: backpackItemData.id,
          slot: actualItemIndex
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Eroare la echiparea item-ului' }));
        throw new Error(errorData.message);
      }
      
      const equippedItem = slot.item;
      
      // Actualizăm sloturile de echipament
      setEquipmentSlots((prevSlots) =>
        prevSlots.map((s) => (s.id === item.type ? { ...s, item } : s))
      );
      
      // Actualizăm rucsacul
      setBackpackItems((prevItems) => {
        const newItems = [...prevItems];
        newItems[actualItemIndex] = null;
        const compactedItems = newItems.filter(item => item !== null) as InventoryItem[];
        if (equippedItem) {
          compactedItems.push(equippedItem);
        }
        return compactedItems;
      });
    } catch (err) {
      console.error("Error equipping item:", err);
      
      // Show error message without closing inventory
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Eroare la echiparea item-ului");
      }
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  }, [equipmentSlots, backpackItems, currentPage, equipmentFilter, slotsPerPage, currentUser?.characterId, currentCharacter]);

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (panelRef.current?.querySelector('.header')?.contains(e.target as Node)) {
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
  }, [isDragging, dragStart]);

  if (!isOpen) return null;

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const startIndex = (currentPage - 1) * slotsPerPage;
  const currentPageItems = filteredBackpackItems.slice(startIndex, startIndex + slotsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div 
      className="fixed inset-0 sm:inset-auto flex items-center justify-center sm:justify-start bg-black/50 sm:bg-transparent z-50"
      onClick={stopPropagation}
    >
      <div
        ref={panelRef}
        className="bg-metin-dark/95 border-2 border-metin-gold/40 rounded-lg shadow-lg w-[95%] sm:w-[750px] max-h-[90vh] sm:max-h-none overflow-y-auto sm:overflow-y-hidden"
        style={{
          ...(typeof window !== 'undefined' && window.innerWidth >= 640 ? {
            position: 'absolute',
            top: `${position.y}px`,
            left: `${position.x}px`,
            height: '500px',
            cursor: isDragging ? 'grabbing' : 'auto',
          } : {
            position: 'relative',
            height: 'auto',
          })
        }}
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
      >
        <div 
          className="header bg-gradient-to-r from-metin-brown to-metin-dark border-b border-metin-gold/40 px-3 sm:px-4 py-2 flex justify-between items-center sm:cursor-grab cursor-default sticky top-0 z-10"
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-metin-gold font-bold text-base sm:text-lg">Inventar</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-metin-light/70 hover:text-metin-gold text-xl sm:text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-metin-gold text-sm">Se încarcă inventarul...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500 text-sm">{error}</div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row h-auto sm:h-[calc(100%-48px)]">
            <div className="w-full sm:w-1/2 sm:pr-3 mb-3 sm:mb-0">
              <h3 className="text-metin-gold border-b border-metin-gold/30 pb-1 mb-2 sm:mb-3 text-base sm:text-lg">
                Echipament
              </h3>
              <CharacterEquipment
                playerRace={playerRace}
                equipmentSlots={equipmentSlots}
                onUnequip={handleUnequip}
                isBase64Image={isBase64Image}
                getImageUrl={getImageUrl}
              />
            </div>

            <div className="w-full sm:w-1/2 sm:pl-3 sm:border-l border-t sm:border-t-0 border-metin-gold/30 pt-3 sm:pt-0 flex flex-col">
              <h3 className="text-metin-gold border-b border-metin-gold/30 pb-1 mb-2 sm:mb-3 text-base sm:text-lg">
                Ghiozdan
              </h3>
              
              <div className="mb-2 grid grid-cols-4 gap-1">
                {filterButtons.map(button => (
                  <button
                    key={button.type}
                    onClick={() => toggleFilter(button.type)}
                    className={`h-8 flex flex-col items-center justify-center rounded border transition-colors ${
                      equipmentFilter === button.type
                        ? 'bg-metin-gold/20 border-metin-gold text-metin-gold'
                        : 'border-metin-gold/30 text-metin-light/70 hover:border-metin-gold/50 hover:text-metin-light bg-black/40'
                    }`}
                    title={button.name}
                  >
                    <span className="text-lg">{button.icon}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex-grow">
                <Backpack
                  backpackItems={currentPageItems}
                  onEquip={handleEquip}
                  isBase64Image={isBase64Image}
                  getImageUrl={getImageUrl}
                />
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-2 mb-1 text-sm">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-1 rounded transition-colors ${
                      currentPage === 1
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-metin-gold hover:text-metin-light'
                    }`}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-1 rounded transition-colors ${
                        currentPage === page
                          ? 'bg-metin-gold text-metin-dark'
                        : 'text-metin-light hover:bg-metin-brown hover:text-metin-gold'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-1 rounded transition-colors ${
                      currentPage === totalPages
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-metin-gold hover:text-metin-light'
                    }`}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;