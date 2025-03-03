"use client";
import React, { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/form/Input";
import Image from "next/image";

const FirstLoginPage: React.FC = () => {
  // State pentru alegerea rasei, genului, numelui caracterului, fundalului, și validitate
  const [characterName, setCharacterName] = useState("");
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null); // Masculin/Feminin
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null); // Fundal din Backgrounds
  const [isFormValid, setIsFormValid] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  // Rase disponibile (inspirate de Metin2)
  const races = [
    { name: "Warrior", description: "Războinic puternic, maestru al armelor grele și al atacurilor devastatoare." },
    { name: "Ninja", description: "Asasin rapid, specializat în stealth, atacuri surpriză și arme ascunse." },
    { name: "Sura", description: "Luptător versatil, combinând forța fizică cu magia elementară pentru atacuri puternice." },
    { name: "Shaman", description: "Mistic spiritual, controlând natura și invocând spirite pentru a sprijini sau lupta." },
  ];

  // Fundaluri disponibile
  const backgrounds = [
    "/Backgrounds/western1.jpg",
    "/Backgrounds/western2.jpg",
    "/Backgrounds/western3.jpg",
    "/Backgrounds/western4.jpg",
  ];

  // Căi către imagini pentru rase și genuri
  const getRaceImage = (race: string, gender: string) => {
    return `/Races/${gender.toLowerCase()}/${race.toLowerCase()}.png`;
  };

  // Verificare validitate formular (nume, rasă, gen, fundal)
  const checkFormValidity = (name: string, race: string | null, gender: string | null, background: string | null) => {
    setIsFormValid(name.trim().length > 0 && race !== null && gender !== null && background !== null);
  };

  // Handler pentru submit (navigare către GamePage.tsx)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      console.log("Caracter creat:", { characterName, selectedRace, selectedGender, selectedBackground });
      // Aici vei adăuga logica reală (de exemplu, salvare în context/backend)
      // După salvare, poți naviga către GamePage.tsx (folosind Next.js useRouter)
    }
  };

  // Funcție pentru navigarea între fundaluri
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
        {/* Linii decorative futuriste */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-metin-gold/50 to-transparent animate-pulse-slow"></div>
          <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-metin-gold/50 to-transparent animate-pulse-slow"></div>
          <div className="absolute left-0 bottom-0 w-full h-px bg-gradient-to-r from-transparent via-metin-gold/50 to-transparent animate-pulse-slow"></div>
          <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-metin-gold/50 to-transparent animate-pulse-slow"></div>
        </div>
        
        {/* Header futurist */}
        <div className="absolute top-0 left-0 w-full px-8 py-4 flex justify-between items-center border-b border-metin-gold/20 bg-metin-dark/50 backdrop-blur-md z-10">
          <h1 className="text-3xl font-serif text-metin-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider">
            WESTIN · <span className="text-metin-light/80 text-xl">Crearea Personajului</span>
          </h1>
        </div>

        {/* Layout principal - două coloane */}
        <div className="flex w-full h-full pt-20">
          {/* Coloana stânga - Formular */}
          <div className="w-1/2 pr-6 overflow-y-auto thin-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-base uppercase font-medium text-metin-gold/90 tracking-wider">
                  Nume Caracter
                </label>
                <Input
                  type="text"
                  value={characterName}
                  onChange={(e) => {
                    setCharacterName(e.target.value);
                    checkFormValidity(e.target.value, selectedRace, selectedGender, selectedBackground);
                  }}
                  placeholder="Alege un nume epic"
                  className="py-2 border-metin-gold/30 bg-black/40 focus:ring-metin-gold/50 text-metin-light"
                />
              </div>

              {/* Selectare gen - design circular, mai compact */}
              <div className="space-y-2">
                <label className="block text-base uppercase font-medium text-metin-gold/90 tracking-wider">
                  Gen
                </label>
                <div className="flex gap-4 justify-center">
                  {["Masculin", "Feminin"].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => {
                        setSelectedGender(gender);
                        checkFormValidity(characterName, selectedRace, gender, selectedBackground);
                      }}
                      className={`relative group flex-1 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                        selectedGender === gender
                          ? "border-2 border-metin-gold shadow-[0_0_15px_rgba(200,164,88,0.3)]"
                          : "border border-metin-gold/20 hover:border-metin-gold/50"
                      }`}
                    >
                      <div className={`absolute inset-0 ${selectedGender === gender ? 'bg-metin-gold/20' : 'bg-black/50 group-hover:bg-black/40'} transition-all duration-300`}></div>
                      <div className="relative z-10 flex flex-col items-center justify-center h-full">
                        {/* Icon de gen */}
                        <div className={`text-xl ${selectedGender === gender ? 'text-metin-gold' : 'text-metin-light/70'}`}>
                          {gender === "Masculin" ? "♂" : "♀"}
                        </div>
                        <div className={`text-sm ${selectedGender === gender ? 'text-metin-light' : 'text-metin-light/70'}`}>
                          {gender}
                        </div>
                      </div>
                      
                      {/* Efect de highlight când este selectat */}
                      {selectedGender === gender && (
                        <div className="absolute inset-0 bg-metin-gold/10 border border-metin-gold/30"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selectare rasă - design de carduri mai modern */}
              <div className="space-y-2">
                <label className="block text-base uppercase font-medium text-metin-gold/90 tracking-wider">
                  Clasă
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {races.map((race) => (
                    <button
                      key={race.name}
                      type="button"
                      onClick={() => {
                        setSelectedRace(race.name);
                        checkFormValidity(characterName, race.name, selectedGender, selectedBackground);
                      }}
                      className={`group relative p-3 rounded-lg border transition-all duration-300 text-left h-24 overflow-hidden ${
                        selectedRace === race.name
                          ? "border-metin-gold shadow-[0_0_15px_rgba(200,164,88,0.3)]"
                          : "border-metin-gold/20 hover:border-metin-gold/50"
                      }`}
                    >
                      <div className={`absolute inset-0 ${selectedRace === race.name ? 'bg-metin-gold/20' : 'bg-black/50 group-hover:bg-black/40'} transition-all duration-300`}></div>
                      
                      <div className="relative z-10">
                        <h3 className={`text-lg font-bold ${selectedRace === race.name ? 'text-metin-gold' : 'text-metin-light'}`}>{race.name}</h3>
                        <p className="text-xs text-metin-light/70 line-clamp-2 mt-1">{race.description}</p>
                      </div>
                      
                      {/* Indicatorul de selecție */}
                      {selectedRace === race.name && (
                        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-metin-gold"></div>
                      )}
                      
                      {/* Efect de linie animată la bottom când este selectat */}
                      {selectedRace === race.name && (
                        <div className="absolute bottom-0 left-0 h-0.5 bg-metin-gold animate-pulse-slow" style={{ width: '100%' }}></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full py-3 px-4 bg-gradient-to-b from-metin-gold to-metin-gold/80 text-metin-dark font-bold rounded-lg shadow-md transition-all duration-300 ${
                    !isFormValid
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:from-metin-gold/90 hover:to-metin-gold/70 hover:shadow-lg active:transform active:scale-98"
                  }`}
                >
                  CREARE PERSONAJ
                </Button>
              </div>
            </form>
          </div>

          {/* Coloana dreapta - Previzualizare */}
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

                </div>
              )}
            </div>

            {/* Background selector - slider style */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstLoginPage;