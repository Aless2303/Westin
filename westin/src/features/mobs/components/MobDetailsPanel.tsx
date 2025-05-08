import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { MobType } from '../types';
import { useWorks } from '../../works/context/WorksContext';

interface MobDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMob: MobType | null;
  characterX: number;
  characterY: number;
}

const MobDetailsPanel: React.FC<MobDetailsPanelProps> = ({ 
  isOpen, 
  onClose, 
  selectedMob,
  characterX,
  characterY
}) => {
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const { addJob, characterPosition, jobs, characterStats } = useWorks();
  
  const [travelTimeText, setTravelTimeText] = useState("00:00");
  const [travelTimeFromLastJobText, setTravelTimeFromLastJobText] = useState("00:00");
  
  // Check if we're on mobile/small screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const calculateTravelTimeSeconds = (charX: number, charY: number, mobX: number, mobY: number): number => {
    const distance = Math.sqrt(Math.pow(mobX - charX, 2) + Math.pow(mobY - charY, 2));
    const tolerance = 1;

    if (distance <= tolerance) {
      return 0;
    }

    const seconds = Math.round((distance / 141.42) * 60);
    return seconds;
  };
  
  const getLastJobPosition = (): { x: number, y: number } => {
    if (jobs.length === 0) {
      return characterPosition;
    }
    
    const lastJob = jobs[jobs.length - 1];
    return { x: lastJob.mobX, y: lastJob.mobY };
  };
  
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  useEffect(() => {
    if (selectedMob) {
      const secondsFromCurrent = calculateTravelTimeSeconds(
        characterPosition.x, 
        characterPosition.y, 
        selectedMob.x, 
        selectedMob.y
      );
      setTravelTimeText(formatTime(secondsFromCurrent));
      
      const lastPos = getLastJobPosition();
      const secondsFromLastJob = calculateTravelTimeSeconds(
        lastPos.x, 
        lastPos.y, 
        selectedMob.x, 
        selectedMob.y
      );
      setTravelTimeFromLastJobText(formatTime(secondsFromLastJob));
    }
  }, [characterPosition, jobs, selectedMob]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow dragging if we're not on mobile and if we're clicking the header
    if (!isMobile) {
      // Check if the clicked element is the header or a descendant of the header
      if (e.currentTarget.classList.contains('header')) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
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
  }, [isDragging]);

  const handleAttack = async (duration: '15s' | '10m' | '1h') => {
    if (!selectedMob) return;
    
    // Clear any existing error
    setErrorMessage('');
    
    // Verify character has enough HP
    if (characterStats.hp.current <= 0) {
      setErrorMessage('Nu poți lupta cu 0 HP! Odihnește-te pentru a-ți recupera HP.');
      return;
    }
    
    const staminaCost = 
      duration === '15s' ? 1 : 
      duration === '10m' ? 4 : 
      12;
    
    if (characterStats.stamina.current < staminaCost) {
      setErrorMessage(`Nu ai suficientă stamină! Ai nevoie de ${staminaCost} stamină.`);
      return;
    }
    
    const durationInSeconds = 
      duration === '15s' ? 15 : 
      duration === '10m' ? 600 : 
      3600;
    
    const startPos = getLastJobPosition();
    
    const travelTimeSeconds = calculateTravelTimeSeconds(
      startPos.x, 
      startPos.y, 
      selectedMob.x, 
      selectedMob.y
    );
    
    const wasAdded = await addJob({
      type: duration,
      remainingTime: durationInSeconds,
      travelTime: travelTimeSeconds,
      isInProgress: false,
      mobName: selectedMob.name,
      mobImage: selectedMob.image,
      mobX: selectedMob.x,
      mobY: selectedMob.y,
      mobType: selectedMob.type,
      mobLevel: selectedMob.level,
      mobHp: selectedMob.hp,
      mobAttack: selectedMob.attack,
      mobExp: selectedMob.exp,
      mobYang: selectedMob.yang,
      staminaCost: staminaCost
    });
    
    if (!wasAdded) {
      setErrorMessage('Poți avea maxim 3 munci active!');
    } else {
      onClose();
    }
  };

  if (!isOpen || !selectedMob) return null;

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const panelTitle = selectedMob.type === 'boss' ? 'Boss' : 'Metin';
  const panelColorClass = selectedMob.type === 'boss' ? 'border-metin-red/40' : 'border-metin-gold/40';
  const headerColorClass = selectedMob.type === 'boss' ? 'from-metin-red/70 to-metin-dark' : 'from-metin-brown to-metin-dark';

  const getLevelRating = (mobLevel: number) => {
    if (mobLevel <= 20) return "Ușor";
    if (mobLevel <= 30) return "Moderat";
    if (mobLevel <= 40) return "Dificil";
    return "Foarte Dificil";
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ro-RO');
  };

  const calculateReward = (percentage: number) => {
    const fullExp = selectedMob.exp;
    const fullYang = selectedMob.yang;

    const expReward = (fullExp * percentage) / 100;
    const yangReward = (fullYang * percentage) / 100;

    return {
      exp: Math.round(expReward),
      yang: Math.round(yangReward),
    };
  };

  const reward15s = calculateReward(10); 
  const reward10m = calculateReward(40);
  const reward1h = calculateReward(100);

  const currentStamina = characterStats.stamina.current;
  const hasStaminaFor15s = currentStamina >= 1;
  const hasStaminaFor10m = currentStamina >= 4;
  const hasStaminaFor1h = currentStamina >= 12;

  return (
    <div 
      className={`fixed inset-0 sm:inset-auto flex items-center justify-center sm:justify-start bg-black/50 sm:bg-transparent z-50`}
    >
      <div 
        ref={panelRef}
        className={`bg-metin-dark/95 border-2 ${panelColorClass} rounded-lg shadow-lg w-[90%] sm:w-auto max-w-[90%] sm:max-w-none`}
        style={{ 
          ...(isMobile 
            ? {
                width: '100%',
                maxWidth: '100%',
                height: 'auto',
              } 
            : { 
                width: '360px', 
                height: '520px',
                position: 'fixed',
                top: `${position.y}px`, 
                left: `${position.x}px`,
                cursor: isDragging ? 'grabbing' : 'auto'
              }
          )
        }}
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
      >
        <div 
          className={`header bg-gradient-to-r ${headerColorClass} border-b ${panelColorClass} px-2 sm:px-4 py-1 sm:py-2 flex justify-between items-center ${isMobile ? 'cursor-default' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-metin-gold font-bold text-sm sm:text-lg">{panelTitle}: {selectedMob.name}</h2>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-metin-light/70 hover:text-metin-gold text-lg sm:text-xl transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="p-2 sm:p-4 flex flex-col h-auto sm:h-[calc(100%-44px)]">
          <div className="flex mb-2 sm:mb-4">
            <div className="relative w-16 sm:w-24 h-16 sm:h-24 bg-black/60 border border-metin-gold/30 rounded-lg overflow-hidden mr-2 sm:mr-4 flex items-center justify-center">
              <Image 
                src={selectedMob.image}
                alt={selectedMob.name}
                width={96}
                height={96}
                className="object-contain w-full h-full"
                style={{ objectPosition: 'center' }}
                quality={100}
              />
            </div>
            
            <div className="flex-1">
              <h3 className="text-metin-gold text-sm sm:text-lg mb-1 sm:mb-2">{selectedMob.name}</h3>
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                <div className="text-metin-light/80 text-xs sm:text-sm">
                  Nivel: <span className="text-metin-gold">{selectedMob.level}</span>
                </div>
                <div className="text-metin-light/80 text-xs sm:text-sm">
                  Tip: <span className="text-metin-gold capitalize">{selectedMob.type}</span>
                </div>
                <div className="text-metin-light/80 text-xs sm:text-sm col-span-2">
                  Dificultate: <span className="text-metin-gold">{getLevelRating(selectedMob.level)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/30 p-2 sm:p-3 rounded-lg mb-1 sm:mb-2">
            <h4 className="text-metin-gold text-xs sm:text-sm mb-1 sm:mb-2">Statistici:</h4>
            <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2">
              <div className="flex justify-between">
                <span className="text-metin-light/80 text-xs sm:text-sm">HP:</span>
                <span className="text-metin-gold text-xs sm:text-sm">{formatNumber(selectedMob.hp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-metin-light/80 text-xs sm:text-sm">Atac:</span>
                <span className="text-metin-gold text-xs sm:text-sm">{formatNumber(selectedMob.attack)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-metin-light/80 text-xs sm:text-sm">Experiență:</span>
                <span className="text-metin-gold text-xs sm:text-sm">{formatNumber(selectedMob.exp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-metin-light/80 text-xs sm:text-sm">Yang:</span>
                <span className="text-metin-gold text-xs sm:text-sm">{formatNumber(selectedMob.yang)}</span>
              </div>
            </div>
          </div>

          <div className="bg-black/30 p-2 sm:p-3 rounded-lg mb-1 sm:mb-2">
            <h4 className="text-metin-gold text-xs sm:text-sm mb-1 sm:mb-2">Timp de deplasare:</h4>
            <div className="text-metin-light/80 text-xs sm:text-sm mb-0.5 sm:mb-1">
              Timp estimat: <span className="text-metin-gold">{travelTimeText}</span> <span className="text-yellow-300">(Poziția curentă)</span>
            </div>
            <div className="text-metin-light/80 text-xs sm:text-sm">
              Timp estimat: <span className="text-metin-gold">{travelTimeFromLastJobText}</span> <span className="text-yellow-300">(Ultima poziție)</span>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-900/50 border border-red-500/50 p-1 sm:p-2 rounded-lg mb-1 sm:mb-2 text-center animate-pulse">
              <span className="text-red-400 text-xs sm:text-sm">{errorMessage}</span>
            </div>
          )}

          <div className="mt-auto grid grid-cols-3 gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-center">
            <button 
              className={`w-10 sm:w-12 h-10 sm:h-12 mx-auto rounded-full border flex flex-col items-center justify-center overflow-hidden transition-transform hover:scale-110 ${hasStaminaFor15s ? 'bg-metin-red/30 border-metin-gold/50 animate-spin-slow' : 'bg-metin-dark/50 border-metin-light/20 opacity-50 cursor-not-allowed'}`}
              onClick={() => hasStaminaFor15s && handleAttack('15s')}
              disabled={!hasStaminaFor15s}
            >
              <span className={`text-base sm:text-lg font-bold ${hasStaminaFor15s ? 'text-metin-gold' : 'text-metin-light/50'}`}>⚔</span>
              <span className={`text-[10px] sm:text-xs ${hasStaminaFor15s ? 'text-metin-light' : 'text-metin-light/50'}`}>15s</span>
            </button>
            <button 
              className={`w-10 sm:w-12 h-10 sm:h-12 mx-auto rounded-full border flex flex-col items-center justify-center overflow-hidden transition-transform hover:scale-110 ${hasStaminaFor10m ? 'bg-metin-red/30 border-metin-gold/50 animate-spin-slow' : 'bg-metin-dark/50 border-metin-light/20 opacity-50 cursor-not-allowed'}`}
              onClick={() => hasStaminaFor10m && handleAttack('10m')}
              disabled={!hasStaminaFor10m}
            >
              <span className={`text-base sm:text-lg font-bold ${hasStaminaFor10m ? 'text-metin-gold' : 'text-metin-light/50'}`}>⚔</span>
              <span className={`text-[10px] sm:text-xs ${hasStaminaFor10m ? 'text-metin-light' : 'text-metin-light/50'}`}>10m</span>
            </button>
            <button 
              className={`w-10 sm:w-12 h-10 sm:h-12 mx-auto rounded-full border flex flex-col items-center justify-center overflow-hidden transition-transform hover:scale-110 ${hasStaminaFor1h ? 'bg-metin-red/30 border-metin-gold/50 animate-spin-slow' : 'bg-metin-dark/50 border-metin-light/20 opacity-50 cursor-not-allowed'}`}
              onClick={() => hasStaminaFor1h && handleAttack('1h')}
              disabled={!hasStaminaFor1h}
            >
              <span className={`text-base sm:text-lg font-bold ${hasStaminaFor1h ? 'text-metin-gold' : 'text-metin-light/50'}`}>⚔</span>
              <span className={`text-[10px] sm:text-xs ${hasStaminaFor1h ? 'text-metin-light' : 'text-metin-light/50'}`}>1h</span>
            </button>

            <div className="text-metin-light/80 text-[10px] sm:text-xs">
              Experiență: <span className="text-metin-gold">{formatNumber(reward15s.exp)}</span>
            </div>
            <div className="text-metin-light/80 text-[10px] sm:text-xs">
              Experiență: <span className="text-metin-gold">{formatNumber(reward10m.exp)}</span>
            </div>
            <div className="text-metin-light/80 text-[10px] sm:text-xs">
              Experiență: <span className="text-metin-gold">{formatNumber(reward1h.exp)}</span>
            </div>

            <div className="text-metin-light/80 text-[10px] sm:text-xs">
              Yang: <span className="text-metin-gold">{formatNumber(reward15s.yang)}</span>
            </div>
            <div className="text-metin-light/80 text-[10px] sm:text-xs">
              Yang: <span className="text-metin-gold">{formatNumber(reward10m.yang)}</span>
            </div>
            <div className="text-metin-light/80 text-[10px] sm:text-xs">
              Yang: <span className="text-metin-gold">{formatNumber(reward1h.yang)}</span>
            </div>

            <div className="text-metin-light/80 text-[10px] sm:text-xs">
              Stamină: <span className="text-cyan-400">1</span>
            </div>
            <div className="text-metin-light/80 text-[10px] sm:text-xs">
              Stamină: <span className="text-cyan-400">4</span>
            </div>
            <div className="text-metin-light/80 text-[10px] sm:text-xs">
              Stamină: <span className="text-cyan-400">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobDetailsPanel;