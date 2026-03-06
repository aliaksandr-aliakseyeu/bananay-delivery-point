import { API_BASE_URL } from '../constants';

export interface CountryResponse {
  id: number;
  name: string;
  code: string;
}

export interface RegionListItem {
  id: number;
  name: string;
  type: string | null;
  country: CountryResponse;
}

export async function getRegions(countryId?: number): Promise<RegionListItem[]> {
  const url = new URL(`${API_BASE_URL}/api/v1/regions`);
  if (countryId != null) url.searchParams.set('country_id', String(countryId));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(res.statusText || 'Failed to load regions');
  return res.json();
}
