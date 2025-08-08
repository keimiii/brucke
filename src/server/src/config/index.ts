import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    
    // Supabase Configuration
    supabase: {
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    }
};

// Validate required environment variables
if (!process.env.JWT_SECRET && config.isProduction) {
    throw new Error('JWT_SECRET is required in production');
}

if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
}

export default config;