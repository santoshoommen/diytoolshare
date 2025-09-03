import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import dotenv from 'dotenv';
import winston from 'winston';

// Load environment variables
dotenv.config();

// Create Express app
const app: express.Application = express();
const PORT = process.env.PORT || 4000;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'diytoolshare-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Middleware
app.use(helmet());

// Debug environment variable
console.log('🔍 CORS Debug - MARKETPLACE_PRODUCTION_URL:', process.env.MARKETPLACE_PRODUCTION_URL);
console.log('🔍 CORS Debug - NODE_ENV:', process.env.NODE_ENV);

// Configure CORS with better debugging and more flexible origin handling
const corsOrigins: string[] = [
  'http://localhost:3000', 
  'http://localhost:3500'
];

// Add production URL if environment variable is set
if (process.env.MARKETPLACE_PRODUCTION_URL) {
  corsOrigins.push(process.env.MARKETPLACE_PRODUCTION_URL);
  console.log('✅ Added production marketplace URL to CORS:', process.env.MARKETPLACE_PRODUCTION_URL);
} else {
  console.log('⚠️  No MARKETPLACE_PRODUCTION_URL environment variable found');
}

console.log('🔍 Final CORS origins:', corsOrigins);

// More flexible CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    console.log('🔍 CORS Request Origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    // Check if origin is in our allowed list
    if (corsOrigins.includes(origin)) {
      console.log('✅ Origin allowed:', origin);
      return callback(null, true);
    }
    
    // Check for subdomain variations
    const baseDomain = process.env.MARKETPLACE_PRODUCTION_URL?.replace(/^https?:\/\//, '');
    if (baseDomain && origin.includes(baseDomain)) {
      console.log('✅ Subdomain variation allowed:', origin);
      return callback(null, true);
    }
    
    console.log('❌ Origin not allowed:', origin);
    console.log('❌ Allowed origins:', corsOrigins);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle CORS preflight requests explicitly
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'diytoolshare-api'
  });
});

// Import routes
import postcodeRoutes from './routes/postcodeRoutes';

// API routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'DIY Tool Share API',
    version: '1.0.0',
    features: [
      'UK Postcode Validation',
      'Location Services',
      'DIY Tool Sharing'
    ]
  });
});

// Use routes
app.use('/api/postcode', postcodeRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
