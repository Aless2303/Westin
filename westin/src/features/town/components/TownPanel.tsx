import React from 'react';
import Image from 'next/image';
import { useTown } from './TownContext';
import GeneralMarket from '../market/GeneralMarket';
import Bank from '../bank/Bank';

const TownPanel: React.FC = () => {
  const { 
    isTownOpen, 
    setIsTownOpen, 
    isMarketOpen, 
    setIsMarketOpen, 
    isBankOpen, 
    setIsBankOpen, 
    characterData
  } = useTown();

  const handleOpenMarket = () => {
    setIsMarketOpen(true);
  };

  const handleOpenBank = () => {
    setIsBankOpen(true);
  };

  const handleClose = () => {
    setIsTownOpen(false);
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NPC Magazin General */}
            <div 
              className="bg-metin-dark/80 border border-metin-gold/30 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-metin-dark/60 transition-colors h-64"
              onClick={handleOpenMarket}
            >
              <div className="relative w-36 h-36 mb-4 flex items-center justify-center">
                <Image 
                  src="/npc/GeneralMarket.png" 
                  alt="Magazin General" 
                  width={100} 
                  height={100}
                  className="object-contain max-h-full"
                  style={{ objectPosition: 'center center' }}
                />
              </div>
              <h3 className="text-metin-gold font-semibold text-lg">Magazin General</h3>
              <p className="text-gray-400 text-sm text-center mt-2">
                Cumpără echipamente și obiecte pentru aventura ta
              </p>
            </div>

            {/* NPC Depozit */}
            <div 
              className="bg-metin-dark/80 border border-metin-gold/30 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-metin-dark/60 transition-colors h-64"
              onClick={handleOpenBank}
            >
              <div className="relative w-36 h-36 mb-4 flex items-center justify-center">
                <Image 
                  src="/npc/Depozit.png" 
                  alt="Depozit" 
                  width={100} 
                  height={100}
                  className="object-contain max-h-full"
                  style={{ objectPosition: 'center center' }}
                />
              </div>
              <h3 className="text-metin-gold font-semibold text-lg">Depozit</h3>
              <p className="text-gray-400 text-sm text-center mt-2">
                Depozitează sau retrage bani în siguranță
              </p>
            </div>
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