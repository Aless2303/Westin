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
  characterX, // We still accept these props
  characterY
}) => {
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Import useWorks hook to add jobs
  const { addJob, characterPosition, jobs } = useWorks();
  
  // Keep track of local calculation of travel time - update only when needed
  const [travelTimeText, setTravelTimeText] = useState("00:00");
  const [travelTimeFromLastJobText, setTravelTimeFromLastJobText] = useState("00:00");
  
  // Format time display (minutes:seconds) - Defined BEFORE it's used
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate travel time with speed (141.42 units = 1 minute) - Defined BEFORE it's used
  const calculateTravelTimeSeconds = (charX: number, charY: number, mobX: number, mobY: number): number => {
    const distance = Math.sqrt(Math.pow(mobX - charX, 2) + Math.pow(mobY - charY, 2));
    const tolerance = 1;

    if (distance <= tolerance) {
      return 0;
    }

    // Convert to seconds
    const seconds = Math.round((distance / 141.42) * 60);
    return seconds;
  };
  
  // Get position of the last job in queue
  const getLastJobPosition = (): { x: number, y: number } => {
    if (jobs.length === 0) {
      return characterPosition;
    }
    
    // Return the position of the last job in queue
    const lastJob = jobs[jobs.length - 1];
    return { x: lastJob.mobX, y: lastJob.mobY };
  };
  
  // Update travel time when character position, jobs or selected mob changes
  useEffect(() => {
    if (selectedMob) {
      // Calculate time from current position
      const secondsFromCurrent = calculateTravelTimeSeconds(
        characterPosition.x, 
        characterPosition.y, 
        selectedMob.x, 
        selectedMob.y
      );
      setTravelTimeText(formatTime(secondsFromCurrent));
      
      // Calculate time from last job position
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
    e.stopPropagation();
    if (e.target === panelRef.current?.querySelector('.header')) {
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
  }, [isDragging]);

  // Actualizăm doar partea din handleAttack pentru a include și tipul mobului

// Actualizăm doar secțiunea handleAttack pentru a transmite și statisticile mobului

const handleAttack = (duration: '15s' | '10m' | '1h') => {
  if (!selectedMob) return;
  
  // Set job remaining time based on the button clicked
  const durationInSeconds = 
    duration === '15s' ? 15 : 
    duration === '10m' ? 600 : 
    3600; // 1h
  
  // Get the expected starting position for this job (current position or end of last job)
  const startPos = getLastJobPosition();
  
  // Calculate travel time in seconds from start position
  const travelTimeSeconds = calculateTravelTimeSeconds(
    startPos.x, 
    startPos.y, 
    selectedMob.x, 
    selectedMob.y
  );
  
  // Add the job with mob coordinates for position updating
  const wasAdded = addJob({
    type: duration,
    remainingTime: durationInSeconds,
    travelTime: travelTimeSeconds,
    isInProgress: false,
    mobName: selectedMob.name,
    mobImage: selectedMob.image,
    mobX: selectedMob.x,
    mobY: selectedMob.y,
    mobType: selectedMob.type, // Adăugăm tipul mobului pentru rapoarte
    mobLevel: selectedMob.level, // Adăugăm nivelul mobului
    mobHp: selectedMob.hp, // Adăugăm HP-ul mobului
    mobAttack: selectedMob.attack, // Adăugăm atacul mobului
    mobExp: selectedMob.exp, // Adăugăm experiența mobului
    mobYang: selectedMob.yang // Adăugăm yang-ul mobului
  });
  
  if (!wasAdded) {
    // Aici puteți afișa un mesaj de eroare către utilizator
    console.log('Maximum 3 jobs allowed!');
  } else {
    // Close the panel after adding a job
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

  // Calculate fixed rewards based on specified percentages
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

  // Rewards for each attack duration (fixed percentages)
  const reward15s = calculateReward(0.65); // 0.65% (midpoint of 0.6–0.7%)
  const reward10m = calculateReward(23.5);  // 4.5% (midpoint of 4–5%)
  const reward1h = calculateReward(100);   // 100%

  return (
    <div 
      ref={panelRef}
      className={`fixed z-50 bg-metin-dark/95 border-2 ${panelColorClass} rounded-lg shadow-lg`}
      style={{ 
        width: '360px', 
        height: '500px', // Adjusted height to fit the new layout
        top: `${position.y}px`, 
        left: `${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
      <div 
        className={`header bg-gradient-to-r ${headerColorClass} border-b ${panelColorClass} px-4 py-2 flex justify-between items-center cursor-grab`}
        onMouseDown={handleMouseDown}
      >
        <h2 className="text-metin-gold font-bold text-lg">{panelTitle}: {selectedMob.name}</h2>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-metin-light/70 hover:text-metin-gold text-xl transition-colors"
        >
          ×
        </button>
      </div>
      
      <div className="p-4 flex flex-col h-[calc(100%-44px)]">
        <div className="flex mb-4">
          <div className="relative w-24 h-24 bg-black/60 border border-metin-gold/30 rounded-lg overflow-hidden mr-4 flex items-center justify-center">
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
            <h3 className="text-metin-gold text-lg mb-2">{selectedMob.name}</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-metin-light/80 text-sm">
                Nivel: <span className="text-metin-gold">{selectedMob.level}</span>
              </div>
              <div className="text-metin-light/80 text-sm">
                Tip: <span className="text-metin-gold capitalize">{selectedMob.type}</span>
              </div>
              <div className="text-metin-light/80 text-sm col-span-2">
                Dificultate: <span className="text-metin-gold">{getLevelRating(selectedMob.level)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/30 p-3 rounded-lg mb-2">
          <h4 className="text-metin-gold text-sm mb-2">Statistici:</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex justify-between">
              <span className="text-metin-light/80 text-sm">HP:</span>
              <span className="text-metin-gold text-sm">{formatNumber(selectedMob.hp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-metin-light/80 text-sm">Atac:</span>
              <span className="text-metin-gold text-sm">{formatNumber(selectedMob.attack)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-metin-light/80 text-sm">Experiență:</span>
              <span className="text-metin-gold text-sm">{formatNumber(selectedMob.exp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-metin-light/80 text-sm">Yang:</span>
              <span className="text-metin-gold text-sm">{formatNumber(selectedMob.yang)}</span>
            </div>
          </div>
        </div>

        {/* Travel Time Section - modified to show both travel times */}
        <div className="bg-black/30 p-3 rounded-lg mb-2">
          <h4 className="text-metin-gold text-sm mb-2">Timp de deplasare:</h4>
          <div className="text-metin-light/80 text-sm mb-1">
            Timp estimat: <span className="text-metin-gold">{travelTimeText}</span> <span className="text-yellow-300">(Poziția curentă)</span>
          </div>
          <div className="text-metin-light/80 text-sm">
            Timp estimat: <span className="text-metin-gold">{travelTimeFromLastJobText}</span> <span className="text-yellow-300">(Ultima poziție)</span>
          </div>
        </div>

        {/* Attack Buttons with Rewards (3x3 Grid Layout) */}
        <div className="mt-auto grid grid-cols-3 gap-x-4 gap-y-2 text-center">
          {/* Row 1: Buttons */}
          <button 
            className="w-12 h-12 mx-auto bg-metin-red/30 rounded-full border border-metin-gold/50 flex flex-col items-center justify-center animate-spin-slow overflow-hidden transition-transform hover:scale-110"
            onClick={() => handleAttack('15s')}
          >
            <span className="text-metin-gold text-lg font-bold">⚔</span>
            <span className="text-metin-light text-xs">15s</span>
          </button>
          <button 
            className="w-12 h-12 mx-auto bg-metin-red/30 rounded-full border border-metin-gold/50 flex flex-col items-center justify-center animate-spin-slow overflow-hidden transition-transform hover:scale-110"
            onClick={() => handleAttack('10m')}
          >
            <span className="text-metin-gold text-lg font-bold">⚔</span>
            <span className="text-metin-light text-xs">10m</span>
          </button>
          <button 
            className="w-12 h-12 mx-auto bg-metin-red/30 rounded-full border border-metin-gold/50 flex flex-col items-center justify-center animate-spin-slow overflow-hidden transition-transform hover:scale-110"
            onClick={() => handleAttack('1h')}
          >
            <span className="text-metin-gold text-lg font-bold">⚔</span>
            <span className="text-metin-light text-xs">1h</span>
          </button>

          {/* Row 2: Experience */}
          <div className="text-metin-light/80 text-xs">
            Experiență: <span className="text-metin-gold">{formatNumber(reward15s.exp)}</span>
          </div>
          <div className="text-metin-light/80 text-xs">
            Experiență: <span className="text-metin-gold">{formatNumber(reward10m.exp)}</span>
          </div>
          <div className="text-metin-light/80 text-xs">
            Experiență: <span className="text-metin-gold">{formatNumber(reward1h.exp)}</span>
          </div>

          {/* Row 3: Yang */}
          <div className="text-metin-light/80 text-xs">
            Yang: <span className="text-metin-gold">{formatNumber(reward15s.yang)}</span>
          </div>
          <div className="text-metin-light/80 text-xs">
            Yang: <span className="text-metin-gold">{formatNumber(reward10m.yang)}</span>
          </div>
          <div className="text-metin-light/80 text-xs">
            Yang: <span className="text-metin-gold">{formatNumber(reward1h.yang)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobDetailsPanel;