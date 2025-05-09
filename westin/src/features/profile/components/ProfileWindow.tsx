// src/features/profile/components/ProfileWindow.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProfileType } from '../../../types/profile';
import { EquipmentSlot } from '../../../types/inventory';
import { useAuth } from '../../../context/AuthContext';

interface ProfileWindowProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileType;
  equipment?: EquipmentSlot[];
  isEditable?: boolean;
  isRefreshing?: boolean;
}

const ProfileWindow: React.FC<ProfileWindowProps> = ({
  isOpen,
  onClose,
  profile,
  equipment = [],
  isEditable = true,
  isRefreshing = false
}) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [motto, setMotto] = useState(profile?.motto || "");
  const [tempMotto, setTempMotto] = useState("");
  const [savingMotto, setSavingMotto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (profile && profile.motto !== undefined && profile.motto !== motto) {
      setMotto(profile.motto);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  if (!isOpen || !profile) return null;

  const handleEditStart = () => {
    setTempMotto(motto);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempMotto("");
    setError(null);
  };

  const handleSaveMotto = async () => {
    if (!tempMotto.trim() || !currentUser?.characterId) {
      setIsEditing(false);
      return;
    }

    try {
      setSavingMotto(true);
      setError(null);
      
      // Trimite cererea pentru a actualiza motto-ul în backend
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/characters/${currentUser.characterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ motto: tempMotto.trim() })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      // Motto actualizat cu succes
      setMotto(tempMotto.trim());
      setIsEditing(false);
      setTempMotto("");
    } catch (err) {
      console.error("Error updating motto:", err);
      setError("Nu s-a putut actualiza motto-ul. Încearcă din nou.");
    } finally {
      setSavingMotto(false);
    }
  };

  // Verifică dacă un string este o imagine base64
  const isBase64Image = (str: string) => {
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

  // Creează imaginea caracterului
  const characterImagePath = profile ? `/Races/${profile.gender.toLowerCase()}/${profile.race.toLowerCase()}.png` : "";

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
          <div className="flex items-center">
            <h2 className="text-metin-gold text-lg sm:text-xl font-western">Profil Jucător</h2>
            {isRefreshing && (
              <div className="ml-3 w-4 h-4 border-2 border-metin-gold/30 border-t-metin-gold rounded-full animate-spin"></div>
            )}
          </div>
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
              {/* Centrarea imaginii caracterului */}
              <div className="col-start-2 col-end-5 row-start-1 row-end-4 relative flex items-center justify-center">
                <div className="relative w-[120px] h-[140px] sm:w-[180px] sm:h-[220px] overflow-hidden border-2 border-metin-gold/40 rounded-md bg-black/40">
                  {/* Background image */}
                  <div className="absolute inset-0 z-0">
                    {isBase64Image(profile.background) ? (
                      <img
                        src={getImageUrl(profile.background)}
                        alt="Character background"
                        className="object-cover opacity-40 w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full relative">
                        <Image
                          src={getImageUrl(profile.background)}
                          alt="Character background"
                          fill
                          className="object-cover opacity-40"
                          unoptimized={true}
                          onError={(e) => {
                            // Fallback to default background if image fails to load
                            const target = e.target as HTMLImageElement;
                            console.warn("Background image failed to load, using fallback", profile.background);
                            target.src = "/Backgrounds/western1.jpg";
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Character image */}
                  {characterImagePath && (
                    <Image
                      src={characterImagePath}
                      alt={`${profile.name} character`}
                      fill
                      className="object-contain z-10"
                    />
                  )}
                </div>
              </div>
              
              {/* Renderează echipamentul numai dacă există */}
              {equipment && equipment.length > 0 && equipment.map((slot) => (
                <div 
                  key={slot.id}
                  className={`${
                    slot.id === 'weapon' ? 'col-start-1 col-end-2 row-start-1 row-end-4' :
                    slot.id === 'armor' ? 'col-start-5 col-end-6 row-start-1 row-end-3' :
                    slot.id === 'shield' ? 'col-start-5 col-end-6 row-start-3 row-end-4' :
                    slot.id === 'boots' ? 'col-start-1 col-end-2 row-start-4 row-end-5' :
                    slot.id === 'necklace' ? 'col-start-2 col-end-3 row-start-4 row-end-5' :
                    slot.id === 'bracelet' ? 'col-start-3 col-end-4 row-start-4 row-end-5' :
                    slot.id === 'earrings' ? 'col-start-4 col-end-5 row-start-4 row-end-5' :
                    slot.id === 'helmet' ? 'col-start-5 col-end-6 row-start-4 row-end-5' : ''
                  } border border-metin-gold/30 bg-black/30 rounded-md overflow-hidden relative`}
                >
                  {slot.item && slot.item.imagePath && (
                    <>
                      {isBase64Image(slot.item.imagePath) ? (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
                          <img 
                            src={getImageUrl(slot.item.imagePath)}
                            alt={slot.item.name}
                            className="object-contain max-w-full max-h-full"
                          />
                        </div>
                      ) : (
                        <Image 
                          src={slot.item.imagePath} 
                          alt={slot.item.name}
                          width={slot.size === 'large' ? 60 : slot.size === 'medium' ? 40 : 30}
                          height={slot.size === 'large' ? 120 : slot.size === 'medium' ? 60 : 30}
                          className="object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
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
              
              {/* Afișează mesajul de eroare */}
              {error && (
                <div className="bg-red-500/20 text-red-400 p-2 rounded mb-2 text-sm">
                  {error}
                </div>
              )}
              
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
                      disabled={savingMotto}
                    >
                      Anulează
                    </button>
                    <button 
                      onClick={handleSaveMotto}
                      disabled={!tempMotto.trim() || savingMotto}
                      className={`px-3 py-1 sm:px-4 sm:py-2 rounded border border-metin-gold/50 transition-colors text-sm sm:text-base ${
                        tempMotto.trim() && !savingMotto
                          ? 'bg-metin-gold/20 text-metin-gold hover:bg-metin-gold/30'
                          : 'bg-metin-gold/10 text-metin-gold/50 cursor-not-allowed'
                      }`}
                    >
                      {savingMotto ? 'Se salvează...' : 'Salvează'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <p className="text-metin-light italic bg-black/40 p-2 sm:p-3 rounded-md min-h-[60px] sm:min-h-[80px] text-sm sm:text-base">
                    {motto ? <>{motto}</> : 
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