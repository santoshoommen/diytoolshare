import { Request, Response, NextFunction } from 'express';
import { validateUKPostcode } from '../utils/ukPostcodeValidation';

/**
 * Middleware to validate UK postcode in request body
 */
export function validateUKPostcodeMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { postcode } = req.body;
  
  if (!postcode) {
    res.status(400).json({
      error: 'Postcode is required',
      message: 'Please provide a valid UK postcode'
    });
    return;
  }
  
  const validation = validateUKPostcode(postcode);
  
  if (!validation.isValid) {
    res.status(400).json({
      error: 'Invalid postcode',
      message: validation.error || 'Please provide a valid UK postcode'
    });
    return;
  }
  
  // Add formatted postcode to request body
  req.body.postcode = validation.formattedPostcode;
  req.body.postcodeData = validation;
  
  next();
}

/**
 * Middleware to validate location is within UK
 */
export function validateUKLocationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { location, country } = req.body;
  
  // If country is specified, ensure it's UK
  if (country && country.toUpperCase() !== 'GB' && country.toUpperCase() !== 'UK') {
    res.status(400).json({
      error: 'Location outside UK',
      message: 'This service is only available in the United Kingdom'
    });
    return;
  }
  
  // If location contains country info, validate it's UK
  if (location && typeof location === 'string') {
    const locationLower = location.toLowerCase();
    if (locationLower.includes('united states') || 
        locationLower.includes('usa') || 
        locationLower.includes('canada') ||
        locationLower.includes('australia') ||
        locationLower.includes('germany') ||
        locationLower.includes('france')) {
      res.status(400).json({
        error: 'Location outside UK',
        message: 'This service is only available in the United Kingdom'
      });
      return;
    }
  }
  
  next();
}

/**
 * Middleware to add UK-specific headers
 */
export function addUKHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Service-Region', 'UK');
  res.setHeader('X-Supported-Countries', 'GB');
  next();
}

/**
 * Middleware to validate user registration for UK
 */
export function validateUKUserRegistrationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { postcode, phoneNumber } = req.body;
  
  // Validate postcode
  if (postcode) {
    const postcodeValidation = validateUKPostcode(postcode);
    if (!postcodeValidation.isValid) {
      res.status(400).json({
        error: 'Invalid UK postcode',
        message: 'Please provide a valid UK postcode'
      });
      return;
    }
    req.body.postcode = postcodeValidation.formattedPostcode;
  }
  
  // Validate UK phone number format (basic validation)
  if (phoneNumber) {
    const ukPhoneRegex = /^(\+44|0)[1-9]\d{8,9}$/;
    if (!ukPhoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
      res.status(400).json({
        error: 'Invalid UK phone number',
        message: 'Please provide a valid UK phone number'
      });
      return;
    }
  }
  
  next();
}
