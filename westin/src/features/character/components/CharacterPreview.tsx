"use client";

import React, { useState, useEffect } from "react";
import BackgroundSelector from "./BackgroundSelector";

interface CharacterPreviewProps {
  selectedRace: string | null;
  selectedGender: string | null;
  characterName: string;
  selectedBackground: string | null;
  backgroundIndex: number;
  backgrounds: string[];
  navigateBackground: (direction: "next" | "prev") => void;
  setSelectedBackground: (background: string) => void;
  checkFormValidity: (name: string, race: string | null, gender: string | null, background: string) => void;
  backgroundImages: string[];
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
  checkFormValidity,
  backgroundImages,
}) => {
  const [raceImage, setRaceImage] = useState<string | null>(null);
  const defaultAvatar = "/default-avatar.png"; // Ensure this file exists in the public directory

  useEffect(() => {
    const fetchRaceImage = async () => {
      if (selectedRace && selectedGender) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/races/name/${selectedRace}/gender/${selectedGender}/image`
          );
          if (response.ok && response.status !== 304) {
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            setRaceImage(imageUrl);
          } else {
            setRaceImage(defaultAvatar); // Fallback to default if 304 or not found
          }
        } catch (error) {
          console.error("Error fetching race image:", error);
          setRaceImage(defaultAvatar); // Fallback on error
        }
      } else {
        setRaceImage(defaultAvatar);
      }
    };
    fetchRaceImage();

    return () => {
      if (raceImage && raceImage.startsWith("blob:")) URL.revokeObjectURL(raceImage);
    };
  }, [selectedRace, selectedGender]);

  const getRaceImage = () => (raceImage || defaultAvatar);

  return (
    <div className="w-1/2 flex flex-col">
      <div className="h-96 relative rounded-lg border border-metin-gold/30 bg-black/40 overflow-hidden">
        {selectedBackground && (
          <div className="absolute inset-0 z-0">
            <img
              src={selectedBackground}
              alt="Fundal selectat"
              className="object-cover opacity-70 w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        )}

        {selectedRace && selectedGender ? (
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="relative w-full h-full">
              <img
                src={getRaceImage()}
                alt={`${selectedRace} ${selectedGender}`}
                className="z-10 object-contain object-bottom w-full h-full"
                style={{ objectPosition: "center 10%" }}
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

        <div className="absolute inset-x-0 top-0 p-3">
          <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-metin-gold/20 inline-block">
            <h2 className="text-metin-gold text-xs uppercase tracking-wider">Previzualizare</h2>
          </div>
        </div>

        {characterName && (
          <div className="absolute inset-x-0 bottom-0 p-3">
            {/* Character name display can be added here if needed */}
          </div>
        )}
      </div>

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
        backgroundImages={backgroundImages}
      />
    </div>
  );
};

export default CharacterPreview;