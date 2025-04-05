import { ProfileType } from '../../types/profile';
import { mockCharacterData } from './character';

// Mock profile data (based on the character data, but extended with profile-specific fields)
export const mockProfileData: ProfileType = {
  name: mockCharacterData.name,
  level: mockCharacterData.level,
  race: mockCharacterData.race,
  gender: mockCharacterData.gender,
  background: mockCharacterData.background,
  image: `/Races/${mockCharacterData.gender.toLowerCase()}/${mockCharacterData.race.toLowerCase()}.png`,
  duelsWon: 47,
  duelsLost: 12,
  motto: "Cel mai rapid pistolar din vest. Mereu pe urmele aventurii și a recompensei.",
  experience: mockCharacterData.experience
};

export default mockProfileData;


