/* eslint-disable @typescript-eslint/no-explicit-any */
// Goong Map API Service
const GOONG_API_KEY = 'EAddPu1fx9SFE8rAE7Ogdp1rheIPEfrhiAB65nif';

export async function fetchGoongAddressSuggestions(
  input: string
): Promise<string[]> {
  if (!input) return [];
  const apiUrl = `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(
    input
  )}&more_compound=true`;
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('Network response was not ok.');
  const data = await response.json();
  return (data.predictions || []).map((item: any) => item.description);
}

// Optionally: export a function to fetch full place details if needed
// export async function fetchGoongPlaceDetails(placeId: string): Promise<any> { ... }
