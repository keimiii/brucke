# Environment Setup Instructions

## Step 1: Create Environment File

Create a `.env` file in the `src/server/` directory with the following content:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=https://rvghkydcnaeznbstnngp.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
```

## Step 2: Get Your Supabase Keys

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL**: Already provided (`https://rvghkydcnaeznbstnngp.supabase.co`)
   - **anon public key**: Copy this to `SUPABASE_ANON_KEY`
   - **service_role secret key**: Copy this to `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Update Your Environment File

Replace the placeholder values in your `.env` file:
- Replace `your-supabase-anon-key-here` with your actual anon key
- Replace `your-supabase-service-role-key-here` with your actual service role key
- Optionally change the `JWT_SECRET` to a secure random string

## Step 4: Database Schema

Make sure your Supabase database has the following tables:

### Player Table
```sql
CREATE TABLE player (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    password TEXT NOT NULL,
    room_id TEXT
);

-- Add indexes for better performance
CREATE INDEX idx_player_email ON player(email);
CREATE INDEX idx_player_username ON player(username);
CREATE INDEX idx_player_user_id ON player(user_id);
```

### Room Table
```sql
CREATE TABLE room (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    game_id TEXT,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished'))
);
```

## Step 5: Test the Connection

1. Start the server: `cd src/server && npm run dev`
2. Check the console for any connection errors
3. The server should start without errors if the environment is configured correctly

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Use different keys for development and production
- Rotate your JWT secret regularly in production
- Passwords are hashed using bcrypt with salt rounds of 10
