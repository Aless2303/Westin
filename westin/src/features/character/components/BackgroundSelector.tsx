import React from 'react';
import Image from 'next/image';

interface BackgroundSelectorProps {
  backgrounds: string[];
  backgroundIndex: number;
  selectedBackground: string | null;
  navigateBackground: (direction: 'next' | 'prev') => void;
  setSelectedBackground: (background: string) => void;
  checkFormValidity: (name: string, race: string | null, gender: string | null, background: string) => void;
  characterName: string;
  selectedRace: string | null;
  selectedGender: string | null;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  backgrounds,
  backgroundIndex,
  selectedBackground,
  navigateBackground,
  setSelectedBackground,
  checkFormValidity,
  characterName,
  selectedRace,
  selectedGender,
}) => {
  return (
    <div className="mt-4 p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-metin-gold/20">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-metin-gold text-sm uppercase tracking-wider">Fundal</h3>
        <div className="text-xs text-metin-light/70">
          {backgroundIndex + 1} / {backgrounds.length}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigateBackground('prev')}
          className="text-metin-light/70 hover:text-metin-gold transition-colors"
        >
          ◄
        </button>
        
        <div className="flex-1 relative h-16 overflow-hidden rounded border border-metin-gold/30">
          {backgrounds.map((bg, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-300 ${backgroundIndex === index ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image
                src={bg}
                alt={`Fundal ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
          
          {/* Overlay for selected state */}
          <div className="absolute inset-0 border-2 border-transparent transition-colors duration-300">
            {selectedBackground === backgrounds[backgroundIndex] && (
              <div className="absolute inset-0 border-2 border-metin-gold"></div>
            )}
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => navigateBackground('next')}
          className="text-metin-light/70 hover:text-metin-gold transition-colors"
        >
          ►
        </button>
      </div>
      
      <button
        type="button"
        onClick={() => {
          setSelectedBackground(backgrounds[backgroundIndex]);
          checkFormValidity(characterName, selectedRace, selectedGender, backgrounds[backgroundIndex]);
        }}
        className={`w-full mt-2 py-1 text-sm rounded border transition-colors ${
          selectedBackground === backgrounds[backgroundIndex]
            ? "bg-metin-gold/20 border-metin-gold/50 text-metin-gold"
            : "border-metin-gold/20 text-metin-light/70 hover:border-metin-gold/40"
        }`}
      >
        {selectedBackground === backgrounds[backgroundIndex] ? "Selectat" : "Selectează fundalul"}
      </button>
    </div>
  );
};

export default BackgroundSelector;