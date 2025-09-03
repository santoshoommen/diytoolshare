import { useMemo, useState, useEffect } from 'react';
import { useConfiguration } from '../../../context/configurationContext';

// UK-focused map hook - Final Version with Radius Circles Support

// UK bounds (approximate) - includes England, Scotland, Wales, and Northern Ireland
const UK_MAP_BOUNDS = {
  ne: { lat: 60.9, lng: 1.8 },  // North East (Shetland)
  sw: { lat: 49.9, lng: -8.6 }  // South West (Cornwall)
};

// Create SDK-compatible bounds object
const createSDKBounds = (bounds) => {
  if (!bounds || !bounds.ne || !bounds.sw) {
    console.warn('createSDKBounds: Invalid bounds structure:', bounds);
    return null;
  }

  // Validate that coordinates are valid numbers
  const neLat = bounds.ne.lat;
  const neLng = bounds.ne.lng;
  const swLat = bounds.sw.lat;
  const swLng = bounds.sw.lng;

  console.log('createSDKBounds: Raw coordinates:', { neLat, neLng, swLat, swLng });

  if (typeof neLat !== 'number' || typeof neLng !== 'number' || 
      typeof swLat !== 'number' || typeof swLng !== 'number' ||
      isNaN(neLat) || isNaN(neLng) || isNaN(swLat) || isNaN(swLng)) {
    console.warn('createSDKBounds: Invalid coordinates in bounds:', { neLat, neLng, swLat, swLng });
    return null;
  }

  // Additional validation: ensure coordinates are within reasonable ranges
  if (neLat < -90 || neLat > 90 || swLat < -90 || swLat > 90 ||
      neLng < -180 || neLng > 180 || swLng < -180 || swLng > 180) {
    console.warn('createSDKBounds: Coordinates out of valid range:', { neLat, neLng, swLat, swLng });
    return null;
  }

  // Create a mock SDK bounds object that has the expected structure
  // This mimics what the Mapbox SDK expects
  const sdkBounds = {
    ne: {
      lat: () => neLat,
      lng: () => neLng
    },
    sw: {
      lat: () => swLat,
      lng: () => swLng
    }
  };

  console.log('createSDKBounds: Created valid SDK bounds:', sdkBounds);
  return sdkBounds;
};

// Calculate bounds for a postcode with radius (in miles)
const calculatePostcodeBounds = async (postcode, radiusMiles = 12) => {
  try {
    console.log('calculatePostcodeBounds: Starting calculation for postcode:', postcode);
    
    // Get actual postcode coordinates from our API
    const response = await fetch('http://localhost:4000/api/postcode/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postcode }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('calculatePostcodeBounds: API response:', data);
      
      if (data.isValid && data.coordinates) {
        const { lat, lng } = data.coordinates;

        // Validate coordinates
        if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
          console.warn('calculatePostcodeBounds: Invalid coordinates from API:', { lat, lng });
          return null;
        }

        // Convert miles to degrees (approximate)
        const latDelta = radiusMiles / 69; // 1 degree latitude ≈ 69 miles
        const lngDelta = radiusMiles / (69 * Math.cos(lat * Math.PI / 180));

        const result = {
          ne: { lat: lat + latDelta, lng: lng + lngDelta },
          sw: { lat: lat - latDelta, lng: lng - lngDelta }
        };

        // Validate the calculated bounds
        if (isNaN(result.ne.lat) || isNaN(result.ne.lng) || 
            isNaN(result.sw.lat) || isNaN(result.sw.lng)) {
          console.warn('calculatePostcodeBounds: Calculated bounds contain NaN values:', result);
          return null;
        }

        console.log('calculatePostcodeBounds: Successfully calculated bounds:', result);
        return result;
      }
    }
  } catch (error) {
    console.warn('calculatePostcodeBounds: Failed to get postcode coordinates:', error);
  }

  // Fallback to approximate UK center coordinates
  console.log('calculatePostcodeBounds: Using fallback UK center coordinates');
  const ukCenter = { lat: 52.5, lng: -2.0 };
  const latDelta = radiusMiles / 69;
  const lngDelta = radiusMiles / (69 * Math.cos(ukCenter.lat * Math.PI / 180));

  const result = {
    ne: { lat: ukCenter.lat + latDelta, lng: ukCenter.lng + lngDelta },
    sw: { lat: ukCenter.lat - latDelta, lng: ukCenter.lng - lngDelta }
  };

  // Validate the fallback bounds
  if (isNaN(result.ne.lat) || isNaN(result.ne.lng) || 
      isNaN(result.sw.lat) || isNaN(result.sw.lng)) {
    console.warn('calculatePostcodeBounds: Fallback bounds contain NaN values:', result);
    return null;
  }

  console.log('calculatePostcodeBounds: Fallback bounds calculated:', result);
  return result;
};

