import { Request, Response, NextFunction } from 'express';

/**
 * Postcodes.io UK Postcode Validation Middleware
 * Validates UK postcodes using the postcodes.io API
 * Ensures postcodes are valid UK locations
 */

interface PostcodeValidationRequest extends Request {
  body: {
    postcode: string;
    [key: string]: any;
  };
}

interface PostcodesIoResponse {
  status: number;
  result: {
    postcode: string;
    quality: number;
    eastings: number;
    northings: number;
    country: string;
    nhs_ha: string;
    longitude: number;
    latitude: number;
    european_electoral_region: string;
    primary_care_trust: string;
    region: string;
    lsoa: string;
    msoa: string;
    incode: string;
    outcode: string;
    parliamentary_constituency: string;
    admin_district: string;
    parish: string;
    admin_county: string;
    admin_ward: string;
    ced: string;
    ccg: string;
    nuts: string;
    codes: {
      admin_district: string;
      admin_county: string;
      admin_ward: string;
      parish: string;
      parliamentary_constituency: string;
      ccg: string;
      ccg_id: string;
      ced: string;
      nuts: string;
      lsoa: string;
      msoa: string;
      lau2: string;
    };
  };
}

interface ValidationResult {
  isValid: boolean;
  postcode: string;
  formattedPostcode?: string;
  area?: string;
  district?: string;
  city?: string;
  region?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  error?: string;
  message?: string;
}

/**
 * UK Postcode regex pattern for initial format validation
 */
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

/**
 * UK country code
 */
const UK_COUNTRY_CODE = 'GB';

/**
 * Postcodes.io base URL
 */
const POSTCODES_IO_BASE_URL = 'https://api.postcodes.io';

/**
 * Validates UK postcode format using regex
 */
function validateUKPostcodeFormat(postcode: string): boolean {
  if (!postcode || typeof postcode !== 'string') {
    return false;
  }
  
  const trimmedPostcode = postcode.trim();
  return UK_POSTCODE_REGEX.test(trimmedPostcode);
}

/**
 * Formats UK postcode with proper spacing
 */
function formatUKPostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
  
  // Add space before the last 3 characters
  if (cleaned.length >= 5) {
    return cleaned.slice(0, -3) + ' ' + cleaned.slice(-3);
  }
  
  return cleaned;
}

/**
 * Validates postcode using postcodes.io API
 */
async function validatePostcodeWithPostcodesIo(postcode: string): Promise<ValidationResult> {
  const formattedPostcode = formatUKPostcode(postcode);
  console.log('Validating postcode with postcodes.io:', formattedPostcode);
  
  // Construct postcodes.io validation URL
  const url = `${POSTCODES_IO_BASE_URL}/postcodes/${encodeURIComponent(formattedPostcode)}`;
  console.log('Postcodes.io URL:', url);

  try {
    console.log('Making request to postcodes.io...');
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('Postcode not found in postcodes.io');
        return {
          isValid: false,
          postcode,
          error: 'Postcode not found in UK',
          message: 'This postcode was not found in the UK. Please enter a valid UK postcode.'
        };
      }
      console.log('Postcodes.io response not ok:', response.status, response.statusText);
      throw new Error(`Postcodes.io API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as PostcodesIoResponse;
    console.log('Postcodes.io response data:', JSON.stringify(data, null, 2));
    
    if (data.status !== 200 || !data.result) {
      console.log('Invalid response from postcodes.io');
      return {
        isValid: false,
        postcode,
        error: 'Invalid response from validation service',
        message: 'Failed to validate postcode. Please try again.'
      };
    }

    const result = data.result;
    
    // Verify it's a UK postcode
    // postcodes.io returns country names like "England", "Scotland", "Wales", "Northern Ireland"
    const ukCountries = ['England', 'Scotland', 'Wales', 'Northern Ireland'];
    if (!ukCountries.includes(result.country)) {
      return {
        isValid: false,
        postcode,
        error: 'Postcode not in UK',
        message: 'This postcode is not in the UK. Please enter a valid UK postcode.'
      };
    }

    // Extract coordinates
    const coordinates = {
      lat: result.latitude,
      lng: result.longitude
    };

    // Parse postcode components
    const outward = result.outcode;
    const inward = result.incode;
    
    const area = outward.match(/^[A-Z]{1,2}/)?.[0] || '';
    const district = outward.slice(area.length);

    return {
      isValid: true,
      postcode,
      formattedPostcode: `${outward} ${inward}`,
      area,
      district,
      city: result.admin_district || '',
      region: result.region || '',
      country: 'GB', // Always return GB for UK postcodes
      coordinates
    };

  } catch (error) {
    console.error('Postcodes.io validation error:', error);
    throw new Error('Failed to validate postcode with postcodes.io');
  }
}

/**
 * Middleware to validate UK postcode
 */
export async function validateUKPostcodeMiddleware(
  req: PostcodeValidationRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { postcode } = req.body;

    if (!postcode) {
      res.status(400).json({
        error: 'Postcode is required',
        message: 'Please provide a postcode to validate'
      });
      return;
    }

    // First validate format
    if (!validateUKPostcodeFormat(postcode)) {
      res.status(400).json({
        error: 'Invalid postcode format',
        message: 'Please enter a valid UK postcode format (e.g., SW1A 1AA)',
        isValid: false
      });
      return;
    }

    // Then validate with postcodes.io
    const validationResult = await validatePostcodeWithPostcodesIo(postcode);
    
    if (validationResult.isValid) {
      // Add validation result to request for downstream use
      (req as any).postcodeValidation = validationResult;
      next();
    } else {
      res.status(400).json({
        error: 'Invalid UK postcode',
        message: validationResult.message || 'Please enter a valid UK postcode',
        isValid: false
      });
    }

  } catch (error) {
    console.error('Postcode validation middleware error:', error);
    res.status(500).json({
      error: 'Validation service error',
      message: 'Failed to validate postcode. Please try again.',
      isValid: false
    });
  }
}

/**
 * Middleware to ensure postcode is UK-only
 */
export function requireUKPostcodeMiddleware(
  req: PostcodeValidationRequest,
  res: Response,
  next: NextFunction
): void {
  const validation = (req as any).postcodeValidation;
  
  if (!validation || !validation.isValid) {
    res.status(400).json({
      error: 'UK postcode required',
      message: 'A valid UK postcode is required for this operation'
    });
    return;
  }

  if (validation.country !== UK_COUNTRY_CODE) {
    res.status(400).json({
      error: 'UK postcode required',
      message: 'Only UK postcodes are allowed'
    });
    return;
  }

  next();
}

/**
 * Utility function to get postcode validation result from request
 */
export function getPostcodeValidation(req: Request): ValidationResult | null {
  return (req as any).postcodeValidation || null;
}

/**
 * Utility function to check if postcode is in specific UK region
 */
export function isPostcodeInUKRegion(postcode: string, region: string): boolean {
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

  const area = postcode.match(/^[A-Z]{1,2}/i)?.[0]?.toUpperCase();
  return regionMappings[region]?.includes(area || '') || false;
}
