// src/components/ui/CharacterStatus.tsx 
import React, { useState } from 'react';
import Image from 'next/image';
import { Leaderboard } from '../../features/leaderboard';
import { ProfileWindow } from '../../features/profile';
import { generateEquipment } from '../../data/mock/inventory';
import mockProfileData from '../../data/mock/profile';

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
  // State pentru a controla vizibilitatea leaderboard
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  // State pentru a controla vizibilitatea profilului
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  // Toggle function pentru afisare/ascundere leaderboard
  const toggleLeaderboard = () => {
    setIsLeaderboardOpen(!isLeaderboardOpen);
  };

  // Toggle function pentru afisare/ascundere profil
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Generate equipment for profile display
  const characterEquipment = generateEquipment(race, level);

  return (
    <div className="absolute top-3 left-3 z-50">
      {isPanelVisible ? (
        <div className="w-56 relative">
          {/* Butonul de leaderboard va avea un efect de highlight pentru a atrage atenția */}
          <div className="absolute -top-2 right-9 w-9 h-9 rounded-full bg-metin-gold/20 animate-pulse-slow"></div>
          
          {/* Buton pentru ascundere */}
          <button 
            onClick={togglePanel}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-metin-dark border border-metin-gold/50 flex items-center justify-center text-metin-gold text-xs hover:bg-metin-gold/20 transition-colors z-20"
            title="Ascunde panoul"
          >
            ×
          </button>

          {/* Buton pentru Leaderboard îmbunătățit */}
          <button 
            onClick={toggleLeaderboard}
            className="absolute -top-2 right-8 w-8 h-8 rounded-full bg-metin-dark border border-metin-gold/50 flex items-center justify-center text-metin-gold text-xs hover:bg-metin-gold/30 transition-colors z-20 overflow-hidden shadow-md"
            title="Deschide Leaderboard"
          >
            {/* Fundal animat pentru buton */}
            <div className="absolute inset-0 bg-gradient-to-br from-metin-gold/30 to-transparent opacity-50"></div>
            
            {/* Iconița pentru Leaderboard - un trofeu */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 relative z-10">
              <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 0019.5 18.75h-1.5a.75.75 0 000 1.5h1.5a5.25 5.25 0 01-5.25 5.25h-3a5.25 5.25 0 01-5.25-5.25v-.75a.75.75 0 011.5 0v.75a3.75 3.75 0 003.75 3.75h3a3.75 3.75 0 003.75-3.75V18a.75.75 0 00-.75-.75h-7.5a.75.75 0 00-.75.75v1.5a.75.75 0 01-1.5 0V18a.75.75 0 00-.75-.75H2.25a.75.75 0 010-1.5H4.5a.75.75 0 00.75-.75v-1.5a.75.75 0 011.5 0v1.5a.75.75 0 00.75.75h7.5a.75.75 0 00.75-.75v-1.5a.75.75 0 011.5 0v1.5a.75.75 0 00.75.75h2.25a.75.75 0 010 1.5H18a.75.75 0 00-.75.75v.774a1.75 1.75 0 01-1.75 1.75h-6a1.75 1.75 0 01-1.75-1.75v-.774a.75.75 0 00-.75-.75H4.5a.75.75 0 00-.75.75v.774a1.75 1.75 0 01-1.75 1.75h-.583c-.827 0-1.5-.673-1.5-1.5V18.75c0-.492.239-.952.642-1.229a61.31 61.31 0 016.557-3.426A6.713 6.713 0 013.174 7.744a.75.75 0 01.584-.859c1.012-.212 2.036-.394 3.068-.542V4.5a.75.75 0 01.75-.75H4.5a.75.75 0 010-1.5h3.751a.75.75 0 01.75.75v3.123c1.012.148 2.036.33 3.068.542a.75.75 0 01.584.859 6.713 6.713 0 01-4.008 6.322 61.303 61.303 0 016.557 3.426c.403.277.642.737.642 1.229v2.309c0 .827-.673 1.5-1.5 1.5h-.583a1.75 1.75 0 01-1.75-1.75v-.774a.75.75 0 00-.75-.75H9a.75.75 0 01-.75-.75v-1.5a.75.75 0 01.75-.75h5.834a4.75 4.75 0 10-9.179-1.7c-.223.409-.729.626-1.19.429a30.78 30.78 0 00-4.968-1.645c-.452-.128-.685-.552-.603-1.013a6.753 6.753 0 014.453-5.157 30.736 30.736 0 002.922-.8 29.596 29.596 0 002.443-.892A.75.75 0 019 6.75V2.625c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V6.75c0 .266-.145.513-.389.644-.952.406-1.894.761-2.443.892a29.51 29.51 0 01-2.925.8 6.753 6.753 0 01-4.428 5.134 32.25 32.25 0 014.533 1.5A6.75 6.75 0 0119.5 18V10.2a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v7.8a5.25 5.25 0 01-2.759 4.632 58.756 58.756 0 00-5.467-2.994.75.75 0 01.585-1.379c.642.273 1.347.578 2.101.922V10.2a.75.75 0 011.5 0v6.75c0 .218-.043.417-.121.596 1.272.516 2.342.978 3.05 1.294a3.75 3.75 0 001.564-3.839 61.207 61.207 0 00-2.345-.444.75.75 0 01.33-1.465c.65.146 1.292.306 1.926.479a5.24 5.24 0 01-2.14 3.049v2.178c0 .827-.673 1.5-1.5 1.5h-.583a1.75 1.75 0 01-1.75-1.75v-.774a.75.75 0 00-.75-.75h-3.75a.75.75 0 010-1.5zm9.085-4.127v2.876a58.88 58.88 0 00-3.362-1.49 6.75 6.75 0 003.362-1.386z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="bg-metin-dark/95 backdrop-blur-sm border border-metin-gold/40 rounded-lg overflow-hidden shadow-lg">
            {/* Character portrait area */}
            <div className="relative h-20 flex items-center">
              {/* Character image with circular frame and background - Now clickable */}
              <button 
                onClick={toggleProfile}
                className="ml-3 w-16 h-16 rounded-full border-2 border-metin-gold/60 bg-black/80 overflow-hidden relative hover:border-metin-gold hover:shadow-gold transition-all"
                title="Deschide profilul"
              >
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={background}
                    alt="Character background"
                    fill
                    className="object-cover opacity-40"
                  />
                </div>
                
                {/* Gold glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-metin-gold/20 to-transparent opacity-0 hover:opacity-60 transition-opacity z-20"></div>
                
                {/* Character image */}
                <Image
                  src={characterImagePath}
                  alt={`${name} character`}
                  fill
                  className="object-cover object-top z-10"
                />
              </button>
              
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

      {/* Leaderboard Component */}
      <Leaderboard 
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
        refreshInterval={30000}
      />

      {/* Profile Component */}
      <ProfileWindow
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={mockProfileData}
        equipment={characterEquipment}
      />
    </div>
  );
};

export default CharacterStatus;