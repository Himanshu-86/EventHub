
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qpywswycebgrrfndpjoz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFweXdzd3ljZWJncnJmbmRwam96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NjgyODgsImV4cCI6MjA3MDM0NDI4OH0.L256dphOiyL7zQ2C0NMvL24tt2JY8X--PuWlNv__TAI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);