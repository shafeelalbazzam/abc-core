-- =========================================================================
-- AL BAZZAM ENTERPRISE IT & CMS - SUPABASE DATABASE INITIALIZATION SCRIPT
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TICKETS TABLE (Incident triage & management)
CREATE TABLE IF NOT EXISTS public.tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Software',
  department TEXT DEFAULT 'IT Department',
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Open',
  requester JSONB DEFAULT '{}'::jsonb,
  assigned_to TEXT,
  conversation JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  unread BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SERVICES TABLE (Website CMS Services & Solutions)
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Engineering',
  badge TEXT,
  tagline TEXT,
  description TEXT,
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  subcategories JSONB DEFAULT '[]'::jsonb,
  deliverables JSONB DEFAULT '[]'::jsonb,
  icon TEXT DEFAULT 'Wrench',
  status TEXT DEFAULT 'Active',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CAREERS TABLE (Website CMS Career Openings)
CREATE TABLE IF NOT EXISTS public.careers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT DEFAULT 'Abu Dhabi / Dubai, UAE',
  type TEXT DEFAULT 'Full Time',
  experience TEXT DEFAULT '3+ Years',
  qualification TEXT DEFAULT 'Degree / Diploma in relevant field',
  description TEXT,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRUSTED PARTNERS TABLE (Website CMS Partners & Group Entities - Matches CMS Form)
CREATE TABLE IF NOT EXISTS public.trusted_partners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  logo TEXT,
  website_url TEXT,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TEAM MEMBERS TABLE (Staff Directory & System Access)
CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT DEFAULT 'password123',
  role TEXT DEFAULT 'IT Support Lead',
  department TEXT DEFAULT 'IT Department',
  status TEXT DEFAULT 'Active',
  phone TEXT,
  avatar TEXT,
  tickets_assigned INTEGER DEFAULT 0,
  last_active TEXT DEFAULT 'Just now',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all tables have automatic UUID defaults if created previously
ALTER TABLE public.tickets ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.services ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.careers ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.trusted_partners ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.team_members ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Safe column additions for tickets table
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS unread BOOLEAN DEFAULT false;

-- Safe column additions for services table with multiple images and subcategories
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS subcategories JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Safe column additions for trusted_partners table (matches CMS Partner form)
ALTER TABLE public.trusted_partners ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.trusted_partners ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE public.trusted_partners ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.trusted_partners ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.trusted_partners ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE public.trusted_partners ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.trusted_partners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_trusted_partners_name ON public.trusted_partners (name);
CREATE INDEX IF NOT EXISTS idx_trusted_partners_active ON public.trusted_partners (active);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Tickets policies (Idempotent)
DROP POLICY IF EXISTS "Public Read Tickets" ON public.tickets;
DROP POLICY IF EXISTS "Public Insert Tickets" ON public.tickets;
DROP POLICY IF EXISTS "Public Update Tickets" ON public.tickets;
DROP POLICY IF EXISTS "Public Delete Tickets" ON public.tickets;
CREATE POLICY "Public Read Tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Public Insert Tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Tickets" ON public.tickets FOR UPDATE USING (true);
CREATE POLICY "Public Delete Tickets" ON public.tickets FOR DELETE USING (true);

-- Services policies (Idempotent)
DROP POLICY IF EXISTS "Public Read Services" ON public.services;
DROP POLICY IF EXISTS "Public Insert Services" ON public.services;
DROP POLICY IF EXISTS "Public Update Services" ON public.services;
DROP POLICY IF EXISTS "Public Delete Services" ON public.services;
CREATE POLICY "Public Read Services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public Insert Services" ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Services" ON public.services FOR UPDATE USING (true);
CREATE POLICY "Public Delete Services" ON public.services FOR DELETE USING (true);

-- Careers policies (Idempotent)
DROP POLICY IF EXISTS "Public Read Careers" ON public.careers;
DROP POLICY IF EXISTS "Public Insert Careers" ON public.careers;
DROP POLICY IF EXISTS "Public Update Careers" ON public.careers;
DROP POLICY IF EXISTS "Public Delete Careers" ON public.careers;
CREATE POLICY "Public Read Careers" ON public.careers FOR SELECT USING (true);
CREATE POLICY "Public Insert Careers" ON public.careers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Careers" ON public.careers FOR UPDATE USING (true);
CREATE POLICY "Public Delete Careers" ON public.careers FOR DELETE USING (true);

