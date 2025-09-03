import { Request, Response, NextFunction } from 'express';

/**
 * CORS middleware for API access
 * Allows the marketplace frontend to access the API endpoints
 */

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Allow requests from the marketplace frontend
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
}
