import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTown } from './TownContext';
import { useWorks } from '../../works/context/WorksContext';
import GeneralMarket from '../market/GeneralMarket';
import Bank from '../bank/Bank';

const TownPanel: React.FC = () => {
  const { 
    isTownOpen, 
    setIsTownOpen, 
    isMarketOpen, 
    setIsMarketOpen, 
    isBankOpen, 
    setIsBankOpen
  } = useTown();
  
  const { addJob, characterPosition } = useWorks();
  const [travelTime, setTravelTime] = useState<number>(0);

  // Coordonatele orașului
  const townX = 1420;
  const townY = 1060;

  // Calculăm timpul de deplasare estimat când se deschide panoul
  useEffect(() => {
    if (isTownOpen && characterPosition) {
      const distance = Math.sqrt(
        Math.pow(townX - characterPosition.x, 2) + Math.pow(townY - characterPosition.y, 2)
      );
      
      // Convertim la secunde (speed ratio: 141.42 units = 1 minute)
      const seconds = Math.round((distance / 141.42) * 60);
      setTravelTime(Math.max(1, seconds));
    }
  }, [isTownOpen, characterPosition]);

  // Formatează timpul de deplasare într-un format ușor de citit
  const formatTravelTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} secunde`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 
        ? `${minutes} minute și ${remainingSeconds} secunde` 
        : `${minutes} minute`;
    }
  };

  const handleOpenMarket = () => {
    setIsMarketOpen(true);
  };

  const handleOpenBank = () => {
    setIsBankOpen(true);
  };

  const handleClose = () => {
    setIsTownOpen(false);
  };
  
  // Handler pentru somn
  const handleSleep = () => {
    if (addJob) {
      // Creăm un job de somn
      const sleepJob = {
        type: '1h' as '15s' | '10m' | '1h',
        remainingTime: 7200, // 2 ore în secunde
        travelTime: travelTime, // Folosim timpul de deplasare calculat
        isInProgress: false, // Obligatoriu începem cu faza de călătorie
        mobName: 'Patul din Han',
        mobImage: '/npc/bed.png',
        mobX: townX,
        mobY: townY,
        staminaCost: 0, // Nu consumă stamina
        mobHp: 0,
        mobLevel: 0,
        mobAttack: 0,
        mobExp: 0,
        mobYang: 0,
        mobType: 'sleep', // Folosim noul tip 'sleep' în loc de 'metin'
        originalJobTime: 7200, // Explicit setăm timpul original al job-ului
      };
      
      // Adăugăm job-ul și închidem panoul dacă job-ul a fost adăugat cu succes
      if (addJob(sleepJob)) {
        console.log("Job de somn adăugat cu succes, început deplasarea spre Han");
        setIsTownOpen(false);
      }
    }
  };
  
  // Handler pentru deplasare în oraș
  const handleTravelToTown = () => {
    if (addJob) {
      // Creăm un job doar pentru deplasare
      const travelJob = {
        type: '15s' as '15s' | '10m' | '1h', // Folosim 15s dar va fi doar pentru deplasare
        remainingTime: 1, // Timp minim pentru job, va fi ignorat practic
        travelTime: travelTime, // Folosim timpul de deplasare calculat
        isInProgress: false, // Obligatoriu începem cu faza de călătorie
        mobName: 'Orașul Westin',
        mobImage: '/npc/town_icon.png', // Poți înlocui cu o imagine relevantă
        mobX: townX,
        mobY: townY,
        staminaCost: 0, // Nu consumă stamina
        mobHp: 0,
        mobLevel: 0,
        mobAttack: 0,
        mobExp: 50, // 50 XP simbolic pentru deplasare
        mobYang: 0,
        mobType: 'town', // Folosim noul tip 'town' în loc de 'metin'
        originalJobTime: 1, // Timp minim pentru faza de "job"
      };
      
      // Adăugăm job-ul și închidem panoul dacă job-ul a fost adăugat cu succes
      if (addJob(travelJob)) {
        console.log("Job de deplasare adăugat cu succes, început deplasarea spre Oraș");
        setIsTownOpen(false);
      }
    }
  };

  if (!isTownOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center">
        <div className="relative w-full max-w-4xl bg-metin-dark border-2 border-metin-gold/60 rounded-lg shadow-xl p-6 z-50">
          <div className="absolute top-2 right-2">
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h2 className="text-2xl text-metin-gold font-bold mb-4 text-center">Orașul Westin</h2>
          <p className="text-gray-300 mb-8 text-center">Selectează un NPC cu care dorești să interacționezi</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* NPC Magazin General */}
            <div 
              className="bg-metin-dark/80 border border-metin-gold/30 rounded-lg overflow-hidden cursor-pointer hover:bg-metin-dark/60 transition-colors flex flex-col"
              onClick={handleOpenMarket}
            >
              {/* Container pentru imagine */}
              <div className="flex-1 flex items-center justify-center p-4 min-h-[240px]">
                <Image 
                  src="/npc/GeneralMarket.png" 
                  alt="Magazin General" 
                  width={120}
                  height={120}
                  className="object-contain max-h-full"
                />
              </div>
              
              {/* Container pentru text */}
              <div className="w-full bg-black/40 border-t border-metin-gold/30 p-4">
                <h3 className="text-metin-gold font-semibold text-lg text-center">Magazin General</h3>
                <p className="text-gray-400 text-sm text-center mt-2">
                  Cumpără echipamente și obiecte pentru aventura ta
                </p>
              </div>
            </div>

            {/* NPC Depozit */}
            <div 
              className="bg-metin-dark/80 border border-metin-gold/30 rounded-lg overflow-hidden cursor-pointer hover:bg-metin-dark/60 transition-colors flex flex-col"
              onClick={handleOpenBank}
            >
              {/* Container pentru imagine */}
              <div className="flex-1 flex items-center justify-center p-4 min-h-[240px]">
                <Image 
                  src="/npc/Depozit.png" 
                  alt="Depozit" 
                  width={120}
                  height={120}
                  className="object-contain max-h-full"
                />
              </div>
              
              {/* Container pentru text */}
              <div className="w-full bg-black/40 border-t border-metin-gold/30 p-4">
                <h3 className="text-metin-gold font-semibold text-lg text-center">Depozit</h3>
                <p className="text-gray-400 text-sm text-center mt-2">
                  Depozitează sau retrage bani în siguranță
                </p>
              </div>
            </div>
            
            {/* NPC Han pentru somn */}
            <div 
              className="bg-metin-dark/80 border border-metin-gold/30 rounded-lg overflow-hidden cursor-pointer hover:bg-metin-dark/60 transition-colors flex flex-col"
              onClick={handleSleep}
            >
              {/* Container pentru imagine */}
              <div className="flex-1 flex items-center justify-center p-4 min-h-[240px]">
                <Image 
                  src="/npc/bed.png" 
                  alt="Han" 
                  width={120}
                  height={120}
                  className="object-contain max-h-full"
                />
              </div>
              
              {/* Container pentru text */}
              <div className="w-full bg-black/40 border-t border-metin-gold/30 p-4">
                <h3 className="text-metin-gold font-semibold text-lg text-center">Han</h3>
                <p className="text-gray-400 text-sm text-center mt-2">
                  Odihnește-te pentru a-ți regenera HP și stamina
                </p>
              </div>
            </div>
          </div>
          
          {/* Buton pentru deplasare în oraș */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleTravelToTown}
              className="bg-metin-dark border-2 border-metin-gold/50 hover:bg-metin-gold/20 text-metin-gold px-6 py-3 rounded-lg shadow-lg transition-all hover:shadow-metin-gold/20 flex items-center"
            >
              <span className="mr-2">🏙️</span>
              <span>Deplasează-te în oraș</span>
              {travelTime > 0 && (
                <span className="ml-3 text-xs bg-black/40 py-1 px-2 rounded-md">
                  {formatTravelTime(travelTime)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Render sub-components when open */}
      {isMarketOpen && <GeneralMarket />}
      {isBankOpen && <Bank />}
    </>
  );
};

export default TownPanel;