import React from 'react';

interface GenderSelectorProps {
  selectedGender: string | null;
  setSelectedGender: (gender: string) => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ selectedGender, setSelectedGender }) => {
  return (
    <div className="space-y-2">
      <label className="block text-base uppercase font-medium text-metin-gold/90 tracking-wider">
        Gen
      </label>
      <div className="flex gap-4 justify-center">
        {["Masculin", "Feminin"].map((gender) => (
          <button
            key={gender}
            type="button"
            onClick={() => setSelectedGender(gender)}
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
  );
};

export default GenderSelector;