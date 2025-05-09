import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTown } from '../components/TownContext';
import { useAuth } from '../../../context/AuthContext';
import { itemService, characterService, inventoryService } from '../../../services/api';

interface ItemType {
  _id: string;
  name: string;
  type: string;
  category: string;
  raceRestriction?: string;
  requiredLevel: number;
  tier?: string;
  stats: Record<string, number>;
  description: string;
  image?: string;
  price: number;
  tradeable?: boolean;
  sellable?: boolean;
  dropRate?: number;
}

// Define proper market categories with Romanian names
const MARKET_CATEGORIES = {
  weapon: 'Arme',
  armor: 'Armuri',
  helmet: 'Coifuri',
  shield: 'Scuturi',
  earrings: 'Cercei',
  bracelet: 'Brățări',
  necklace: 'Coliere',
  boots: 'Papuci'
};

const RACE_RESTRICTED_TYPES = ['weapon', 'armor', 'helmet'];

const GeneralMarket: React.FC = () => {
  const { isMarketOpen, setIsMarketOpen } = useTown();
  const { currentCharacter } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [items, setItems] = useState<ItemType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [purchaseMessage, setPurchaseMessage] = useState<{ message: string, isError: boolean } | null>(null);
  
  // Fetch all items when the market opens
  useEffect(() => {
    if (!isMarketOpen || !currentCharacter) return;
    
    const fetchItems = async () => {
      setLoading(true);
      try {
        // Get player race
        const playerRace = currentCharacter.race;
        let allItems: ItemType[] = [];
        
        // Fetch items by type instead of combining them all at once
        // This helps us organize them better and avoid duplicates
        for (const [type, displayName] of Object.entries(MARKET_CATEGORIES)) {
          let typeItems: ItemType[] = [];
          
          // For race-restricted items (weapons, armors, helmets)
          if (RACE_RESTRICTED_TYPES.includes(type)) {
            // Get items for player's race
            const raceItems = await itemService.getItemsByFilter({ 
              type, 
              raceRestriction: playerRace 
            });
            
            typeItems = raceItems;
          } else {
            // For general items that don't have race restrictions
            const items = await itemService.getItemsByFilter({ 
              type, 
              raceRestriction: "" 
            });
            
            typeItems = items;
          }
          
          // Add type as category for display
          typeItems.forEach(item => {
            item.category = displayName;
          });
          
          allItems = [...allItems, ...typeItems];
        }
        
        // Create a map of unique categories with proper display names
        const uniqueCategories = Object.values(MARKET_CATEGORIES);
        
        setItems(allItems);
        setCategories(uniqueCategories);
        
        if (uniqueCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(uniqueCategories[0]);
        }
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Nu s-au putut încărca itemele. Încearcă din nou mai târziu.");
      } finally {
        setLoading(false);
      }
    };
    
    // Add a function to fetch player's current cash
    const fetchPlayerCash = async () => {
      try {
        if (!currentCharacter?._id) return;
        
        // Get the latest character data to have the current cash amount
        const characterData = await characterService.getCharacter(currentCharacter._id);
        setCashAmount(characterData.money.cash);
      } catch (err) {
        console.error("Error fetching player cash:", err);
      }
    };
    
    // Fetch both items and player cash when market opens
    fetchItems();
    fetchPlayerCash();
  }, [isMarketOpen, currentCharacter, selectedCategory]);

  // Add a useEffect to update cash amount when market is shown
  useEffect(() => {
    if (isMarketOpen && currentCharacter?._id) {
      // Fetch current cash amount
      const fetchPlayerCash = async () => {
        try {
          const characterData = await characterService.getCharacter(currentCharacter._id);
          setCashAmount(characterData.money.cash);
        } catch (err) {
          console.error("Error updating player cash:", err);
        }
      };
      
      fetchPlayerCash();
    }
  }, [isMarketOpen, currentCharacter]);

  const handleClose = () => {
    setIsMarketOpen(false);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleBuyItem = async (item: ItemType) => {
    if (!currentCharacter) return;
    
    // Check if player has enough money
    if (cashAmount < item.price) {
      setPurchaseMessage({
        message: `Nu ai suficienți yang pentru a cumpăra acest item (${item.price})`,
        isError: true,
      });
      setTimeout(() => setPurchaseMessage(null), 3000);
      return;
    }
    
    // Try to add item to inventory
    try {
      await inventoryService.addItem(currentCharacter._id, item._id);
      
      // Update player's money
      const newCash = cashAmount - item.price;
      await characterService.updateMoney(currentCharacter._id, { cash: newCash });
      
      // Update local state
      setCashAmount(newCash);
      
      // Show success message
      setPurchaseMessage({
        message: `Ai cumpărat cu succes ${item.name} pentru ${item.price} yang!`,
        isError: false,
      });
      setTimeout(() => setPurchaseMessage(null), 3000);
    } catch (err) {
      console.error("Error buying item:", err);
      setPurchaseMessage({
        message: "Nu s-a putut achiziționa itemul. Verifică spațiul din inventar.",
        isError: true,
      });
      setTimeout(() => setPurchaseMessage(null), 3000);
    }
  };

  if (!isMarketOpen) return null;

  // Filter items by the selected category
  const itemsToDisplay = items.filter(item => item.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="relative w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-6xl bg-metin-dark border-2 border-metin-gold/60 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-3 border-b border-metin-gold/40">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-14 sm:h-14 mr-2 sm:mr-3 flex items-center justify-center">
              <Image
                src="/npc/GeneralMarket.png"
                alt="Magazin General"
                width={32}
                height={32}
                className="object-contain max-h-full"
                style={{ objectPosition: 'center center' }}
              />
            </div>
            <h2 className="text-lg sm:text-xl text-metin-gold font-bold">Magazin General</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row p-3 gap-3">
          <div className="w-full sm:w-48 md:w-60">
            <div className="bg-metin-dark/90 border border-metin-gold/30 rounded-lg p-2 mb-3">
              <h3 className="text-metin-gold font-semibold mb-1 text-xs sm:text-sm">Yang disponibil</h3>
              <p className="text-white text-xs sm:text-sm">{cashAmount.toLocaleString()} Yang</p>
            </div>
            <div className="bg-metin-dark/90 border border-metin-gold/30 rounded-lg p-2">
              <h3 className="text-metin-gold font-semibold mb-1 text-xs sm:text-sm">Categorii</h3>
              {loading ? (
                <p className="text-gray-300 text-xs sm:text-sm">Se încarcă...</p>
              ) : error ? (
                <p className="text-red-400 text-xs sm:text-sm">{error}</p>
              ) : (
                <ul className="space-y-1 max-h-[30vh] sm:max-h-[40vh] overflow-y-auto">
                  {categories.map((category) => (
                    <li key={category}>
                      <button
                        onClick={() => handleCategoryChange(category)}
                        className={`w-full text-left px-2 py-1 rounded-md transition-colors text-xs sm:text-sm ${
                          selectedCategory === category
                            ? 'bg-metin-gold/20 text-metin-gold'
                            : 'text-gray-300 hover:bg-metin-gold/10'
                        }`}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex-1 bg-metin-dark/90 border border-metin-gold/30 rounded-lg p-2 overflow-auto" style={{ maxHeight: 'calc(90vh - 6rem)' }}>
            <h3 className="text-metin-gold font-semibold mb-2 text-xs sm:text-sm pl-1">Iteme disponibile</h3>
            {purchaseMessage && (
              <div
                className={`mb-2 p-2 rounded-lg ${
                  purchaseMessage.isError ? 'bg-red-900/60 border border-red-700' : 'bg-green-900/60 border border-green-700'
                }`}
              >
                <p className={`${purchaseMessage.isError ? 'text-red-400' : 'text-green-400'} text-xs sm:text-sm`}>
                  {purchaseMessage.message}
                </p>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-300">Se încarcă itemele...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-red-400">{error}</p>
              </div>
            ) : itemsToDisplay.length === 0 ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-300">Nu există iteme în această categorie</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {itemsToDisplay.map((item, index) => (
                  <div
                    key={`${item._id}-${index}`}
                    className="bg-metin-dark border border-metin-gold/20 rounded-lg p-2 hover:border-metin-gold/50 transition-all relative group"
                  >
                    <div className="flex flex-col h-[135px] sm:h-[150px]">
                      <div className="h-[50px] sm:h-[55px] flex items-center justify-center">
                        <Image
                          src={item.image ? `data:image/png;base64,${item.image}` : "/Items/placeholder.png"}
                          alt={item.name}
                          width={28}
                          height={28}
                          className="object-contain max-h-full max-w-full"
                        />
                      </div>
                      <h4
                        className="text-metin-gold font-medium text-[10px] sm:text-xs text-center min-h-[24px] sm:min-h-[28px] line-clamp-2 mb-1"
                        title={item.name}
                      >
                        {item.name}
                      </h4>
                      <div className="flex items-center justify-center">
                        <span className="text-yellow-400 text-[10px] sm:text-xs">Nivel: {item.requiredLevel}</span>
                      </div>
                      {item.raceRestriction && (
                        <div className="flex justify-center mt-1">
                          <span className="text-blue-300 text-[8px] sm:text-[10px]">
                            {item.raceRestriction}
                          </span>
                        </div>
                      )}
                      <div className="mt-auto flex justify-between items-center">
                        <span className="text-yellow-500 text-[10px] sm:text-xs">{item.price.toLocaleString()}</span>
                        <button
                          onClick={() => handleBuyItem(item)}
                          className="bg-metin-gold/20 hover:bg-metin-gold/40 text-metin-gold text-[10px] sm:text-xs px-2 py-1 rounded transition-colors"
                          disabled={cashAmount < item.price}
                        >
                          Cumpără
                        </button>
                      </div>
                    </div>
                    <div className="fixed left-1/2 bottom-0 mb-2 translate-y-full -translate-x-1/2 w-40 sm:w-48 bg-black border border-metin-gold/30 rounded-md p-2 shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                      <div className="relative">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-black"></div>
                        <h5 className="text-metin-gold font-medium text-xs sm:text-sm mb-1">{item.name}</h5>
                        <p className="text-yellow-400 text-[10px] sm:text-xs mb-1">Nivel: {item.requiredLevel}</p>
                        {item.raceRestriction && (
                          <p className="text-blue-300 text-[10px] sm:text-xs mb-1">Rasă: {item.raceRestriction}</p>
                        )}
                        {item.stats && (
                          <ul className="text-[10px] sm:text-xs space-y-0.5">
                            {Object.entries(item.stats).map(([statName, statValue]) => (
                              <li key={statName} className={getStatColor(statName)}>
                                {formatStatName(statName)}: {statValue > 0 ? '+' : ''}{statValue}
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className="text-gray-300 text-[8px] sm:text-[10px] mt-1">{item.description}</p>
                        <p className="text-yellow-500 text-[10px] sm:text-xs mt-1">{item.price.toLocaleString()} Yang</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to determine stat color
const getStatColor = (statName: string): string => {
  switch (statName.toLowerCase()) {
    case 'attack':
      return 'text-orange-400';
    case 'defense':
      return 'text-blue-400';
    case 'hp':
    case 'health':
      return 'text-green-400';
    case 'mana':
    case 'mp':
      return 'text-purple-400';
    case 'stamina':
      return 'text-yellow-400';
    case 'criticalhit':
      return 'text-red-400';
    case 'attackspeed':
      return 'text-cyan-400';
    default:
      return 'text-white';
  }
};

// Helper function to format stat names
const formatStatName = (statName: string): string => {
  switch (statName.toLowerCase()) {
    case 'criticalhit':
      return 'Critical Hit';
    case 'attackspeed':
      return 'Attack Speed';
    default:
      return statName.charAt(0).toUpperCase() + statName.slice(1);
  }
};

export default GeneralMarket;