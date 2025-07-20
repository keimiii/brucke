import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production'
};

// Validate required environment variables
if (!process.env.JWT_SECRET && config.isProduction) {
    throw new Error('JWT_SECRET is required in production');
}

export default config;