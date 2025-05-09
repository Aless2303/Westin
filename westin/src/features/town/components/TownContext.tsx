import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CharacterType } from '../../../types/character';

interface TownContextType {
  isTownOpen: boolean;
  setIsTownOpen: (isOpen: boolean) => void;
  isMarketOpen: boolean;
  setIsMarketOpen: (isOpen: boolean) => void;
  isBankOpen: boolean;
  setIsBankOpen: (isOpen: boolean) => void;
  characterData: CharacterType | null;
  setCharacterData: (data: CharacterType) => void;
}

const TownContext = createContext<TownContextType | undefined>(undefined);

interface TownProviderProps {
  children: ReactNode;
  characterData: CharacterType;
}

export const TownProvider: React.FC<TownProviderProps> = ({ children, characterData: initialCharacterData }) => {
  const [isTownOpen, setIsTownOpen] = useState(false);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [characterData, setCharacterData] = useState<CharacterType>(initialCharacterData);
  
  // Update the internal character data when the prop changes
  useEffect(() => {
    setCharacterData(initialCharacterData);
  }, [initialCharacterData]);

  return (
    <TownContext.Provider
      value={{
        isTownOpen,
        setIsTownOpen,
        isMarketOpen,
        setIsMarketOpen,
        isBankOpen,
        setIsBankOpen,
        characterData,
        setCharacterData
      }}
    >
      {children}
    </TownContext.Provider>
  );
};

export const useTown = (): TownContextType => {
  const context = useContext(TownContext);
  if (context === undefined) {
    throw new Error('useTown must be used within a TownProvider');
  }
  return context;
};

export default TownContext; 