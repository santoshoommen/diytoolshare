import { Request, Response } from 'express';
import { 
  validateUKPostcode, 
  isPostcodeInRegion, 
  calculatePostcodeDistance,
  getNearbyPostcodes 
} from '../utils/ukPostcodeValidation';

/**
 * Validate a UK postcode
 * POST /api/postcode/validate
 */
export async function validatePostcode(req: Request, res: Response): Promise<void> {
  try {
    const { postcode } = req.body;
    
    if (!postcode) {
      res.status(400).json({
        error: 'Postcode is required',
        message: 'Please provide a postcode to validate'
      });
      return;
    }
    
    const validation = validateUKPostcode(postcode);
    
    if (!validation.isValid) {
      res.status(400).json({
        error: 'Invalid postcode',
        message: validation.error,
        isValid: false
      });
      return;
    }
    
    res.json({
      isValid: true,
      postcode: validation.formattedPostcode,
      area: validation.area,
      district: validation.district,
      sector: validation.sector,
      unit: validation.unit
    });
  } catch (error) {
    console.error('Postcode validation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate postcode'
    });
  }
}

/**
 * Check if postcode is in a specific region
 * POST /api/postcode/region
 */
export async function checkPostcodeRegion(req: Request, res: Response): Promise<void> {
  try {
    const { postcode, region } = req.body;
    
    if (!postcode || !region) {
      res.status(400).json({
        error: 'Missing parameters',
        message: 'Both postcode and region are required'
      });
      return;
    }
    
    const validation = validateUKPostcode(postcode);
    
    if (!validation.isValid) {
      res.status(400).json({
        error: 'Invalid postcode',
        message: validation.error
      });
      return;
    }
    
    const isInRegion = isPostcodeInRegion(postcode, region);
    
    res.json({
      postcode: validation.formattedPostcode,
      region,
      isInRegion,
      area: validation.area
    });
  } catch (error) {
    console.error('Postcode region check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to check postcode region'
    });
  }
}

/**
 * Calculate distance between two postcodes
 * POST /api/postcode/distance
 */
export async function calculateDistance(req: Request, res: Response): Promise<void> {
  try {
    const { postcode1, postcode2 } = req.body;
    
    if (!postcode1 || !postcode2) {
      res.status(400).json({
        error: 'Missing parameters',
        message: 'Both postcode1 and postcode2 are required'
      });
      return;
    }
    
    const validation1 = validateUKPostcode(postcode1);
    const validation2 = validateUKPostcode(postcode2);
    
    if (!validation1.isValid || !validation2.isValid) {
      res.status(400).json({
        error: 'Invalid postcode',
        message: 'Please provide valid UK postcodes'
      });
      return;
    }
    
    const distance = calculatePostcodeDistance(postcode1, postcode2);
    
    res.json({
      postcode1: validation1.formattedPostcode,
      postcode2: validation2.formattedPostcode,
      distanceKm: distance,
      message: 'Distance calculation is a placeholder. Implement with geocoding service for accurate results.'
    });
  } catch (error) {
    console.error('Postcode distance calculation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to calculate distance'
    });
  }
}

/**
 * Get nearby postcodes
 * POST /api/postcode/nearby
 */
export async function getNearby(req: Request, res: Response): Promise<void> {
  try {
    const { postcode, radiusKm = 10 } = req.body;
    
    if (!postcode) {
      res.status(400).json({
        error: 'Missing parameters',
        message: 'Postcode is required'
      });
      return;
    }
    
    const validation = validateUKPostcode(postcode);
    
    if (!validation.isValid) {
      res.status(400).json({
        error: 'Invalid postcode',
        message: validation.error
      });
      return;
    }
    
    const nearbyPostcodes = getNearbyPostcodes(postcode, radiusKm);
    
    res.json({
      postcode: validation.formattedPostcode,
      radiusKm,
      nearbyPostcodes,
      message: 'Nearby postcodes is a placeholder. Implement with postcode database for accurate results.'
    });
  } catch (error) {
    console.error('Get nearby postcodes error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get nearby postcodes'
    });
  }
}

/**
 * Get UK regions and their postcode areas
 * GET /api/postcode/regions
 */
export async function getRegions(req: Request, res: Response): Promise<void> {
  try {
    const regions = {
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
    
    res.json({
      regions,
      message: 'UK regions and their postcode areas'
    });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get regions'
    });
  }
}
