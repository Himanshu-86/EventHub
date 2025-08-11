-- SUPABASE SETUP SQL (Run only what's needed)
-- Check if tables exist first, then create only missing ones

-- 1. CHECK EXISTING TABLES (run this first to see what exists)
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 2. CREATE TABLES (only run if tables don't exist)

-- Users table (skip if exists - you got 42P07 error)
-- CREATE TABLE IF NOT EXISTS users (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     email TEXT UNIQUE NOT NULL,
--     name TEXT NOT NULL,
--     role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'organizer')),
--     avatar TEXT,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Events table 
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT,
    "organizerId" UUID REFERENCES auth.users(id),
    "organizerName" TEXT NOT NULL,
    category TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    "ticketsSold" INTEGER DEFAULT 0,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "eventId" UUID REFERENCES events(id),
    "eventTitle" TEXT NOT NULL,
    "userId" UUID REFERENCES auth.users(id),
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "purchaseDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'refunded')),
    "ticketCode" TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text
);

-- 3. ENABLE RLS (Run these always)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES (Run these always - they will update if exist)
DROP POLICY IF EXISTS "Events are public" ON events;
CREATE POLICY "Events are public" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create events" ON events;
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = "organizerId");

DROP POLICY IF EXISTS "Users can update own events" ON events;
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = "organizerId");

DROP POLICY IF EXISTS "Users can delete own events" ON events;
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = "organizerId");

DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
CREATE POLICY "Users can view own tickets" ON tickets FOR ALL USING (auth.uid() = "userId");

-- 5. SAMPLE DATA (Optional - run if you want test data)
INSERT INTO events (title, description, date, time, location, price, image, "organizerId", "organizerName", category, capacity) 
VALUES 
('Tech Conference 2024', 'Join us for the biggest tech conference of the year', '2024-03-15', '09:00', 'Mumbai Convention Center', 2500, 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg', auth.uid(), 'TechEvents Inc.', 'Technology', 500),
('Music Festival 2024', 'Experience the best live music', '2024-04-20', '18:00', 'Mahalaxmi Racecourse', 1500, 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg', auth.uid(), 'Music World', 'Music', 2000)
ON CONFLICT DO NOTHING;
