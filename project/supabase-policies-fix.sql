-- FIXED SQL - Run this to avoid policy conflicts

-- Drop existing policies first, then create new ones
DROP POLICY IF EXISTS "Events are public" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;

-- Now create policies (these won't conflict)
CREATE POLICY "Events are public" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = "organizerId");
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = "organizerId");
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = "organizerId");
CREATE POLICY "Users can view own tickets" ON tickets FOR ALL USING (auth.uid() = "userId");