-- Trusted Partners policies (Idempotent)
DROP POLICY IF EXISTS "Public Read Partners" ON public.trusted_partners;
DROP POLICY IF EXISTS "Public Insert Partners" ON public.trusted_partners;
DROP POLICY IF EXISTS "Public Update Partners" ON public.trusted_partners;
DROP POLICY IF EXISTS "Public Delete Partners" ON public.trusted_partners;
CREATE POLICY "Public Read Partners" ON public.trusted_partners FOR SELECT USING (true);
CREATE POLICY "Public Insert Partners" ON public.trusted_partners FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Partners" ON public.trusted_partners FOR UPDATE USING (true);
CREATE POLICY "Public Delete Partners" ON public.trusted_partners FOR DELETE USING (true);

-- Team Members policies (Idempotent)
DROP POLICY IF EXISTS "Public Read Team" ON public.team_members;
DROP POLICY IF EXISTS "Public Insert Team" ON public.team_members;
DROP POLICY IF EXISTS "Public Update Team" ON public.team_members;
DROP POLICY IF EXISTS "Public Delete Team" ON public.team_members;
CREATE POLICY "Public Read Team" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Public Insert Team" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Team" ON public.team_members FOR UPDATE USING (true);
CREATE POLICY "Public Delete Team" ON public.team_members FOR DELETE USING (true);

-- =========================================================================
-- 7. FACILITIES MANAGEMENT TABLES (Spaces, Bookings & Maintenance Work Orders)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.facilities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Meeting Room',
  building TEXT DEFAULT 'Al Bazzam HQ Tower',
  floor TEXT DEFAULT '3rd Floor',
  capacity INTEGER DEFAULT 10,
  status TEXT DEFAULT 'Available',
  image TEXT,
  description TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  operating_hours TEXT DEFAULT '08:00 AM - 07:00 PM',
  lead_tech TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.facility_bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  facility_id TEXT,
  facility_name TEXT NOT NULL,
  title TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  department TEXT,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  attendees INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Confirmed',
  amenities_requested JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.facility_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'HVAC & Cooling',
  facility_id TEXT,
  location TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Requested',
  requester_name TEXT NOT NULL,
  requester_dept TEXT,
  assigned_to TEXT,
  description TEXT,
  resolution_notes TEXT,
  estimated_cost TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) for Facilities
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Facilities" ON public.facilities;
DROP POLICY IF EXISTS "Public Insert Facilities" ON public.facilities;
DROP POLICY IF EXISTS "Public Update Facilities" ON public.facilities;
DROP POLICY IF EXISTS "Public Delete Facilities" ON public.facilities;
CREATE POLICY "Public Read Facilities" ON public.facilities FOR SELECT USING (true);
CREATE POLICY "Public Insert Facilities" ON public.facilities FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Facilities" ON public.facilities FOR UPDATE USING (true);
CREATE POLICY "Public Delete Facilities" ON public.facilities FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public Read Bookings" ON public.facility_bookings;
DROP POLICY IF EXISTS "Public Insert Bookings" ON public.facility_bookings;
DROP POLICY IF EXISTS "Public Update Bookings" ON public.facility_bookings;
DROP POLICY IF EXISTS "Public Delete Bookings" ON public.facility_bookings;
CREATE POLICY "Public Read Bookings" ON public.facility_bookings FOR SELECT USING (true);
CREATE POLICY "Public Insert Bookings" ON public.facility_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Bookings" ON public.facility_bookings FOR UPDATE USING (true);
CREATE POLICY "Public Delete Bookings" ON public.facility_bookings FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public Read Requests" ON public.facility_requests;
DROP POLICY IF EXISTS "Public Insert Requests" ON public.facility_requests;
DROP POLICY IF EXISTS "Public Update Requests" ON public.facility_requests;
DROP POLICY IF EXISTS "Public Delete Requests" ON public.facility_requests;
CREATE POLICY "Public Read Requests" ON public.facility_requests FOR SELECT USING (true);
CREATE POLICY "Public Insert Requests" ON public.facility_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Requests" ON public.facility_requests FOR UPDATE USING (true);
CREATE POLICY "Public Delete Requests" ON public.facility_requests FOR DELETE USING (true);

-- =========================================================================
-- 8. SUPABASE REALTIME REPLICATION (For live incident updates & chat)
-- =========================================================================
-- Ensure Full Replica Identity so UPDATE and DELETE events broadcast all fields
ALTER TABLE public.tickets REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'tickets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
  END IF;
END $$;
