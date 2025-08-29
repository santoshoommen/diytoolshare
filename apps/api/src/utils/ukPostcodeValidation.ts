/**
 * UK Postcode Validation Utility
 * Validates and formats UK postcodes according to official standards
 */

export interface PostcodeValidationResult {
  isValid: boolean;
  formattedPostcode?: string;
  error?: string;
  area?: string;
  district?: string;
  sector?: string;
  unit?: string;
}

/**
 * UK Postcode regex pattern
 * Matches all valid UK postcode formats
 */
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

/**
 * Validates a UK postcode
 * @param postcode - The postcode to validate
 * @returns PostcodeValidationResult with validation details
 */
export function validateUKPostcode(postcode: string): PostcodeValidationResult {
  if (!postcode || typeof postcode !== 'string') {
    return {
      isValid: false,
      error: 'Postcode is required and must be a string'
    };
  }

  const trimmedPostcode = postcode.trim().toUpperCase();
  
  if (!UK_POSTCODE_REGEX.test(trimmedPostcode)) {
    return {
      isValid: false,
      error: 'Invalid UK postcode format'
    };
  }

  // Format the postcode (add space if missing)
  const formattedPostcode = formatUKPostcode(trimmedPostcode);
  
  // Parse postcode components
  const components = parseUKPostcode(formattedPostcode);
  
  return {
    isValid: true,
    formattedPostcode,
    ...components
  };
}

/**
 * Formats a UK postcode with proper spacing
 * @param postcode - The postcode to format
 * @returns Formatted postcode
 */
export function formatUKPostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
  
  // Add space before the last 3 characters
  if (cleaned.length >= 5) {
    return cleaned.slice(0, -3) + ' ' + cleaned.slice(-3);
  }
  
  return cleaned;
}

/**
 * Parses a UK postcode into its components
 * @param postcode - The formatted postcode
 * @returns Object with postcode components
 */
export function parseUKPostcode(postcode: string): {
  area: string;
  district: string;
  sector: string;
  unit: string;
} {
  const parts = postcode.split(' ');
  
  if (parts.length !== 2) {
    throw new Error('Invalid postcode format');
  }
  
  const outward = parts[0]; // First part (area + district)
  const inward = parts[1];  // Second part (sector + unit)
  
  // Extract area (first 1-2 letters)
  const areaMatch = outward.match(/^[A-Z]{1,2}/);
  const area = areaMatch ? areaMatch[0] : '';
  
  // Extract district (remaining part of outward)
  const district = outward.slice(area.length);
  
  // Extract sector (first digit of inward)
  const sector = inward.charAt(0);
  
  // Extract unit (remaining 2 letters of inward)
  const unit = inward.slice(1);
  
  return {
    area,
    district,
    sector,
    unit
  };
}

/**
 * Checks if a postcode is in a specific UK region
 * @param postcode - The postcode to check
 * @param region - The region to check against
 * @returns boolean indicating if postcode is in the region
 */
export function isPostcodeInRegion(postcode: string, region: string): boolean {
  const validation = validateUKPostcode(postcode);
  
  if (!validation.isValid) {
    return false;
  }
  
  const area = validation.area;
  
  // UK region mappings by postcode area
  const regionMappings: { [key: string]: string[] } = {
    'London': ['E', 'EC', 'N', 'NW', 'SE', 'SW', 'W', 'WC'],
    'Scotland': ['AB', 'DD', 'DG', 'EH', 'FK', 'G', 'HS', 'IV', 'KA', 'KW', 'KY', 'ML', 'PA', 'PH', 'TD', 'ZE'],
    'Wales': ['CF', 'CH', 'LD', 'LL', 'NP', 'SA', 'SY'],
    'Northern Ireland': ['BT'],
    'North East': ['CA', 'DL', 'DH', 'NE', 'SR', 'TS'],
    'North West': ['BB', 'BL', 'CH', 'CW', 'L', 'LA', 'M', 'OL', 'PR', 'SK', 'WA', 'WN'],
    'Yorkshire': ['BD', 'DN', 'HD', 'HG', 'HU', 'HX', 'LS', 'S', 'WF', 'YO'],
    'East Midlands': ['DE', 'DN', 'LE', 'LN', 'NG', 'PE'],
    'West Midlands': ['B', 'CV', 'DY', 'HR', 'NN', 'ST', 'TF', 'WR', 'WS'],
    'East of England': ['AL', 'CB', 'CM', 'CO', 'IP', 'LU', 'MK', 'NR', 'PE', 'SG', 'SS'],
    'South East': ['BN', 'BR', 'CT', 'DA', 'GU', 'HP', 'KT', 'ME', 'MK', 'OX', 'PO', 'RG', 'RH', 'SL', 'SM', 'SO', 'TN', 'TW'],
    'South West': ['BA', 'BH', 'BS', 'DT', 'EX', 'GL', 'PL', 'SN', 'SP', 'TA', 'TQ', 'TR']
  };
  
  return regionMappings[region]?.includes(area || '') || false;
}

/**
 * Calculates approximate distance between two UK postcodes
 * Uses Haversine formula for rough estimation
 * @param postcode1 - First postcode
 * @param postcode2 - Second postcode
 * @returns Distance in kilometers
 */
export function calculatePostcodeDistance(postcode1: string, postcode2: string): number {
  // This is a simplified implementation
  // In production, you'd want to use a proper geocoding service
  // to get actual coordinates and calculate real distances
  
  const validation1 = validateUKPostcode(postcode1);
  const validation2 = validateUKPostcode(postcode2);
  
  if (!validation1.isValid || !validation2.isValid) {
    throw new Error('Invalid postcode provided');
  }
  
  // For now, return a placeholder distance
  // In a real implementation, you'd:
  // 1. Geocode both postcodes to get lat/lng
  // 2. Use Haversine formula to calculate distance
  // 3. Return the actual distance
  
  return 0; // Placeholder
}

/**
 * Gets nearby postcodes within a radius
 * @param postcode - The reference postcode
 * @param radiusKm - Radius in kilometers
 * @returns Array of nearby postcodes (placeholder implementation)
 */
export function getNearbyPostcodes(postcode: string, radiusKm: number): string[] {
  // This is a placeholder implementation
  // In production, you'd:
  // 1. Use a postcode database or geocoding service
  // 2. Find postcodes within the specified radius
  // 3. Return the actual nearby postcodes
  
  return []; // Placeholder
}
