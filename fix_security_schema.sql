-- SECURITY FIX: Multi-Tenancy Migration
-- Run this in your Supabase SQL Editor

-- 1. Add owner_id to all tables that lack it
ALTER TABLE slots ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Backfill owner_id for existing slots based on turf relation
UPDATE slots s SET owner_id = t.owner_id FROM turfs t WHERE s.turf_id = t.id AND s.owner_id IS NULL;

-- 3. Reset RLS Policies to be strictly Owner-Specific
-- Drop old loose policies
DROP POLICY IF EXISTS "Owners can manage slots for their turfs" ON slots;
DROP POLICY IF EXISTS "Public can view slots" ON slots;
DROP POLICY IF EXISTS "Allow public read/write access to customers" ON customers;
DROP POLICY IF EXISTS "Allow public read/write access to coupons" ON coupons;
DROP POLICY IF EXISTS "Allow public read/write access to bookings" ON bookings;
DROP POLICY IF EXISTS "Public can view turfs" ON turfs;

-- 4. Enable RLS (already enabled but ensuring consistency)
ALTER TABLE turfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 5. Create Strict Owner-Specific Policies
-- Turfs
CREATE POLICY "Strict Owner Access: Turfs" ON turfs 
FOR ALL USING (auth.uid() = owner_id) 
WITH CHECK (auth.uid() = owner_id);

-- Slots
CREATE POLICY "Strict Owner Access: Slots" ON slots 
FOR ALL USING (auth.uid() = owner_id) 
WITH CHECK (auth.uid() = owner_id);

-- Customers
CREATE POLICY "Strict Owner Access: Customers" ON customers 
FOR ALL USING (auth.uid() = owner_id) 
WITH CHECK (auth.uid() = owner_id);

-- Coupons
CREATE POLICY "Strict Owner Access: Coupons" ON coupons 
FOR ALL USING (auth.uid() = owner_id) 
WITH CHECK (auth.uid() = owner_id);

-- Bookings
CREATE POLICY "Strict Owner Access: Bookings" ON bookings 
FOR ALL USING (auth.uid() = owner_id) 
WITH CHECK (auth.uid() = owner_id);
