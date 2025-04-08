import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProfileType } from '../../../types/profile';
import { EquipmentSlot } from '../../../types/inventory';

interface ProfileWindowProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileType;
  equipment: EquipmentSlot[];
  isEditable?: boolean;
}

const ProfileWindow: React.FC<ProfileWindowProps> = ({
  isOpen,
  onClose,
  profile,
  equipment,
  isEditable = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [motto, setMotto] = useState(profile.motto || "");
  const [tempMotto, setTempMotto] = useState("");

  useEffect(() => {
    setMotto(profile.motto || "");
  }, [profile.motto]);
  
  if (!isOpen) return null;

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
    setTempMotto(motto);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempMotto("");
  };

  const handleSaveMotto = () => {
    if (tempMotto.trim()) {
      setMotto(tempMotto.trim());
    }
    setIsEditing(false);
    setTempMotto("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* Profile Window */}
      <div className="relative w-[90vw] sm:w-[800px] bg-metin-dark/95 border-2 border-metin-gold/60 rounded-lg shadow-2xl overflow-hidden transform scale-100 transition-all max-h-[90vh] flex flex-col">
        {/* Header with title and close button */}
        <div className="bg-gradient-to-r from-metin-gold/20 to-transparent border-b border-metin-gold/30 px-4 py-3 flex justify-between items-center">
          <h2 className="text-metin-gold text-lg sm:text-xl font-western">Profil Jucător</h2>
          <button 
            onClick={onClose}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-metin-gold/50 flex items-center justify-center text-metin-gold hover:bg-metin-gold/20 transition-colors"
          >
            ×
          </button>
        </div>
        
        {/* Profile Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col sm:flex-row">
          {/* Left side - Character image and equipment */}
          <div className="flex flex-col items-center w-full sm:w-[350px]">
            {/* Equipment grid */}
            <div className="grid grid-cols-5 grid-rows-4 gap-1 w-[70vw] sm:w-[300px] h-[200px] sm:h-[320px] mb-4 relative">
              {/* Weapon position (1) - Left column */}
              {equipmentItems.weapon && (
                <div className="col-start-1 col-end-2 row-start-1 row-end-4 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.weapon.imagePath} 
                    alt={equipmentItems.weapon.name}
                    width={40} // Redus pe telefon
                    height={120} // Redus pe telefon
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:w-[60px] sm:h-[180px]"
                  />
                </div>
              )}
              
              {/* Character image in the center (p) */}
              <div className="col-start-2 col-end-5 row-start-1 row-end-4 relative flex items-center justify-center">
                <div className="relative w-[120px] h-[140px] sm:w-[180px] sm:h-[220px] overflow-hidden border-2 border-metin-gold/40 rounded-md bg-black/40">
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
                    width={40} // Redus pe telefon
                    height={80} // Redus pe telefon
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:w-[60px] sm:h-[120px]"
                  />
                </div>
              )}
              
              {/* Shield position (8) - Bottom right beside armor */}
              {equipmentItems.shield && (
                <div className="col-start-5 col-end-6 row-start-3 row-end-4 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.shield.imagePath} 
                    alt={equipmentItems.shield.name}
                    width={40} // Redus pe telefon
                    height={40} // Redus pe telefon
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:w-[60px] sm:h-[60px]"
                  />
                </div>
              )}
              
              {/* Bottom row items (2-6) */}
              {equipmentItems.boots && (
                <div className="col-start-1 col-end-2 row-start-4 row-end-5 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.boots.imagePath} 
                    alt={equipmentItems.boots.name}
                    width={40} // Redus pe telefon
                    height={40} // Redus pe telefon
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:w-[60px] sm:h-[60px]"
                  />
                </div>
              )}
              
              {equipmentItems.necklace && (
                <div className="col-start-2 col-end-3 row-start-4 row-end-5 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.necklace.imagePath} 
                    alt={equipmentItems.necklace.name}
                    width={40} // Redus pe telefon
                    height={40} // Redus pe telefon
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:w-[60px] sm:h-[60px]"
                  />
                </div>
              )}
              
              {equipmentItems.bracelet && (
                <div className="col-start-3 col-end-4 row-start-4 row-end-5 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.bracelet.imagePath} 
                    alt={equipmentItems.bracelet.name}
                    width={40} // Redus pe telefon
                    height={40} // Redus pe telefon
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:w-[60px] sm:h-[60px]"
                  />
                </div>
              )}
              
              {equipmentItems.earrings && (
                <div className="col-start-4 col-end-5 row-start-4 row-end-5 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.earrings.imagePath} 
                    alt={equipmentItems.earrings.name}
                    width={40} // Redus pe telefon
                    height={40} // Redus pe telefon
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:w-[60px] sm:h-[60px]"
                  />
                </div>
              )}
              
              {equipmentItems.helmet && (
                <div className="col-start-5 col-end-6 row-start-4 row-end-5 border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative">
                  <Image 
                    src={equipmentItems.helmet.imagePath} 
                    alt={equipmentItems.helmet.name}
                    width={40} // Redus pe telefon
                    height={40} // Redus pe telefon
                    className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:w-[60px] sm:h-[60px]"
                  />
                </div>
              )}
            </div>
            
            {/* Character class display */}
            <div className="text-center mt-2">
              <span className="text-metin-gold text-lg sm:text-xl font-western">{profile.race}</span>
            </div>
          </div>
          
          {/* Right side - Player information */}
          <div className="flex-1 mt-4 sm:mt-0 sm:ml-8">
            <div className="bg-black/30 rounded-lg border border-metin-gold/30 p-4 mb-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-metin-gold/20 pb-1">
                    <span className="text-metin-light/70 text-sm sm:text-base">Nume:</span>
                    <span className="text-metin-gold font-semibold text-sm sm:text-base">{profile.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-metin-gold/20 pb-1">
                    <span className="text-metin-light/70 text-sm sm:text-base">Nivel:</span>
                    <span className="text-metin-gold font-semibold text-sm sm:text-base">{profile.level}</span>
                  </div>
                  <div className="flex justify-between border-b border-metin-gold/20 pb-1">
                    <span className="text-metin-light/70 text-sm sm:text-base">Experiență:</span>
                    <span className="text-metin-gold font-semibold text-sm sm:text-base">
                      {profile.experience.current} ({profile.experience.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-metin-gold/20 pb-1">
                    <span className="text-metin-light/70 text-sm sm:text-base">Dueluri câștigate:</span>
                    <span className="text-green-500 font-semibold text-sm sm:text-base">{profile.duelsWon || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-metin-gold/20 pb-1">
                    <span className="text-metin-light/70 text-sm sm:text-base">Dueluri pierdute:</span>
                    <span className="text-red-500 font-semibold text-sm sm:text-base">{profile.duelsLost || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Motto / Personal Text Section */}
            <div className="bg-black/30 rounded-lg border border-metin-gold/30 p-4 relative">
              <h3 className="text-metin-gold mb-2 font-western text-base sm:text-lg">Motto Personal</h3>
              
              {isEditing && isEditable ? (
                <div className="space-y-3">
                  <textarea
                    value={tempMotto}
                    onChange={(e) => setTempMotto(e.target.value)}
                    className="w-full bg-black/60 border border-metin-gold/30 rounded-md p-2 sm:p-3 text-metin-light text-sm sm:text-base resize-none focus:outline-none focus:border-metin-gold/60 h-[80px] sm:h-[100px]"
                    maxLength={200}
                    placeholder="Scrie ceva despre tine..."
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={handleCancel}
                      className="px-3 py-1 sm:px-4 sm:py-2 rounded bg-black/50 text-metin-light border border-metin-gold/30 hover:bg-black/70 transition-colors text-sm sm:text-base"
                    >
                      Anulează
                    </button>
                    <button 
                      onClick={handleSaveMotto}
                      disabled={!tempMotto.trim()}
                      className={`px-3 py-1 sm:px-4 sm:py-2 rounded border border-metin-gold/50 transition-colors text-sm sm:text-base ${
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
                  <p className="text-metin-light italic bg-black/40 p-2 sm:p-3 rounded-md min-h-[60px] sm:min-h-[80px] text-sm sm:text-base">
                    {motto ? <>“{motto}”</> : 
                    <span className="text-metin-light/50">
                      {isEditable ? "Niciun motto adăugat încă. Apasă pe butonul de editare pentru a adăuga." : "Acest jucător nu are un motto setat."}
                    </span>}
                  </p>
                  {isEditable && (
                    <button 
                      onClick={handleEditStart}
                      className="absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-metin-dark/80 border border-metin-gold/30 flex items-center justify-center text-metin-gold text-[10px] sm:text-xs hover:bg-metin-gold/20 transition-colors"
                      title="Editează motto"
                    >
                      ✎
                    </button>
                  )}
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