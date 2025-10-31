import { types as sdkTypes } from './sdkLoader';

const { LatLng } = sdkTypes;

/**
 * Geocode a UK postcode to get coordinates as a LatLng instance
 * @param {string} postcode - UK postcode to geocode
 * @returns {Promise<LatLng | null>} - LatLng instance or null if geocoding fails
 */
export const geocodePostcode = async (postcode) => {
  if (!postcode || typeof postcode !== 'string') {
    return null;
  }

  const trimmedPostcode = postcode.trim();
  if (trimmedPostcode.length < 5) {
    return null;
  }

  try {
    // Call the API validation service
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
    const response = await fetch(`${apiBaseUrl}/api/postcode/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postcode: trimmedPostcode }),
    });

    if (!response.ok) {
      console.warn(`Postcode geocoding failed for ${trimmedPostcode}:`, response.statusText);
      return null;
    }

    const result = await response.json();
    
    if (result.isValid && result.coordinates && 
        typeof result.coordinates.lat === 'number' && 
        typeof result.coordinates.lng === 'number') {
      // Return a LatLng instance that the SDK expects
      return new LatLng(result.coordinates.lat, result.coordinates.lng);
    }

    return null;
  } catch (error) {
    console.error('Postcode geocoding error:', error);
    return null;
  }
};

