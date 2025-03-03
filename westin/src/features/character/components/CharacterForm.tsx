import React from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/form/Input';
import GenderSelector from './GenderSelector';
import RaceSelector from './RaceSelector';
import BackgroundSelector from './BackgroundSelector';

interface CharacterFormProps {
  characterName: string;
  setCharacterName: (name: string) => void;
  selectedRace: string | null;
  setSelectedRace: (race: string | null) => void;
  selectedGender: string | null;
  setSelectedGender: (gender: string | null) => void;
  selectedBackground: string | null;
  setSelectedBackground: (background: string | null) => void;
  checkFormValidity: (name: string, race: string | null, gender: string | null, background: string | null) => void;
  isFormValid: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  backgroundIndex: number;
  setBackgroundIndex: (index: number) => void;
  backgrounds: string[];
}

const CharacterForm: React.FC<CharacterFormProps> = ({
  characterName,
  setCharacterName,
  selectedRace,
  setSelectedRace,
  selectedGender,
  setSelectedGender,
  selectedBackground,
  setSelectedBackground,
  checkFormValidity,
  isFormValid,
  handleSubmit,
  backgroundIndex,
  setBackgroundIndex,
  backgrounds
}) => {
  return (
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

      <GenderSelector
        selectedGender={selectedGender}
        setSelectedGender={(gender) => {
          setSelectedGender(gender);
          checkFormValidity(characterName, selectedRace, gender, selectedBackground);
        }}
      />

      <RaceSelector
        selectedRace={selectedRace}
        setSelectedRace={(race) => {
          setSelectedRace(race);
          checkFormValidity(characterName, race, selectedGender, selectedBackground);
        }}
      />

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
  );
};

export default CharacterForm;