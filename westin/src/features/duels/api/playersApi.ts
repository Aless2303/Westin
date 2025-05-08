import axios from 'axios';
import { PlayerType } from '../types';

const API_URL = 'http://localhost:5000/api/characters';

/**
 * Fetch nearby players for duels
 * @param distance Optional max distance parameter (default is handled by server)
 * @returns Array of nearby players
 */
export const fetchNearbyPlayers = async (distance?: number): Promise<PlayerType[]> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Authentication required - No token found');
      return [];
    }
    
    const params: Record<string, string> = {};
    if (distance) {
      params.distance = distance.toString();
    }
    
    console.log('Fetching nearby players with params:', params);
    
    const response = await axios.get(`${API_URL}/nearby`, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const playersData = response.data;
    console.log(`Fetched ${playersData.length} nearby players`);
    
    return playersData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching nearby players:', error.message);
      if (error.response) {
        console.error('Server responded with:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    return [];
  }
}; 