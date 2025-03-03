import React from 'react';

interface Race {
  name: string;
  description: string;
}

interface RaceSelectorProps {
  selectedRace: string | null;
  setSelectedRace: (race: string) => void;
}

const RaceSelector: React.FC<RaceSelectorProps> = ({ selectedRace, setSelectedRace }) => {
  // Races available (inspired by Metin2)
  const races = [
    { name: "Warrior", description: "Războinic puternic, maestru al armelor grele și al atacurilor devastatoare." },
    { name: "Ninja", description: "Asasin rapid, specializat în stealth, atacuri surpriză și arme ascunse." },
    { name: "Sura", description: "Luptător versatil, combinând forța fizică cu magia elementară pentru atacuri puternice." },
    { name: "Shaman", description: "Mistic spiritual, controlând natura și invocând spirite pentru a sprijini sau lupta." },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-base uppercase font-medium text-metin-gold/90 tracking-wider">
        Clasă
      </label>
      <div className="grid grid-cols-2 gap-3">
        {races.map((race) => (
          <button
            key={race.name}
            type="button"
            onClick={() => setSelectedRace(race.name)}
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
  );
};

export default RaceSelector;