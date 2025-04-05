import React, { useState } from 'react';

interface MoneyDisplayProps {
  cash: number;
  bank: number;
}

const MoneyDisplay: React.FC<MoneyDisplayProps> = ({ cash, bank }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Format numbers with thousand separators
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
      <div 
        className="relative bg-metin-dark/95 backdrop-blur-sm border border-metin-gold/40 rounded-lg px-4 py-2 flex items-center cursor-pointer hover:bg-metin-dark/80 transition-colors"
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* Yang Icon */}
        <div className="relative w-5 h-5 mr-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-300 flex items-center justify-center text-black text-xs font-bold">
            ¥
          </div>
        </div>
        
        {/* Yang Amount */}
        <div className="text-metin-gold font-semibold">
          {formatNumber(cash)} Yang
        </div>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-metin-dark/95 backdrop-blur-sm border border-metin-gold/40 rounded-lg px-4 py-3 z-10 shadow-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-metin-light/70 text-xs mb-1">Yang (Cash)</div>
              <div className="text-metin-gold font-semibold">{formatNumber(cash)}</div>
            </div>
            <div>
              <div className="text-metin-light/70 text-xs mb-1">Yang (Bank)</div>
              <div className="text-metin-gold font-semibold">{formatNumber(bank)}</div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-metin-gold/20">
            <div className="text-metin-light/70 text-xs mb-1">Total Yang</div>
            <div className="text-metin-gold font-semibold">{formatNumber(cash + bank)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyDisplay; 