import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTown } from '../components/TownContext';
import mockData from '../../../data/mock';
import { ItemType } from '../../../data/mock/market-items';

const GeneralMarket: React.FC = () => {
  const { isMarketOpen, setIsMarketOpen, characterData, setCharacterData } = useTown();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, ItemType[]>>({});
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [purchaseMessage, setPurchaseMessage] = useState<{message: string, isError: boolean} | null>(null);
  
  useEffect(() => {
    // Încarcă itemele și categoriile din mockData  
    const categories = mockData.market.itemsByCategory();
    const categoryNames = mockData.market.allCategories();
    
    setItemsByCategory(categories);
    setAllCategories(categoryNames);
    
    // Selectează prima categorie implicit
    if (categoryNames.length > 0 && !selectedCategory) {
      setSelectedCategory(categoryNames[0]);
    }
  }, [selectedCategory]);
  
  const handleClose = () => {
    setIsMarketOpen(false);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  const handleBuyItem = (item: ItemType) => {
    if (!characterData) return;
    
    // Verifică dacă utilizatorul are suficienți bani
    if (characterData.money.cash < item.price) {
      setPurchaseMessage({
        message: `Nu ai suficienți yang pentru a cumpăra acest item (${item.price})`,
        isError: true
      });
      
      // Ascunde mesajul după 3 secunde
      setTimeout(() => {
        setPurchaseMessage(null);
      }, 3000);
      
      return;
    }
    
    // Procesează cumpărarea (ar trebui să adaugi în inventar, dar pentru acum doar scădem banii)
    const newCash = characterData.money.cash - item.price;
    
    setCharacterData({
      ...characterData,
      money: {
        ...characterData.money,
        cash: newCash
      }
    });
    
    // Afișează mesaj de succes
    setPurchaseMessage({
      message: `Ai cumpărat cu succes ${item.name} pentru ${item.price} yang!`,
      isError: false
    });
    
    // Ascunde mesajul după 3 secunde
    setTimeout(() => {
      setPurchaseMessage(null);
    }, 3000);
  };
  
  if (!isMarketOpen) return null;
  
  // Filtrează itemele în funcție de categoria selectată
  const itemsToDisplay: ItemType[] = [];
  
  Object.entries(itemsByCategory).forEach(([category, items]) => {
    if (category.startsWith(selectedCategory)) {
      itemsToDisplay.push(...items);
    }
  });
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center overflow-hidden">
      <div className="relative w-11/12 max-w-6xl bg-metin-dark border-2 border-metin-gold/60 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-3 border-b border-metin-gold/40">
          <div className="flex items-center">
            <div className="w-14 h-14 mr-3 flex items-center justify-center">
              <Image 
                src="/npc/GeneralMarket.png" 
                alt="Magazin General" 
                width={40} 
                height={40}
                className="object-contain max-h-full"
                style={{ objectPosition: 'center center' }}
              />
            </div>
            <h2 className="text-xl text-metin-gold font-bold">Magazin General</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Categorii și informații despre jucător */}
        <div className="flex p-3">
          <div className="w-60 mr-3">
            <div className="bg-metin-dark/90 border border-metin-gold/30 rounded-lg p-2 mb-3">
              <h3 className="text-metin-gold font-semibold mb-1 text-sm">Yang disponibil</h3>
              <p className="text-white text-sm">{characterData?.money.cash.toLocaleString()} Yang</p>
            </div>
            
            <div className="bg-metin-dark/90 border border-metin-gold/30 rounded-lg p-2">
              <h3 className="text-metin-gold font-semibold mb-1 text-sm">Categorii</h3>
              <ul className="space-y-1 max-h-[40vh] overflow-y-auto">
                {allCategories.map((category) => (
                  <li key={category}>
                    <button
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-2 py-1 rounded-md transition-colors text-sm ${
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
            </div>
          </div>
          
          {/* Lista de iteme */}
          <div className="flex-1 bg-metin-dark/90 border border-metin-gold/30 rounded-lg p-2 overflow-auto" style={{ maxHeight: 'calc(90vh - 6rem)' }}>
            <h3 className="text-metin-gold font-semibold mb-2 text-sm pl-1">Iteme disponibile</h3>
            
            {/* Mesaj pentru cumpărare */}
            {purchaseMessage && (
              <div 
                className={`mb-2 p-2 rounded-lg ${
                  purchaseMessage.isError 
                    ? 'bg-red-900/60 border border-red-700' 
                    : 'bg-green-900/60 border border-green-700'
                }`}
              >
                <p className={`${purchaseMessage.isError ? 'text-red-400' : 'text-green-400'} text-xs`}>
                  {purchaseMessage.message}
                </p>
              </div>
            )}
            
            {/* Grid-ul de iteme */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {itemsToDisplay.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-metin-dark border border-metin-gold/20 rounded-lg p-2 hover:border-metin-gold/50 transition-all relative group"
                >
                  {/* Card interior cu layout fix */}
                  <div className="flex flex-col h-[130px]">
                    {/* Imagine item - secțiune fixă */}
                    <div className="h-[55px] flex items-center justify-center">
                      <Image 
                        src={item.imagePath} 
                        alt={item.name} 
                        width={32} 
                        height={32}
                        className="object-contain max-h-full max-w-full"
                      />
                    </div>
                    
                    {/* Nume item - truncat dacă e prea lung */}
                    <h4 className="text-metin-gold font-medium text-xs text-center line-clamp-1 mb-1" title={item.name}>
                      {item.name}
                    </h4>
                    
                    {/* Nivel */}
                    <div className="flex items-center justify-center">
                      <span className="text-yellow-400 text-xs">
                        Nivel: {item.level}
                      </span>
                    </div>
                    
                    {/* Preț și buton cumpără */}
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-yellow-500 text-xs">{item.price.toLocaleString()}</span>
                      <button
                        onClick={() => handleBuyItem(item)}
                        className="bg-metin-gold/20 hover:bg-metin-gold/40 text-metin-gold text-xs px-2 py-1 rounded transition-colors"
                        disabled={!characterData || !characterData.money || characterData.money.cash < item.price}
                      >
                        Cumpără
                      </button>
                    </div>
                  </div>
                  
                  {/* Tooltip pentru statistici - apare la hover */}
                  <div className="fixed left-1/2 bottom-0 mb-2 translate-y-full -translate-x-1/2 w-48 bg-black border border-metin-gold/30 rounded-md p-2 shadow-lg z-50 
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                    <div className="relative">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-black"></div>
                      <h5 className="text-metin-gold font-medium text-sm mb-1">{item.name}</h5>
                      <p className="text-yellow-400 text-xs mb-1">Nivel: {item.level}</p>
                      {item.stats && (
                        <ul className="text-xs space-y-0.5">
                          {item.stats.attack && (
                            <li className="text-orange-400">Atac: +{item.stats.attack}</li>
                          )}
                          {item.stats.defense && (
                            <li className="text-blue-400">Apărare: +{item.stats.defense}</li>
                          )}
                          {item.stats.health && (
                            <li className={item.stats.health > 0 ? "text-green-400" : "text-red-400"}>
                              HP: {item.stats.health > 0 ? '+' : ''}{item.stats.health}
                            </li>
                          )}
                          {item.stats.mana && (
                            <li className="text-purple-400">MP: +{item.stats.mana}</li>
                          )}
                          {item.stats.stamina && (
                            <li className="text-yellow-400">Stamină: +{item.stats.stamina}</li>
                          )}
                        </ul>
                      )}
                      <p className="text-yellow-500 text-xs mt-1">{item.price.toLocaleString()} Yang</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralMarket; 