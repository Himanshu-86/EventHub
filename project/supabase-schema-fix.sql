-- Fix column names in Supabase (case-sensitive issue)
-- Drop and recreate events table with proper column names

DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Events table with proper camelCase column names
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT,
    organizerid UUID REFERENCES auth.users(id),
    organizername TEXT NOT NULL,
    category TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    ticketssold INTEGER DEFAULT 0,
    status TEXT DEFAULT 'upcoming',
    
    -- Additional fields from attachment
    tickettype TEXT DEFAULT 'paid',
    bookingdeadline DATE,
    ticketprice INTEGER,
    totaltickets INTEGER,
    organizeremail TEXT,
    organizerphone TEXT,
    contactphone TEXT,
    contactemail TEXT,
    websiteurl TEXT,
    eventtype TEXT,
    tags TEXT,
    
    -- Settings
    eventpublic BOOLEAN DEFAULT true,
    showattendeecount BOOLEAN DEFAULT true,
    showremainingtickets BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eventid UUID REFERENCES events(id),
    eventtitle TEXT NOT NULL,
    userid UUID REFERENCES auth.users(id),
    username TEXT NOT NULL,
    useremail TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    totalamount INTEGER NOT NULL,
    purchasedate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'confirmed',
    ticketcode TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Events are public" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = organizerid);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = organizerid);
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = organizerid);
CREATE POLICY "Users can view own tickets" ON tickets FOR ALL USING (auth.uid() = userid);
