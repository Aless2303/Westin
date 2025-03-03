// src/components/ui/CharacterStatus.tsx 
import React, { useState } from 'react';
import Image from 'next/image';

interface CharacterStatusProps {
  name: string;
  level: number;
  race: string;
  gender: string;
  background?: string; // Adăugăm opțiunea de fundal, cu ? pentru a o face opțională
  hp: {
    current: number;
    max: number;
  };
  stamina: {
    current: number;
    max: number;
  };
  experience?: {
    current: number;
    percentage: number;
  };
}

const CharacterStatus: React.FC<CharacterStatusProps> = ({
  name,
  level,
  race,
  gender,
  background = "/Backgrounds/western1.jpg", // Valoare implicită
  hp,
  stamina,
  experience = { current: 1250, percentage: 63 } // Valoare implicită pentru experiență
}) => {
  // State pentru a controla vizibilitatea panoului
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  // Calculate percentages for progress bars
  const hpPercentage = Math.min(100, Math.max(0, (hp.current / hp.max) * 100));
  const staminaPercentage = Math.min(100, Math.max(0, (stamina.current / stamina.max) * 100));
  const expPercentage = Math.min(100, Math.max(0, experience.percentage));

  // Get character image based on race and gender
  const characterImagePath = `/Races/${gender.toLowerCase()}/${race.toLowerCase()}.png`;

  // Toggle function pentru afisare/ascundere panou
  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  return (
    <div className="absolute top-3 left-3 z-50">
      {isPanelVisible ? (
        <div className="w-56 relative">
          {/* Buton pentru ascundere */}
          <button 
            onClick={togglePanel}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-metin-dark border border-metin-gold/50 flex items-center justify-center text-metin-gold text-xs hover:bg-metin-gold/20 transition-colors z-20"
            title="Ascunde panoul"
          >
            ×
          </button>

          <div className="bg-metin-dark/95 backdrop-blur-sm border border-metin-gold/40 rounded-lg overflow-hidden shadow-lg">
            {/* Character portrait area */}
            <div className="relative h-20 flex items-center">
              {/* Character image with circular frame and background */}
              <div className="ml-3 w-16 h-16 rounded-full border-2 border-metin-gold/60 bg-black/80 overflow-hidden relative">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={background}
                    alt="Character background"
                    fill
                    className="object-cover opacity-40"
                  />
                </div>
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-metin-gold/10 to-black/60 z-10"></div>
                
                {/* Character image */}
                <Image
                  src={characterImagePath}
                  alt={`${name} character`}
                  fill
                  className="object-cover object-top z-20"
                />
              </div>
              
              {/* Character name and level */}
              <div className="ml-3 text-metin-light">
                <div className="font-semibold text-metin-gold truncate max-w-[120px]">{name}</div>
                <div className="flex items-center mt-1">
                  <div className="w-6 h-6 flex items-center justify-center bg-metin-gold/20 rounded-full border border-metin-gold/50 text-metin-gold text-xs font-bold">
                    {level}
                  </div>
                  <div className="ml-2 text-xs text-metin-light/70">{race}</div>
                </div>
              </div>
            </div>

            {/* Health and stamina bars */}
            <div className="p-3 pt-1">
              {/* HP Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-metin-light/80 mb-1">
                  <span>HP</span>
                  <span>{hp.current} / {hp.max}</span>
                </div>
                <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-metin-gold/30">
                  <div 
                    className="h-full bg-gradient-to-r from-red-900 to-red-600 rounded-full"
                    style={{ width: `${hpPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Stamina Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-metin-light/80 mb-1">
                  <span>Stamina</span>
                  <span>{stamina.current} / {stamina.max}</span>
                </div>
                <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-metin-gold/30">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-900 to-blue-600 rounded-full"
                    style={{ width: `${staminaPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Experience Bar - nou adăugat */}
              <div>
                <div className="flex justify-between text-xs text-metin-light/80 mb-1">
                  <span>Experience</span>
                  <span>{experience.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-metin-gold/30">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-700 to-yellow-500 rounded-full"
                    style={{ width: `${expPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Buton pentru afișarea panoului când acesta este ascuns
        <button
          onClick={togglePanel}
          className="w-8 h-8 rounded-full bg-metin-dark/95 border border-metin-gold/40 flex items-center justify-center text-metin-gold hover:bg-metin-gold/20 transition-colors shadow-lg"
          title="Afișează informații caracter"
        >
          <span className="text-xl">⚔</span>
        </button>
      )}
    </div>
  );
};

export default CharacterStatus;