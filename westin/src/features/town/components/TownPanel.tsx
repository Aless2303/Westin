import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTown } from './TownContext';
import { useWorks } from '../../works/context/WorksContext';
import GeneralMarket from '../market/GeneralMarket';
import Bank from '../bank/Bank';

const TownPanel: React.FC = () => {
  const { isTownOpen, setIsTownOpen, isMarketOpen, setIsMarketOpen, isBankOpen, setIsBankOpen } = useTown();
  const { addJob, characterPosition } = useWorks();
  const [travelTime, setTravelTime] = useState<number>(0);

  const townX = 1420;
  const townY = 1060;

  useEffect(() => {
    if (isTownOpen && characterPosition) {
      const distance = Math.sqrt(
        Math.pow(townX - characterPosition.x, 2) + Math.pow(townY - characterPosition.y, 2)
      );
      const seconds = Math.round((distance / 141.42) * 60);
      setTravelTime(Math.max(1, seconds));
    }
  }, [isTownOpen, characterPosition]);

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

  const handleSleep = () => {
    if (addJob) {
      const sleepJob = {
        type: '15s' as '15s' | '10m' | '1h',
        remainingTime: 15,
        travelTime: travelTime,
        isInProgress: false,
        mobName: 'Patul din Han',
        mobImage: '/npc/bed.png',
        mobX: townX,
        mobY: townY,
        staminaCost: 0,
        mobHp: 0,
        mobLevel: 0,
        mobAttack: 0,
        mobExp: 0,
        mobYang: 0,
        mobType: 'sleep',
        originalJobTime: 15,
      };
      if (addJob(sleepJob)) {
        console.log("Job de somn adăugat cu succes, început deplasarea spre Han");
        setIsTownOpen(false);
      }
    }
  };

  const handleTravelToTown = () => {
    if (addJob) {
      const travelJob = {
        type: '15s' as '15s' | '10m' | '1h',
        remainingTime: 1,
        travelTime: travelTime,
        isInProgress: false,
        mobName: 'Orașul Westin',
        mobImage: '/npc/town_icon.png',
        mobX: townX,
        mobY: townY,
        staminaCost: 0,
        mobHp: 0,
        mobLevel: 0,
        mobAttack: 0,
        mobExp: 50,
        mobYang: 0,
        mobType: 'town',
        originalJobTime: 1,
      };
      if (addJob(travelJob)) {
        console.log("Job de deplasare adăugat cu succes, început deplasarea spre Oraș");
        setIsTownOpen(false);
      }
    }
  };

  if (!isTownOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="relative w-full max-w-[360px] sm:max-w-2xl md:max-w-4xl bg-metin-dark border-2 border-metin-gold/60 rounded-lg shadow-xl p-3 sm:p-6">
          <div className="absolute top-2 right-2">
            <button onClick={handleClose} className="text-gray-400 hover:text-white focus:outline-none">
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h2 className="text-lg sm:text-2xl text-metin-gold font-bold mb-2 sm:mb-4 text-center">Orașul Westin</h2>
          <p className="text-gray-300 mb-4 sm:mb-6 text-center text-xs sm:text-base">
            Selectează un NPC cu care dorești să interacționezi
          </p>

          <div className="space-y-3 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-4 sm:space-y-0">
            <div
              className="bg-metin-dark/80 border border-metin-gold/30 rounded-lg overflow-hidden cursor-pointer hover:bg-metin-dark/60 transition-colors flex flex-col"
              onClick={handleOpenMarket}
            >
              <div className="flex-1 flex items-center justify-center p-2 sm:p-4 min-h-[120px] sm:min-h-[180px]">
                <Image
                  src="/npc/GeneralMarket.png"
                  alt="Magazin General"
                  width={80}
                  height={80}
                  className="object-contain max-h-full"
                />
              </div>
              <div className="w-full bg-black/40 border-t border-metin-gold/30 p-2 sm:p-4">
                <h3 className="text-metin-gold font-semibold text-sm sm:text-lg text-center">Magazin General</h3>
                <p className="text-gray-400 text-[10px] sm:text-sm text-center mt-1 sm:mt-2">
                  Cumpără echipamente și obiecte pentru aventura ta
                </p>
              </div>
            </div>

            <div
              className="bg-metin-dark/80 border border-metin-gold/30 rounded-lg overflow-hidden cursor-pointer hover:bg-metin-dark/60 transition-colors flex flex-col"
              onClick={handleOpenBank}
            >
              <div className="flex-1 flex items-center justify-center p-2 sm:p-4 min-h-[120px] sm:min-h-[180px]">
                <Image
                  src="/npc/Depozit.png"
                  alt="Depozit"
                  width={80}
                  height={80}
                  className="object-contain max-h-full"
                />
              </div>
              <div className="w-full bg-black/40 border-t border-metin-gold/30 p-2 sm:p-4">
                <h3 className="text-metin-gold font-semibold text-sm sm:text-lg text-center">Depozit</h3>
                <p className="text-gray-400 text-[10px] sm:text-sm text-center mt-1 sm:mt-2">
                  Depozitează sau retrage bani în siguranță
                </p>
              </div>
            </div>

            <div
              className="bg-metin-dark/80 border border-metin-gold/30 rounded-lg overflow-hidden cursor-pointer hover:bg-metin-dark/60 transition-colors flex flex-col"
              onClick={handleSleep}
            >
              <div className="flex-1 flex items-center justify-center p-2 sm:p-4 min-h-[120px] sm:min-h-[180px]">
                <Image
                  src="/npc/bed.png"
                  alt="Han"
                  width={80}
                  height={80}
                  className="object-contain max-h-full"
                />
              </div>
              <div className="w-full bg-black/40 border-t border-metin-gold/30 p-2 sm:p-4">
                <h3 className="text-metin-gold font-semibold text-sm sm:text-lg text-center">Han</h3>
                <p className="text-gray-400 text-[10px] sm:text-sm text-center mt-1 sm:mt-2">
                  Odihnește-te pentru a-ți regenera HP și stamina
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex justify-center">
            <button
              onClick={handleTravelToTown}
              className="bg-metin-dark border-2 border-metin-gold/50 hover:bg-metin-gold/20 text-metin-gold px-3 sm:px-6 py-1 sm:py-3 rounded-lg shadow-lg transition-all hover:shadow-metin-gold/20 flex items-center text-xs sm:text-base"
            >
              <span className="mr-1 sm:mr-2">🏙️</span>
              <span>Deplasează-te în oraș</span>
              {travelTime > 0 && (
                <span className="ml-2 sm:ml-3 text-[10px] sm:text-xs bg-black/40 py-0.5 sm:py-1 px-1 sm:px-2 rounded-md">
                  {formatTravelTime(travelTime)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMarketOpen && <GeneralMarket />}
      {isBankOpen && <Bank />}
    </>
  );
};

export default TownPanel;