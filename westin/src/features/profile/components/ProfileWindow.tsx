import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProfileType } from '../../../types/profile';
import { EquipmentSlot } from '../../../types/inventory';

interface ProfileWindowProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileType;
  equipment: EquipmentSlot[];
}

const ProfileWindow: React.FC<ProfileWindowProps> = ({
  isOpen,
  onClose,
  profile,
  equipment
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [motto, setMotto] = useState(profile.motto || "");
  const [tempMotto, setTempMotto] = useState("");

  // Reset the motto when the profile changes
  useEffect(() => {
    setMotto(profile.motto || "");
  }, [profile.motto]);
  
  if (!isOpen) return null;

  // Map each equipment item to its position in the grid
  const equipmentItems = {
    weapon: equipment.find(item => item.id === 'weapon')?.item,
    armor: equipment.find(item => item.id === 'armor')?.item,
    shield: equipment.find(item => item.id === 'shield')?.item,
    helmet: equipment.find(item => item.id === 'helmet')?.item,
    boots: equipment.find(item => item.id === 'boots')?.item,
    necklace: equipment.find(item => item.id === 'necklace')?.item, 
    bracelet: equipment.find(item => item.id === 'bracelet')?.item,
    earrings: equipment.find(item => item.id === 'earrings')?.item
  };

  const handleEditStart = () => {
    setTempMotto(motto); // Setăm tempMotto la valoarea curentă a motto
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempMotto(""); // Resetăm tempMotto
  };

  const handleSaveMotto = () => {
    if (tempMotto.trim()) {
      setMotto(tempMotto.trim()); // Salvăm motto-ul doar dacă nu este gol
    }
    setIsEditing(false);
    setTempMotto(""); // Resetăm tempMotto după salvare
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* Profile Window */}
      <div className="relative w-[800px] bg-metin-dark/95 border-2 border-metin-gold/60 rounded-lg shadow-2xl overflow-hidden transform scale-100 transition-all max-h-[90vh] flex flex-col">
        {/* Header with title and close button */}
        <div className="bg-gradient-to-r from-metin-gold/20 to-transparent border-b border-metin-gold/30 px-4 py-3 flex justify-between items-center">
          <h2 className="text-metin-gold text-xl font-western">Profil Jucător</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-metin-gold/50 flex items-center justify-center text-metin-gold hover:bg-metin-gold/20 transition-colors"
          >
            ×
          </button>
        </div>
        
        {/* Profile Content */}
        <div className="p-6 overflow-y-auto flex">
          {/* Left side - Character image and equipment */}
          <div className="flex flex-col items-center w-[350px]">
            {/* Equipment grid */}
            <div className="grid grid-cols-5 grid-rows-4 gap-1 w-[300px] h-[320px] mb-4 relative">
              {/* Weapon position (1) - Left column */}
              {equipmentItems.weapon && (
                <div className="col-start-1 col-end-2 row-start-1 row-end-4 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.weapon.imagePath} 
                    alt={equipmentItems.weapon.name}
                    width={60}
                    height={180}
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
              )}
              
              {/* Character image in the center (p) */}
              <div className="col-start-2 col-end-5 row-start-1 row-end-4 relative flex items-center justify-center">
                <div className="relative w-[180px] h-[220px] overflow-hidden border-2 border-metin-gold/40 rounded-md bg-black/40">
                  {/* Background image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={profile.background}
                      alt="Character background"
                      fill
                      className="object-cover opacity-40"
                    />
                  </div>
                  
                  {/* Character image */}
                  <Image
                    src={profile.image}
                    alt={`${profile.name} character`}
                    fill
                    className="object-contain z-10"
                  />
                </div>
              </div>
              
              {/* Armor position (7) - Right column */}
              {equipmentItems.armor && (
                <div className="col-start-5 col-end-6 row-start-1 row-end-3 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.armor.imagePath} 
                    alt={equipmentItems.armor.name}
                    width={60}
                    height={120}
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
              )}
              
              {/* Shield position (8) - Bottom right beside armor */}
              {equipmentItems.shield && (
                <div className="col-start-5 col-end-6 row-start-3 row-end-4 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.shield.imagePath} 
                    alt={equipmentItems.shield.name}
                    width={60}
                    height={60}
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
              )}
              
              {/* Bottom row items (2-6) */}
              {/* Boots (2) */}
              {equipmentItems.boots && (
                <div className="col-start-1 col-end-2 row-start-4 row-end-5 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.boots.imagePath} 
                    alt={equipmentItems.boots.name}
                    width={60}
                    height={60}
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
              )}
              
              {/* Necklace (3) */}
              {equipmentItems.necklace && (
                <div className="col-start-2 col-end-3 row-start-4 row-end-5 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.necklace.imagePath} 
                    alt={equipmentItems.necklace.name}
                    width={60}
                    height={60}
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
              )}
              
              {/* Bracelet (4) */}
              {equipmentItems.bracelet && (
                <div className="col-start-3 col-end-4 row-start-4 row-end-5 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.bracelet.imagePath} 
                    alt={equipmentItems.bracelet.name}
                    width={60}
                    height={60}
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
              )}
              
              {/* Earrings (5) */}
              {equipmentItems.earrings && (
                <div className="col-start-4 col-end-5 row-start-4 row-end-5 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.earrings.imagePath} 
                    alt={equipmentItems.earrings.name}
                    width={60}
                    height={60}
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
              )}
              
              {/* Helmet (6) */}
              {equipmentItems.helmet && (
                <div className="col-start-5 col-end-6 row-start-4 row-end-5 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.helmet.imagePath} 
                    alt={equipmentItems.helmet.name}
                    width={60}
                    height={60}
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
              )}
            </div>
            
            {/* Character class display */}
            <div className="text-center mt-2">
              <span className="text-metin-gold text-xl font-western">{profile.race}</span>
            </div>
          </div>
          
          {/* Right side - Player information */}
          <div className="flex-1 ml-8">
            <div className="bg-black/30 rounded-lg border border-metin-gold/30 p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-metin-gold/20 pb-1">
                    <span className="text-metin-light/70">Nume:</span>
                    <span className="text-metin-gold font-semibold">{profile.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-metin-gold/20 pb-1">
                    <span className="text-metin-light/70">Nivel:</span>
                    <span className="text-metin-gold font-semibold">{profile.level}</span>
                  </div>
                  <div className="flex justify-between border-b border-metin-gold/20 pb-1">
                    <span className="text-metin-light/70">Experiență:</span>
                    <span className="text-metin-gold font-semibold">
                      {profile.experience.current} ({profile.experience.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-metin-gold/20 pb-1">
                    <span className="text-metin-light/70">Dueluri câștigate:</span>
                    <span className="text-green-500 font-semibold">{profile.duelsWon}</span>
                  </div>
                  <div className="flex justify-between border-b border-metin-gold/20 pb-1">
                    <span className="text-metin-light/70">Dueluri pierdute:</span>
                    <span className="text-red-500 font-semibold">{profile.duelsLost}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Motto / Personal Text Section */}
            <div className="bg-black/30 rounded-lg border border-metin-gold/30 p-4 relative">
              <h3 className="text-metin-gold mb-2 font-western text-lg">Motto Personal</h3>
              
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={tempMotto}
                    onChange={(e) => setTempMotto(e.target.value)}
                    className="w-full bg-black/60 border border-metin-gold/30 rounded-md p-3 text-metin-light resize-none focus:outline-none focus:border-metin-gold/60 h-[100px]"
                    maxLength={200}
                    placeholder="Scrie ceva despre tine..."
                    autoFocus // Adăugăm autofocus pentru a facilita editarea
                  />
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={handleCancel}
                      className="px-4 py-2 rounded bg-black/50 text-metin-light border border-metin-gold/30 hover:bg-black/70 transition-colors"
                    >
                      Anulează
                    </button>
                    <button 
                      onClick={handleSaveMotto}
                      disabled={!tempMotto.trim()} // Dezactivăm butonul dacă textul este gol
                      className={`px-4 py-2 rounded border border-metin-gold/50 transition-colors ${
                        tempMotto.trim()
                          ? 'bg-metin-gold/20 text-metin-gold hover:bg-metin-gold/30'
                          : 'bg-metin-gold/10 text-metin-gold/50 cursor-not-allowed'
                      }`}
                    >
                      Salvează
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <p className="text-metin-light italic bg-black/40 p-3 rounded-md min-h-[80px]">
                    {motto ? <>“{motto}”</> : 
                    <span className="text-metin-light/50">Niciun motto adăugat încă. Apasă pe butonul de editare pentru a adăuga.</span>}
                  </p>
                  <button 
                    onClick={handleEditStart}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-metin-dark/80 border border-metin-gold/30 flex items-center justify-center text-metin-gold text-xs hover:bg-metin-gold/20 transition-colors"
                    title="Editează motto"
                  >
                    ✎
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileWindow;