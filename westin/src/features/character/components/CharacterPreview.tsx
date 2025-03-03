import React from 'react';
import Image from 'next/image';
import BackgroundSelector from './BackgroundSelector';

interface CharacterPreviewProps {
  selectedRace: string | null;
  selectedGender: string | null;
  characterName: string;
  selectedBackground: string | null;
  backgroundIndex: number;
  backgrounds: string[];
  navigateBackground: (direction: 'next' | 'prev') => void;
  setSelectedBackground: (background: string) => void;
  checkFormValidity: (name: string, race: string | null, gender: string | null, background: string) => void;
}

const CharacterPreview: React.FC<CharacterPreviewProps> = ({
  selectedRace,
  selectedGender,
  characterName,
  selectedBackground,
  backgroundIndex,
  backgrounds,
  navigateBackground,
  setSelectedBackground,
  checkFormValidity
}) => {
  // Paths to images for races and genders
  const getRaceImage = (race: string, gender: string) => {
    return `/Races/${gender.toLowerCase()}/${race.toLowerCase()}.png`;
  };

  return (
    <div className="w-1/2 flex flex-col">
      <div className="h-96 relative rounded-lg border border-metin-gold/30 bg-black/40 overflow-hidden">
        {/* Background image */}
        {selectedBackground && (
          <div className="absolute inset-0 z-0">
            <Image
              src={selectedBackground}
              alt="Fundal selectat"
              fill
              className="object-cover opacity-70"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        )}

        {/* Character preview */}
        {selectedRace && selectedGender ? (
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="relative w-full h-full">
              <Image
                src={getRaceImage(selectedRace, selectedGender)}
                alt={`${selectedRace} ${selectedGender}`}
                fill
                className="z-10 object-contain object-bottom"
                style={{ objectPosition: "center 10%" }}
                priority
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-metin-light/70 text-center p-8">
              <div className="w-24 h-24 mx-auto border-2 border-dashed border-metin-gold/40 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl text-metin-gold/40">?</span>
              </div>
              <p>Selectează rasa și genul pentru a previzualiza caracterul</p>
            </div>
          </div>
        )}

        {/* HUD-style overlay - simplificat */}
        <div className="absolute inset-x-0 top-0 p-3">
          <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-metin-gold/20 inline-block">
            <h2 className="text-metin-gold text-xs uppercase tracking-wider">Previzualizare</h2>
          </div>
        </div>

        {/* Display character name if entered */}
        {characterName && (
          <div className="absolute inset-x-0 bottom-0 p-3">
            {/* You can add character name display here if needed */}
          </div>
        )}
      </div>

      {/* Background selector component */}
      <BackgroundSelector
        backgrounds={backgrounds}
        backgroundIndex={backgroundIndex}
        selectedBackground={selectedBackground}
        navigateBackground={navigateBackground}
        setSelectedBackground={setSelectedBackground}
        checkFormValidity={checkFormValidity}
        characterName={characterName}
        selectedRace={selectedRace}
        selectedGender={selectedGender}
      />
    </div>
  );
};

export default CharacterPreview;