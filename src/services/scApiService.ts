import { SC_API_BASE_URL, SC_API_KEY } from '../constants';

const fetchFromApi = async (endpoint: string) => {
  try {
    const response = await fetch(`${SC_API_BASE_URL}/${SC_API_KEY}/v1/live/${endpoint}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    if (result.success === 0) {
      throw new Error(result.message || 'Unknown API error');
    }
    return result.data;
  } catch (error) {
    console.error(`Error fetching from SC API (${endpoint}):`, error);
    throw error;
  }
};

export const fetchShips = async (page: number = 1) => {
  return fetchFromApi(`ships?page_max=${page}`);
};

export const searchShip = async (name: string) => {
  return fetchFromApi(`ships?name=${encodeURIComponent(name)}`);
};

export const fetchStarmap = async () => {
  return fetchFromApi(`starmap/starsystems`);
};

export const fetchSystemDetails = async (systemName: string) => {
  return fetchFromApi(`starmap/star-system?name=${encodeURIComponent(systemName)}`);
};
