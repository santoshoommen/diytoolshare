import { Router } from 'express';
import * as postcodeController from '../controllers/postcodeController';
import { 
  validateUKPostcodeMiddleware,
  requireUKPostcodeMiddleware 
} from '../middleware/postcodesIoValidation';

const router: Router = Router();

/**
 * @route   POST /api/postcode/validate
 * @desc    Validate a UK postcode
 * @access  Public
 */
router.post('/validate', validateUKPostcodeMiddleware, postcodeController.validatePostcode);

/**
 * @route   POST /api/postcode/region
 * @desc    Check if postcode is in a specific region
 * @access  Public
 */
router.post('/region', validateUKPostcodeMiddleware, postcodeController.checkPostcodeRegion);

/**
 * @route   POST /api/postcode/distance
 * @desc    Calculate distance between two postcodes
 * @access  Public
 */
router.post('/distance', postcodeController.calculateDistance);

/**
 * @route   POST /api/postcode/nearby
 * @desc    Get nearby postcodes within a radius
 * @access  Public
 */
router.post('/nearby', postcodeController.getNearby);

/**
 * @route   GET /api/postcode/regions
 * @desc    Get UK regions and their postcode areas
 * @access  Public
 */
router.get('/regions', postcodeController.getRegions);

export default router;
