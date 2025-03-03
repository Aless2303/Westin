import React, { useState, useRef, useEffect } from 'react';
import mapImage from '../assets/images/westinmap.jpg';
import mobi from '../data/mobi.json';
import CharacterStatus from '../components/ui/CharacterStatus';

const GamePage: React.FC = () => {
  // Dimensiunile reale ale hărții
  const MAP_WIDTH = 2048;
  const MAP_HEIGHT = 2048;
  
  // Starea pentru poziția hărții, zoom, și animație
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1.0); // Zoom inițial 100%
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [animation, setAnimation] = useState<{ x: number; y: number; visible: boolean } | null>(null);
  
// Mock character data for testing (would come from backend/context in a real app)
const mockCharacterData = {
  name: "Ravensword",
  level: 134,
  race: "Ninja",
  gender: "Masculin",
  background: "/Backgrounds/western2.jpg",
  hp: {
    current: 2303,
    max: 7500
  },
  stamina: {
    current: 84,
    max: 100
  },
  experience: {
    current: 12345,   // Experiență curentă (valoare absolută)
    percentage: 63    // Procentul de experiență către nivelul următor
  }
};
  
  // Limitele de zoom
  const MIN_SCALE = 1.0; // 100% - zoom minim
  const MAX_SCALE = 2.5; // 250% - zoom maxim
  
  // Referința către containerul hărții
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
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

  // Handler pentru click pe butoane (diferit pentru metin și boss, cu animație)
  const handleItemClick = (itemName: string, itemType: string, itemX: number, itemY: number) => {
    if (itemType === 'metin') {
      console.log(`Interacționezi cu Metin: ${itemName}`);
      // Afișează animația la coordonatele item-ului
      setAnimation({ x: itemX, y: itemY, visible: true });
      // Ascunde animația după 1.5 secunde
      setTimeout(() => setAnimation(null), 1500);
    } else if (itemType === 'boss') {
      console.log(`Începi lupta cu Boss-ul: ${itemName}`);
      setAnimation({ x: itemX, y: itemY, visible: true });
      setTimeout(() => setAnimation(null), 1500);
    }
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
              onClick={() => handleItemClick(item.name, item.type, item.x, item.y)}
              className="absolute rounded-full transition-all"
              style={{
                width: '60px', // Dimensiune fixă de 60x60 pixeli (cerc)
                height: '60px',
                left: `${(item.x / MAP_WIDTH) * 100}%`, // Poziționare procentuală pe axa X
                top: `${(item.y / MAP_HEIGHT) * 100}%`, // Poziționare procentuală pe axa Y
                transform: 'translate(-50%, -50%)', // Centrează butonul pe coordonate
                backgroundColor: 'transparent', // Fără fundal (invizibil)
                border: 'none', // Fără bordură
                pointerEvents: 'auto', // Permite interacțiunea cu butonul
                zIndex: 20, // Asigură că butonul este deasupra hărții
              }}
            >
              {/* Butonul este complet transparent, fără text sau conținut vizibil */}
            </button>
          ))}
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
                zIndex: 30, // Deasupra butoanelor și hărții
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