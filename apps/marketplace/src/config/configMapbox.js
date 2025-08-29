// Mapbox configuration for DIY Tool Share
// This ensures proper geocoding setup and UK restrictions

export const mapboxConfig = {
  // Access token from environment variable
  accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
  
  // Map provider
  provider: 'mapbox',
  
  // Geocoding configuration
  geocoding: {
    // Restrict to UK only
    countryLimit: ['GB'],
    
    // Language for results
    language: ['en'],
    
    // Number of results to return
    limit: 5,
    
    // Types of places to search for
    types: [
      'address',
      'poi',
      'place',
      'neighborhood',
      'locality',
      'postcode',
      'district',
      'region',
      'country'
    ]
  },
  
  // Map configuration
  map: {
    // Default center (London)
    defaultCenter: {
      lat: 51.5074,
      lng: -0.1278
    },
    
    // Default zoom level
    defaultZoom: 10,
    
    // Style URL
    style: 'mapbox://styles/mapbox/streets-v11'
  }
};

// Ensure Mapbox is properly initialized
export const initializeMapbox = () => {
  if (typeof window !== 'undefined' && window.mapboxgl) {
    // Set the access token globally
    window.mapboxgl.accessToken = mapboxConfig.accessToken;
    
    // Log for debugging
    console.log('Mapbox initialized with token:', mapboxConfig.accessToken ? 'Present' : 'Missing');
  }
};

// Get geocoding client
export const getGeocodingClient = () => {
  if (typeof window !== 'undefined' && window.mapboxSdk) {
    return window.mapboxSdk({
      accessToken: mapboxConfig.accessToken
    });
  }
  return null;
};

export default mapboxConfig;
