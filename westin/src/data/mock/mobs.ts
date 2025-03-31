import { MobType } from '../../types/mob';
import mobiData from '../mobi.json';

// Cast datele din JSON la tipul corect
export const mockMobs: MobType[] = mobiData as MobType[];

export default mockMobs; 