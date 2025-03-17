import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // Import Image for the character marker
import mapImage from '../assets/images/westinmap.jpg';
import mobi from '../data/mobi.json';
import CharacterStatus from '../components/ui/CharacterStatus';
import BottomPanel from '../components/ui/BottomPanel';
import { MobDetailsPanel } from '../features/mobs';

// Interface pentru tipul de mob
interface MobType {
  name: string;
  x: number;
  y: number;
  type: "boss" | "metin";
}

// Interface pentru datele personajului
interface CharacterType {
  name: string;
  level: number;
  race: string;
  gender: string;
  background: string;
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
  };
  x: number;
  y: number;
}

const GamePage: React.FC = () => {
  // Dimensiunile reale ale hărții
  const MAP_WIDTH = 2048;
  const MAP_HEIGHT = 2048;
  
  // Starea pentru poziția hărții, zoom, și animație
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [animation, setAnimation] = useState<{ x: number; y: number; visible: boolean } | null>(null);
  
  // Stare pentru panoul de detalii mob
  const [isMobDetailsOpen, setIsMobDetailsOpen] = useState(false);
  const [selectedMob, setSelectedMob] = useState<MobType | null>(null);
  
  // Datele mock pentru personaj
  const mockCharacterData: CharacterType = {
    name: "Ravensword",
    level: 134,
    race: "Ninja",
    gender: "Masculin",
    background: "/Backgrounds/western2.jpg",
    hp: {
      current: 2303,
      max: 7500,
    },
    stamina: {
      current: 84,
      max: 100,
    },
    experience: {
      current: 12345,
      percentage: 63,
    },
    x: 350,
    y: 611,
  };
  
  // Limitele de zoom
  const MIN_SCALE = 1.0;
  const MAX_SCALE = 2.5;
  
  // Referința către containerul hărții
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Calculează cel mai apropiat mob de personaj
  const findClosestMob = (characterX: number, characterY: number): MobType => {
    let closestMob = mobi[0];
    let minDistance = Infinity;

    mobi.forEach((mob) => {
      const distance = Math.sqrt(
        Math.pow(mob.x - characterX, 2) + Math.pow(mob.y - characterY, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestMob = mob;
      }
    });

    return closestMob;
  };

  // Găsește cel mai apropiat mob
  const closestMob = findClosestMob(mockCharacterData.x, mockCharacterData.y);

  // Construiește calea către imaginea personajului bazată pe rasă și gen
  const characterImagePath = `/Races/${mockCharacterData.gender.toLowerCase()}/${mockCharacterData.race.toLowerCase()}.png`;

  // Handler pentru începerea tragerii
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  
  // Handler pentru tragere
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const container = mapContainerRef.current;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const scaledWidth = MAP_WIDTH * scale;
    const scaledHeight = MAP_HEIGHT * scale;
    
    const minX = containerWidth - scaledWidth;
    const minY = containerHeight - scaledHeight;
    const maxX = 0;
    const maxY = 0;
    
    const boundedX = Math.max(minX, Math.min(maxX, newX));
    const boundedY = Math.max(minY, Math.min(maxY, newY));
    
    setPosition({ x: boundedX, y: boundedY });
  };
  
  // Handler pentru terminarea tragerii
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handler pentru ieșirea mouse-ului din viewport în timpul tragerii
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };
  
  // Handler pentru zoom cu rotița mouse-ului
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const zoomFactor = 0.1;
    const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;
    
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
    
    if (newScale === scale) return;
    
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const pointXOnImage = mouseX - position.x;
    const pointYOnImage = mouseY - position.y;
    
    const newPointXOnImage = pointXOnImage * (newScale / scale);
    const newPointYOnImage = pointYOnImage * (newScale / scale);
    
    const newX = mouseX - newPointXOnImage;
    const newY = mouseY - newPointYOnImage;
    
    const container = mapContainerRef.current;
    if (container) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const scaledWidth = MAP_WIDTH * newScale;
      const scaledHeight = MAP_HEIGHT * newScale;
      
      const minX = containerWidth - scaledWidth;
      const minY = containerHeight - scaledHeight;
      const maxX = 0;
      const maxY = 0;
      
      const boundedX = Math.max(minX, Math.min(maxX, newX));
      const boundedY = Math.max(minY, Math.min(maxY, newY));
      
      setPosition({ x: boundedX, y: boundedY });
      setScale(newScale);
    }
  };
  
  // Adaugă evenimentul de mouseup global
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);
  
  // Poziționează harta în colțul din stânga sus la încărcare
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setScale(1.0);
  }, []);

  // Log the character's coordinates and closest mob for debugging
  useEffect(() => {
    console.log(`Character position: x=${mockCharacterData.x}, y=${mockCharacterData.y}`);
    console.log(`Closest mob: ${closestMob.name} at x=${closestMob.x}, y=${closestMob.y}`);
  }, []);

  // Handler pentru click pe butoane (diferit pentru metin și boss, cu animație)
  const handleItemClick = (item: MobType) => {
    setSelectedMob(item);
    setIsMobDetailsOpen(true);
  };

  return (
    <div 
      ref={mapContainerRef}
      className="fixed inset-0 overflow-hidden bg-gray-900"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      style={{ 
        zIndex: 0, 
        cursor: isDragging ? 'grabbing' : 'grab',
        overflow: 'hidden'
      }}
    >
      {/* Character status UI component */}
      <CharacterStatus 
        name={mockCharacterData.name}
        level={mockCharacterData.level}
        race={mockCharacterData.race}
        gender={mockCharacterData.gender}
        background={mockCharacterData.background}
        hp={mockCharacterData.hp}
        stamina={mockCharacterData.stamina}
        experience={mockCharacterData.experience}
      />

      {/* Bottom panel with inventory button */}
      <BottomPanel playerRace={mockCharacterData.race} />
      
      {/* Mob Details Panel with character coordinates */}
      <MobDetailsPanel
        isOpen={isMobDetailsOpen}
        onClose={() => setIsMobDetailsOpen(false)}
        selectedMob={selectedMob}
        characterX={mockCharacterData.x}
        characterY={mockCharacterData.y}
      />

      {/* Containerul pentru hartă care se va mișca și scala */}
      <div 
        className="absolute will-change-transform"
        style={{ 
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
          transformOrigin: '0 0',
          transition: 'none',
          width: MAP_WIDTH + 'px',
          height: MAP_HEIGHT + 'px',
          pointerEvents: 'none'
        }}
      >
        <div className="relative w-full h-full pointer-events-auto">
          <img 
            src={mapImage.src} 
            alt="Harta jocului Westin" 
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            draggable="false"
            className="select-none block"
            style={{
              imageRendering: 'crisp-edges',
              width: '100%',
              height: '100%',
              objectFit: 'fill'
            }}
          />
          {/* Suprapunere butoane invizibile pentru mobi (Metine și Bosi) */}
          {mobi.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              className="absolute rounded-full transition-all hover:bg-metin-gold/20"
              style={{
                width: '60px',
                height: '60px',
                left: `${(item.x / MAP_WIDTH) * 100}%`,
                top: `${(item.y / MAP_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'transparent',
                border: 'none',
                pointerEvents: 'auto',
                zIndex: 20,
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-xs text-metin-gold/30">
                {item.type === 'boss' ? '⚔️' : '🗿'}
              </span>
            </button>
          ))}
          {/* Marker pentru personaj (imagine bazată pe rasă și gen, în cerc cu fundal alb și bordură neagră) */}
          <div
            className="absolute rounded-full bg-white border-2 border-black"
            style={{
              width: '40px',
              height: '40px',
              // Poziționează markerul în stânga și ușor deasupra coordonatelor celui mai apropiat mob
              left: `${((closestMob.x - 40) / MAP_WIDTH) * 100}%`, // 40px la stânga
              top: `${((closestMob.y + 20) / MAP_HEIGHT) * 100}%`, // 20px deasupra
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 25,
              overflow: 'hidden', // Ensures the image stays within the circle
            }}
            title={mockCharacterData.name}
          >
            <Image
              src={characterImagePath}
              alt={`${mockCharacterData.name} marker`}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          {/* Animația personalizată pentru click pe butoane */}
          {animation && (
            <div
              className="absolute rounded-full bg-metin-gold/10 animate-fade-pulse"
              style={{
                width: '65px',
                height: '65px',
                left: `${(animation.x / MAP_WIDTH) * 100}%`,
                top: `${(animation.y / MAP_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 30,
              }}
            />
          )}
        </div>
      </div>
      
      {/* Informații de debug - uncomment când e nevoie */}
      {/* <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded select-none z-10">
        <div>Poziție: X: {Math.round(position.x)}, Y: {Math.round(position.y)}</div>
        <div>Zoom: {Math.round(scale * 100)}%</div>
      </div> */}
    </div>
  );
};

export default GamePage;