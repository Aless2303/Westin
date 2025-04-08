import React, { useState } from 'react';

interface MoneyDisplayProps {
  cash: number;
  bank: number;
}

const MoneyDisplay: React.FC<MoneyDisplayProps> = ({ cash, bank }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Format numbers with thousand separators
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const hideDisplay = () => {
    setIsVisible(false);
    setShowDetails(false); // Asigurăm că detaliile sunt și ele închise
  };

  if (!isVisible) {
    return (
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-metin-dark/95 border border-metin-gold/40 flex items-center justify-center text-metin-gold text-sm sm:text-base hover:bg-metin-gold/20 transition-colors shadow-lg"
          title="Afișează banii"
        >
          ¥
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
      <div 
        className="relative bg-metin-dark/95 backdrop-blur-sm border border-metin-gold/40 rounded-lg px-2 py-1 sm:px-4 sm:py-2 flex items-center"
      >
        {/* Yang Icon */}
        <div className="relative w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-300 flex items-center justify-center text-black text-[10px] sm:text-xs font-bold">
            ¥
          </div>
        </div>
        
        {/* Yang Amount */}
        <div className="text-metin-gold font-semibold text-sm sm:text-base">
          {formatNumber(cash)} Yang
        </div>

        {/* Buton de închidere completă */}
        <button
          onClick={hideDisplay}
          className="ml-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-metin-dark border border-metin-gold/50 flex items-center justify-center text-metin-gold text-[10px] sm:text-xs hover:bg-metin-gold/20 transition-colors z-20"
          title="Ascunde fereastra"
        >
          ×
        </button>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-metin-dark/95 backdrop-blur-sm border border-metin-gold/40 rounded-lg px-2 py-2 sm:px-4 sm:py-3 z-10 shadow-lg w-[180px] sm:w-[240px] mx-auto"
          onClick={toggleDetails} // Click pe panou îl închide (comportament original)
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div>
              <div className="text-metin-light/70 text-[10px] sm:text-xs mb-1">Yang (Cash)</div>
              <div className="text-metin-gold font-semibold text-sm sm:text-base">{formatNumber(cash)}</div>
            </div>
            <div>
              <div className="text-metin-light/70 text-[10px] sm:text-xs mb-1">Yang (Bank)</div>
              <div className="text-metin-gold font-semibold text-sm sm:text-base">{formatNumber(bank)}</div>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-1 sm:pt-2 border-t border-metin-gold/20">
            <div className="text-metin-light/70 text-[10px] sm:text-xs mb-1">Total Yang</div>
            <div className="text-metin-gold font-semibold text-sm sm:text-base">{formatNumber(cash + bank)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyDisplay;