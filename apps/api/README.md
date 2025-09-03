# DIY Tool Share API

## UK Postcode Validation Service

This API provides robust UK postcode validation using the postcodes.io API to ensure only valid UK postcodes are accepted.

## Features

- ✅ **UK Postcode Format Validation** - Regex-based format checking
- ✅ **Postcodes.io Integration** - Real-time validation against UK postal database
- ✅ **UK-Only Restrictions** - Ensures postcodes are actually in the UK
- ✅ **Detailed Location Information** - Returns city, region, coordinates
- ✅ **Middleware Integration** - Easy to use in other API endpoints

## API Endpoints

### POST `/api/postcode/validate`

Validates a UK postcode and returns detailed location information.

**Request:**
```json
{
  "postcode": "SW1A 1AA"
}
```

**Response (Valid):**
```json
{
  "isValid": true,
  "postcode": "SW1A 1AA",
  "formattedPostcode": "SW1A 1AA",
  "area": "SW",
  "district": "1A",
  "city": "London",
  "region": "England",
  "country": "GB",
  "coordinates": {
    "lat": 51.4994,
    "lng": -0.1245
  }
}
```

**Response (Invalid):**
```json
{
  "isValid": false,
  "error": "Invalid UK postcode format",
  "message": "Please enter a valid UK postcode format (e.g., SW1A 1AA)"
}
```

### POST `/api/postcode/region`

Checks if a postcode is in a specific UK region.

**Request:**
```json
{
  "postcode": "SW1A 1AA",
  "region": "London"
}
```

**Response:**
```json
{
  "postcode": "SW1A 1AA",
  "region": "London",
  "isInRegion": true,
  "area": "SW",
  "city": "London"
}
```

## Middleware Usage

### validateUKPostcodeMiddleware

Validates UK postcodes and adds validation result to request object.

```typescript
import { validateUKPostcodeMiddleware } from '../middleware/postcodesIoValidation';

router.post('/validate', validateUKPostcodeMiddleware, (req, res) => {
  // Postcode is already validated here
  const validation = getPostcodeValidation(req);
  // ... handle validated postcode
});
```

### requireUKPostcodeMiddleware

Ensures a valid UK postcode exists in the request.

```typescript
import { requireUKPostcodeMiddleware } from '../middleware/postcodesIoValidation';

router.post('/protected-endpoint', 
  validateUKPostcodeMiddleware, 
  requireUKPostcodeMiddleware,
  (req, res) => {
    // Only UK postcodes allowed
  }
);
```

## Environment Variables

No environment variables required! postcodes.io is a free, public API that doesn't require authentication.

## Why postcodes.io?

We switched from Mapbox to postcodes.io because:

- **UK-Specific**: Built specifically for UK postcodes with comprehensive coverage
- **More Reliable**: No false positives or partial postcode returns
- **Faster**: Optimized for UK postcode lookups
- **Free**: No API costs or rate limiting concerns
- **Accurate**: Returns exact postcode matches, not similar ones

## Testing

Run the test script to verify the API is working:

```bash
cd apps/api
node test-postcodes-io.js
```

## Integration with Marketplace

The marketplace frontend now uses this API for:

1. **Real-time validation** during postcode input
2. **Form validation** before submission
3. **UK-only restrictions** enforced at API level

## Security Features

- **CORS Protection** - Only allows requests from marketplace frontend
- **Input Validation** - Sanitizes and validates all inputs
- **Rate Limiting** - Built into postcodes.io API
- **Error Handling** - Graceful fallbacks for service failures

## UK Postcode Format

Valid UK postcode formats:
- `SW1A 1AA` (London)
- `M1 1AA` (Manchester)
- `EH1 1AA` (Edinburgh)
- `B1 1AA` (Birmingham)

## Error Codes

- `400` - Invalid postcode format or not in UK
- `500` - postcodes.io service error or validation failure
- `422` - Validation middleware error

## Performance

- **Caching** - postcodes.io provides intelligent caching
- **Async Processing** - Non-blocking validation
- **Debounced Input** - Frontend prevents excessive API calls