/**
 * Custom hook to provide UK-focused map bounds and center with radius circle support
 *
 * Behavior:
 * - ALWAYS ignore URL bounds to prevent NaN issues
 * - If user is logged in with postcode, show 12-mile radius around their location
 * - Default: Show the entire UK (England, Scotland, Wales, Northern Ireland)
 * - Returns userPostcodeCenter for drawing radius circles on the map
 *
 * @param {Object} props - Hook parameters
 * @param {Object} props.bounds - Current map bounds from URL (ignored for safety)
 * @param {Object} props.center - Current map center from URL
 * @param {Object} props.currentUser - Current logged-in user
 * @param {number} props.zoom - Current zoom level
 * @returns {Object} - Modified bounds, center, zoom, and userPostcodeCenter for UK focus
 */
export const useUKFocusedMap = ({ bounds, center, currentUser, zoom }) => {
  const config = useConfiguration();
  const [userPostcodeBounds, setUserPostcodeBounds] = useState(null);
  const [userPostcodeCenter, setUserPostcodeCenter] = useState(null);

  // Debug logging
  console.log('useUKFocusedMap called with:', { bounds, center, currentUser, zoom });
  console.log('useUKFocusedMap: currentUser type:', typeof currentUser);
  console.log('useUKFocusedMap: currentUser value:', currentUser);
  console.log('useUKFocusedMap: currentUser attributes:', currentUser?.attributes);
  console.log('useUKFocusedMap: currentUser profile:', currentUser?.attributes?.profile);
  console.log('useUKFocusedMap: currentUser publicData:', currentUser?.attributes?.profile?.publicData);

  // Fetch user postcode bounds when component mounts or currentUser changes
  useEffect(() => {
    console.log('useUKFocusedMap useEffect triggered with currentUser:', currentUser);
    
    const fetchUserPostcodeBounds = async () => {
      console.log('fetchUserPostcodeBounds: Starting...');
      console.log('fetchUserPostcodeBounds: Current user:', currentUser);
      console.log('fetchUserPostcodeBounds: Current user type:', typeof currentUser);
      console.log('fetchUserPostcodeBounds: Current user keys:', currentUser ? Object.keys(currentUser) : 'null');

      if (currentUser && currentUser.attributes && currentUser.attributes.profile && currentUser.attributes.profile.publicData) {
        const userPublicData = currentUser.attributes.profile.publicData;
        console.log('fetchUserPostcodeBounds: User public data:', userPublicData);
        console.log('fetchUserPostcodeBounds: User public data type:', typeof userPublicData);
        console.log('fetchUserPostcodeBounds: User public data keys:', userPublicData ? Object.keys(userPublicData) : 'null');

        // Check for postcode in the correct location based on console logs
        let postcode = null;
        if (userPublicData && userPublicData.postcode) {
          postcode = userPublicData.postcode;
          console.log('fetchUserPostcodeBounds: Found postcode in publicData.postcode:', postcode);
        } else if (userPublicData && userPublicData.location && userPublicData.location.address && userPublicData.location.address.postalCode) {
          postcode = userPublicData.location.address.postalCode;
          console.log('fetchUserPostcodeBounds: Found postcode in publicData.location.address.postalCode:', postcode);
        } else {
          console.log('fetchUserPostcodeBounds: No postcode found in expected locations');
          console.log('fetchUserPostcodeBounds: Available publicData keys:', userPublicData ? Object.keys(userPublicData) : 'null');
          if (userPublicData && userPublicData.location) {
            console.log('fetchUserPostcodeBounds: Location data:', userPublicData.location);
          }
          
          // Additional debugging: log the entire user structure
          console.log('fetchUserPostcodeBounds: Full user attributes:', currentUser.attributes);
          console.log('fetchUserPostcodeBounds: Full user profile:', currentUser.attributes.profile);
          console.log('fetchUserPostcodeBounds: Full user publicData:', currentUser.attributes.profile.publicData);
        }

        if (postcode) {
          console.log('fetchUserPostcodeBounds: User postcode found:', postcode);
          try {
            const postcodeBounds = await calculatePostcodeBounds(postcode, 12);
            console.log('fetchUserPostcodeBounds: Postcode bounds calculated:', postcodeBounds);
            if (postcodeBounds) {
              setUserPostcodeBounds(postcodeBounds);
              console.log('fetchUserPostcodeBounds: Successfully set user postcode bounds');
              
              // Also store the center coordinates for radius circles
              const centerCoords = {
                lat: (postcodeBounds.ne.lat + postcodeBounds.sw.lat) / 2,
                lng: (postcodeBounds.ne.lng + postcodeBounds.sw.lng) / 2
              };
              console.log('fetchUserPostcodeBounds: Center coordinates for radius circles:', centerCoords);
              setUserPostcodeCenter(centerCoords);
            } else {
              console.warn('fetchUserPostcodeBounds: Postcode bounds calculation returned null');
            }
          } catch (error) {
            console.warn('fetchUserPostcodeBounds: Failed to fetch user postcode bounds:', error);
          }
        } else {
          console.log('fetchUserPostcodeBounds: No postcode found in user data');
        }
      } else {
        console.log('fetchUserPostcodeBounds: No current user or public data');
        if (currentUser) {
          console.log('fetchUserPostcodeBounds: User exists but missing attributes:', {
            hasAttributes: !!currentUser.attributes,
            hasProfile: !!(currentUser.attributes && currentUser.attributes.profile),
            hasPublicData: !!(currentUser.attributes && currentUser.attributes.profile && currentUser.attributes.profile.publicData)
          });
        }
      }
    };

    // Only fetch if we have a currentUser
    if (currentUser) {
      fetchUserPostcodeBounds();
    } else {
      console.log('useUKFocusedMap: No currentUser, clearing postcode bounds');
      setUserPostcodeBounds(null);
      setUserPostcodeCenter(null);
    }
  }, [currentUser]);

  return useMemo(() => {
    console.log('useUKFocusedMap useMemo executing with:', { bounds, center, userPostcodeBounds, userPostcodeCenter, zoom });
    console.log('useUKFocusedMap: userPostcodeBounds type:', typeof userPostcodeBounds);
    console.log('useUKFocusedMap: userPostcodeBounds value:', userPostcodeBounds);
    console.log('useUKFocusedMap: userPostcodeCenter value:', userPostcodeCenter);

    // SAFETY: Always ignore URL bounds to prevent NaN issues
    // The URL bounds are causing the "Invalid LngLat object: (NaN, NaN)" error
    if (bounds) {
      console.warn('useUKFocusedMap: SAFETY: Ignoring URL bounds to prevent NaN issues:', bounds);
    }

    // If user is logged in and has postcode bounds, show their area
    if (userPostcodeBounds) {
      console.log('useUKFocusedMap: Using user postcode bounds:', userPostcodeBounds);
      const sdkBounds = createSDKBounds(userPostcodeBounds);
      console.log('useUKFocusedMap: Created SDK bounds:', sdkBounds);

      if (sdkBounds) {
        const result = {
          bounds: sdkBounds,
          center: userPostcodeCenter || {
            lat: (userPostcodeBounds.ne.lat + userPostcodeBounds.sw.lat) / 2,
            lng: (userPostcodeBounds.ne.lng + userPostcodeBounds.sw.lng) / 2
          },
          zoom: 9, // Zoom level for ~12 mile radius (slightly more zoomed out)
          userPostcodeCenter: userPostcodeCenter // Add center coordinates for radius circles
        };

        console.log('useUKFocusedMap: Returning user postcode result:', result);
        return result;
      } else {
        console.warn('useUKFocusedMap: Failed to create SDK bounds from user postcode bounds');
      }
    } else {
      console.log('useUKFocusedMap: No user postcode bounds available, will use default UK bounds');
    }

    // Default: Show UK
    console.log('useUKFocusedMap: Using default UK bounds:', UK_MAP_BOUNDS);
    const sdkBounds = createSDKBounds(UK_MAP_BOUNDS);

    if (sdkBounds) {
      const result = {
        bounds: sdkBounds,
        center: {
          lat: (UK_MAP_BOUNDS.ne.lat + UK_MAP_BOUNDS.sw.lat) / 2,
          lng: (UK_MAP_BOUNDS.ne.lng + UK_MAP_BOUNDS.sw.lng) / 2
        },
        zoom: 5, // Zoom level to show most of the UK
        userPostcodeCenter: null // No user postcode center for default UK view
      };

      console.log('useUKFocusedMap: Returning default UK result:', result);
      return result;
    }

    // Fallback: return null bounds to let the map handle it
    console.warn('useUKFocusedMap: Failed to create valid bounds, returning null');
    return { bounds: null, center: null, zoom: null, userPostcodeCenter: null };
  }, [bounds, center, userPostcodeBounds, userPostcodeCenter, zoom]);
};
