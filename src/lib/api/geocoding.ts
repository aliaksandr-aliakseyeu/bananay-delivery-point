export interface GeocodingResult {
  address: string;
  latitude: number;
  longitude: number;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

const headers = {
  'User-Agent': 'BananayTrack/1.0',
};

interface NominatimSearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export const geocodingApi = {
  searchAddress: async (query: string, countryCode?: string, language: string = 'ru'): Promise<GeocodingResult[]> => {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '5',
      'accept-language': language,
    });

    if (countryCode) {
      params.set('countrycodes', countryCode);
    }

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`, { headers });
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const results: NominatimSearchResult[] = await response.json();
    return results.map((item) => ({
      address: item.display_name,
      latitude: Number(item.lat),
      longitude: Number(item.lon),
    }));
  },
};
