"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { CharacterForm, CharacterPreview } from "../features/character";
import { useAuth } from '../context/AuthContext';

const FirstLoginPage: React.FC = () => {
  const { currentUser, markCharacterCreated } = useAuth();
  const router = useRouter();
  
  // State for character selection, character name, background, and validity
  const [characterName, setCharacterName] = useState("");
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null); // Male/Female
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null); // Background from Backgrounds
  const [isFormValid, setIsFormValid] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available backgrounds
  const backgrounds = [
    "/Backgrounds/western1.jpg",
    "/Backgrounds/western2.jpg",
    "/Backgrounds/western3.jpg",
    "/Backgrounds/western4.jpg",
  ];

  // Check form validity (name, race, gender, background)
  const checkFormValidity = (name: string, race: string | null, gender: string | null, background: string | null) => {
    setIsFormValid(name.trim().length > 0 && race !== null && gender !== null && background !== null);
  };

  // Handle submit (navigation to GamePage.tsx)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && currentUser) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Creează obiectul cu datele personajului
        const characterData = {
          name: characterName,
          race: selectedRace,
          gender: selectedGender,
          background: selectedBackground
        };
        
        // Trimite datele la server
        const success = await markCharacterCreated(currentUser.characterId, characterData);
        
        if (success) {
          console.log("Character created:", characterData);
          // Navigare către GamePage.tsx
          router.push('/game');
        } else {
          setError("Nu s-a putut salva personajul. Încearcă din nou.");
        }
      } catch (error: any) {
        setError(error.message || "A apărut o eroare la crearea personajului.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Function for navigating between backgrounds
  const navigateBackground = (direction: 'next' | 'prev') => {
    let newIndex;
    if (direction === 'next') {
      newIndex = (backgroundIndex + 1) % backgrounds.length;
    } else {
      newIndex = (backgroundIndex - 1 + backgrounds.length) % backgrounds.length;
    }
    setBackgroundIndex(newIndex);
    setSelectedBackground(backgrounds[newIndex]);
    checkFormValidity(characterName, selectedRace, selectedGender, backgrounds[newIndex]);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        backgroundImage: "url('/assets/images/westin.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="relative w-full max-w-7xl h-[90vh] flex p-6 bg-metin-dark/90 backdrop-blur-lg rounded-xl border border-metin-gold/30 shadow-lg overflow-hidden">
        {/* Decorative futuristic lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-metin-gold/50 to-transparent animate-pulse-slow"></div>
          <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-metin-gold/50 to-transparent animate-pulse-slow"></div>
          <div className="absolute left-0 bottom-0 w-full h-px bg-gradient-to-r from-transparent via-metin-gold/50 to-transparent animate-pulse-slow"></div>
          <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-metin-gold/50 to-transparent animate-pulse-slow"></div>
        </div>
        
        {/* Futuristic header */}
        <div className="absolute top-0 left-0 w-full px-8 py-4 flex justify-between items-center border-b border-metin-gold/20 bg-metin-dark/50 backdrop-blur-md z-10">
          <h1 className="text-3xl font-serif text-metin-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider">
            WESTIN · <span className="text-metin-light/80 text-xl">Crearea Personajului</span>
          </h1>
        </div>

        {/* Display error message if any */}
        {error && (
          <div className="absolute top-16 left-0 right-0 mx-auto w-max p-3 bg-red-500/20 border border-red-600 rounded-lg text-metin-light text-center z-20">
            {error}
          </div>
        )}

        {/* Main layout - two columns */}
        <div className="flex w-full h-full pt-20">
          {/* Left column - Form */}
          <div className="w-1/2 pr-6 overflow-y-auto thin-scrollbar">
            <CharacterForm
              characterName={characterName}
              setCharacterName={setCharacterName}
              selectedRace={selectedRace}
              setSelectedRace={setSelectedRace}
              selectedGender={selectedGender}
              setSelectedGender={setSelectedGender}
              selectedBackground={selectedBackground}
              setSelectedBackground={setSelectedBackground}
              checkFormValidity={checkFormValidity}
              isFormValid={isFormValid}
              handleSubmit={handleSubmit}
              backgroundIndex={backgroundIndex}
              setBackgroundIndex={setBackgroundIndex}
              backgrounds={backgrounds}
              isLoading={isLoading}
            />
          </div>

          {/* Right column - Preview */}
          <CharacterPreview
            selectedRace={selectedRace}
            selectedGender={selectedGender}
            characterName={characterName}
            selectedBackground={selectedBackground}
            backgroundIndex={backgroundIndex}
            backgrounds={backgrounds}
            navigateBackground={navigateBackground}
            setSelectedBackground={setSelectedBackground}
            checkFormValidity={checkFormValidity}
          />
        </div>
      </div>
    </div>
  );
};

export default FirstLoginPage;