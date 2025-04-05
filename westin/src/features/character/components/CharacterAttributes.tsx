import React, { useState, useEffect } from 'react';
import { CLASS_MULTIPLIERS, ATTRIBUTE_BASE_VALUES } from '../../../data/constants';
import { CharacterType } from '../../../types/character';

interface CharacterAttributesProps {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterType;
  onUpdateCharacter: (updatedCharacter: CharacterType) => void;
}

// Mapare între rasele jocului și clasele din CLASS_MULTIPLIERS
const CHARACTER_CLASS_MAPPING: Record<string, keyof typeof CLASS_MULTIPLIERS> = {
  'Barbarian': 'Warrior',
  'Warrior': 'Warrior',
  'Shaman': 'Saman',
  'Saman': 'Saman',
  'Sura': 'Sura',
  'Ninja': 'Ninja',
  'Assasin': 'Ninja'
};

const CharacterAttributes: React.FC<CharacterAttributesProps> = ({
  isOpen,
  onClose,
  character,
  onUpdateCharacter
}) => {
  const [attributes, setAttributes] = useState(character.attributes);
  const [availablePoints, setAvailablePoints] = useState(character.availablePoints);
  const [previewVisible, setPreviewVisible] = useState<string | null>(null);

  // Resetăm starea când se deschide fereastra
  useEffect(() => {
    if (isOpen) {
      setAttributes(character.attributes);
      setAvailablePoints(character.availablePoints);
    }
  }, [isOpen, character]);

  // Determinăm multiplicatorii pentru rasa personajului
  const classMultipliers = CHARACTER_CLASS_MAPPING[character.race] 
    ? CLASS_MULTIPLIERS[CHARACTER_CLASS_MAPPING[character.race]] 
    : CLASS_MULTIPLIERS.Warrior;

  // Calculăm bonusurile pentru fiecare atribut
  const calculateBonus = (attribute: string, value: number): number | { critChance: number; critDamage: number } => {
    const multiplier = classMultipliers[attribute as keyof typeof classMultipliers] || 1;
    
    switch(attribute) {
      case 'vitality':
        return Math.round(ATTRIBUTE_BASE_VALUES.VITALITY_HP_BONUS * value * multiplier);
      case 'intelligence':
        return {
          critChance: +(ATTRIBUTE_BASE_VALUES.INTELLIGENCE_CRIT_CHANCE * value * multiplier).toFixed(1),
          critDamage: Math.round(ATTRIBUTE_BASE_VALUES.INTELLIGENCE_CRIT_DAMAGE * value * multiplier)
        };
      case 'strength':
        return Math.round(ATTRIBUTE_BASE_VALUES.STRENGTH_ATTACK_BONUS * value * multiplier);
      case 'dexterity':
        return Math.round(ATTRIBUTE_BASE_VALUES.DEXTERITY_DEFENSE_BONUS * value * multiplier);
      default:
        return 0;
    }
  };

  // Funcții helper pentru a obține valorile ca numere
  const getVitalityBonus = (value: number): number => {
    return calculateBonus('vitality', value) as number;
  };

  const getStrengthBonus = (value: number): number => {
    return calculateBonus('strength', value) as number;
  };

  const getDexterityBonus = (value: number): number => {
    return calculateBonus('dexterity', value) as number;
  };

  const getIntelligenceBonus = (value: number): { critChance: number; critDamage: number } => {
    return calculateBonus('intelligence', value) as { critChance: number; critDamage: number };
  };

  // Handler pentru incrementarea atributelor
  const handleIncrement = (attribute: keyof typeof attributes) => {
    if (availablePoints > 0) {
      setAttributes(prev => ({
        ...prev,
        [attribute]: prev[attribute] + 1
      }));
      setAvailablePoints(prev => prev - 1);
    }
  };

  // Calculăm valorile care ar fi după aplicarea punctelor
  const calculateNewHp = () => {
    const vitalityBonus = getVitalityBonus(character.attributes.vitality);
    const baseHp = character.hp.max - vitalityBonus;
    const newBonus = getVitalityBonus(attributes.vitality);
    return baseHp + newBonus;
  };

  const calculateNewAttack = () => {
    const strengthBonus = getStrengthBonus(character.attributes.strength);
    const baseAttack = character.attack - strengthBonus;
    const newBonus = getStrengthBonus(attributes.strength);
    return baseAttack + newBonus;
  };

  const calculateNewDefense = () => {
    const dexterityBonus = getDexterityBonus(character.attributes.dexterity);
    const baseDefense = character.defense - dexterityBonus;
    const newBonus = getDexterityBonus(attributes.dexterity);
    return baseDefense + newBonus;
  };

  const calculateNewCritChance = () => {
    const intelligenceBonus = getIntelligenceBonus(character.attributes.intelligence);
    const baseChance = character.critChance - intelligenceBonus.critChance;
    const newBonus = getIntelligenceBonus(attributes.intelligence);
    return +(baseChance + newBonus.critChance).toFixed(1);
  };

  const calculateNewCritDamage = () => {
    const intelligenceBonus = getIntelligenceBonus(character.attributes.intelligence);
    const baseDamage = character.critDamage - intelligenceBonus.critDamage;
    const newBonus = getIntelligenceBonus(attributes.intelligence);
    return baseDamage + newBonus.critDamage;
  };

  // Handler pentru aplicarea schimbărilor
  const handleApply = () => {
    const updatedCharacter = {
      ...character,
      attributes,
      availablePoints,
      hp: {
        ...character.hp,
        max: calculateNewHp()
      },
      attack: calculateNewAttack(),
      defense: calculateNewDefense(),
      critChance: calculateNewCritChance(),
      critDamage: calculateNewCritDamage()
    };
    
    onUpdateCharacter(updatedCharacter);
    onClose();
  };

  // Handler pentru resetarea schimbărilor
  const handleReset = () => {
    setAttributes(character.attributes);
    setAvailablePoints(character.availablePoints);
  };

  if (!isOpen) return null;

  // Funcție helper pentru a afișa bonusul specific clasei
  const getClassBonus = (attribute: keyof typeof classMultipliers) => {
    const multiplier = classMultipliers[attribute];
    return multiplier > 1 ? `(+${((multiplier - 1) * 100).toFixed(0)}%)` : '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      
      <div className="relative z-10 w-full max-w-lg bg-metin-dark/95 border-2 border-metin-gold/40 rounded-lg overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-metin-gold/20 to-transparent p-4 border-b border-metin-gold/30">
          <div className="flex justify-between items-center">
            <h2 className="text-xl text-metin-gold font-semibold">Atribute Personaj</h2>
            <button
              onClick={onClose}
              className="text-metin-gold/80 hover:text-metin-gold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 p-2 bg-black/30 rounded-md border border-metin-gold/20">
            <div className="text-center text-metin-gold font-medium mb-2">
              Puncte disponibile: <span className="text-yellow-400">{availablePoints}</span>
            </div>
            <p className="text-xs text-metin-light/70 text-center">
              Poți adăuga puncte în atributele tale pentru a-ți îmbunătăți caracteristicile
            </p>
          </div>

          <div className="grid gap-4 mb-6">
            {/* Vitalitate */}
            <div 
              className="relative flex items-center justify-between p-3 bg-black/40 rounded-md border border-metin-gold/20 hover:border-metin-gold/50 transition-colors"
              onMouseEnter={() => setPreviewVisible('vitality')}
              onMouseLeave={() => setPreviewVisible(null)}
            >
              <div>
                <div className="flex items-center">
                  <span className="text-metin-gold">Vitalitate</span>
                  <span className="text-metin-gold/60 text-xs ml-1">{getClassBonus('vitality')}</span>
                </div>
                <div className="text-xs text-metin-light/70 mt-1">+{getVitalityBonus(1)} HP per punct</div>
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-metin-dark rounded-md border border-metin-gold/30 mx-2">
                  <span className="text-lg text-metin-gold">{attributes.vitality}</span>
                </div>
                
                <button
                  onClick={() => handleIncrement('vitality')}
                  disabled={availablePoints <= 0}
                  className={`w-8 h-8 rounded-full bg-metin-gold/20 border border-metin-gold/40 flex items-center justify-center text-metin-gold 
                    ${availablePoints <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-metin-gold/30'}`}
                >
                  +
                </button>
              </div>

              {previewVisible === 'vitality' && (
                <div className="absolute -top-10 left-0 right-0 p-2 bg-black/90 rounded border border-metin-gold/30 text-xs text-center text-metin-light z-10">
                  HP: {character.hp.max} → {calculateNewHp()}
                </div>
              )}
            </div>

            {/* Inteligență */}
            <div 
              className="relative flex items-center justify-between p-3 bg-black/40 rounded-md border border-metin-gold/20 hover:border-metin-gold/50 transition-colors"
              onMouseEnter={() => setPreviewVisible('intelligence')}
              onMouseLeave={() => setPreviewVisible(null)}
            >
              <div>
                <div className="flex items-center">
                  <span className="text-metin-gold">Inteligență</span>
                  <span className="text-metin-gold/60 text-xs ml-1">{getClassBonus('intelligence')}</span>
                </div>
                <div className="text-xs text-metin-light/70 mt-1">
                  +{getIntelligenceBonus(1).critChance}% șansă critică, +{getIntelligenceBonus(1).critDamage}% damage critică
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-metin-dark rounded-md border border-metin-gold/30 mx-2">
                  <span className="text-lg text-metin-gold">{attributes.intelligence}</span>
                </div>
                
                <button
                  onClick={() => handleIncrement('intelligence')}
                  disabled={availablePoints <= 0}
                  className={`w-8 h-8 rounded-full bg-metin-gold/20 border border-metin-gold/40 flex items-center justify-center text-metin-gold 
                    ${availablePoints <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-metin-gold/30'}`}
                >
                  +
                </button>
              </div>

              {previewVisible === 'intelligence' && (
                <div className="absolute -top-10 left-0 right-0 p-2 bg-black/90 rounded border border-metin-gold/30 text-xs text-center text-metin-light z-10">
                  Șansă critică: {character.critChance}% → {calculateNewCritChance()}%<br />
                  Damage critică: {character.critDamage}% → {calculateNewCritDamage()}%
                </div>
              )}
            </div>

            {/* Putere */}
            <div 
              className="relative flex items-center justify-between p-3 bg-black/40 rounded-md border border-metin-gold/20 hover:border-metin-gold/50 transition-colors"
              onMouseEnter={() => setPreviewVisible('strength')}
              onMouseLeave={() => setPreviewVisible(null)}
            >
              <div>
                <div className="flex items-center">
                  <span className="text-metin-gold">Putere</span>
                  <span className="text-metin-gold/60 text-xs ml-1">{getClassBonus('strength')}</span>
                </div>
                <div className="text-xs text-metin-light/70 mt-1">+{getStrengthBonus(1)} Attack per punct</div>
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-metin-dark rounded-md border border-metin-gold/30 mx-2">
                  <span className="text-lg text-metin-gold">{attributes.strength}</span>
                </div>
                
                <button
                  onClick={() => handleIncrement('strength')}
                  disabled={availablePoints <= 0}
                  className={`w-8 h-8 rounded-full bg-metin-gold/20 border border-metin-gold/40 flex items-center justify-center text-metin-gold 
                    ${availablePoints <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-metin-gold/30'}`}
                >
                  +
                </button>
              </div>

              {previewVisible === 'strength' && (
                <div className="absolute -top-10 left-0 right-0 p-2 bg-black/90 rounded border border-metin-gold/30 text-xs text-center text-metin-light z-10">
                  Attack: {character.attack} → {calculateNewAttack()}
                </div>
              )}
            </div>

            {/* Dexteritate */}
            <div 
              className="relative flex items-center justify-between p-3 bg-black/40 rounded-md border border-metin-gold/20 hover:border-metin-gold/50 transition-colors"
              onMouseEnter={() => setPreviewVisible('dexterity')}
              onMouseLeave={() => setPreviewVisible(null)}
            >
              <div>
                <div className="flex items-center">
                  <span className="text-metin-gold">Dexteritate</span>
                  <span className="text-metin-gold/60 text-xs ml-1">{getClassBonus('dexterity')}</span>
                </div>
                <div className="text-xs text-metin-light/70 mt-1">+{getDexterityBonus(1)} Defense per punct</div>
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-metin-dark rounded-md border border-metin-gold/30 mx-2">
                  <span className="text-lg text-metin-gold">{attributes.dexterity}</span>
                </div>
                
                <button
                  onClick={() => handleIncrement('dexterity')}
                  disabled={availablePoints <= 0}
                  className={`w-8 h-8 rounded-full bg-metin-gold/20 border border-metin-gold/40 flex items-center justify-center text-metin-gold 
                    ${availablePoints <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-metin-gold/30'}`}
                >
                  +
                </button>
              </div>

              {previewVisible === 'dexterity' && (
                <div className="absolute -top-10 left-0 right-0 p-2 bg-black/90 rounded border border-metin-gold/30 text-xs text-center text-metin-light z-10">
                  Defense: {character.defense} → {calculateNewDefense()}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-metin-dark border border-metin-gold/40 rounded-md text-metin-gold hover:bg-metin-gold/20 transition-colors"
            >
              Resetează
            </button>
            
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-metin-gold/20 border border-metin-gold/60 rounded-md text-metin-gold hover:bg-metin-gold/30 transition-colors"
            >
              Aplică
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterAttributes; 