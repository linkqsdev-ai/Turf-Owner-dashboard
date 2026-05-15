-- Migration for Weekly Custom Slot Timing
-- Run this in your Supabase SQL Editor

-- 1. Create timing_rules table
CREATE TABLE IF NOT EXISTS timing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    turf_id UUID REFERENCES turfs(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL, -- 'Monday', 'Tuesday', etc.
    is_open BOOLEAN DEFAULT TRUE,
    start_time TIME,
    end_time TIME,
    timing_type TEXT NOT NULL, -- 'weekday', 'weekend', 'custom'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(turf_id, day_of_week)
);

-- 2. Update turfs table
ALTER TABLE turfs ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT FALSE;

-- 3. Update slots table
ALTER TABLE slots ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE slots ADD COLUMN IF NOT EXISTS day_of_week TEXT;
ALTER TABLE slots ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE slots ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available';

-- Update existing slots if any (optional, but good for consistency)
UPDATE slots SET status = 'Available' WHERE status IS NULL;
UPDATE slots SET is_active = TRUE WHERE is_active IS NULL;

-- 4. RLS for timing_rules
ALTER TABLE timing_rules ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners can manage their timing rules') THEN
        CREATE POLICY "Owners can manage their timing rules" ON timing_rules FOR ALL USING (auth.uid() = owner_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view timing rules') THEN
        CREATE POLICY "Public can view timing rules" ON timing_rules FOR SELECT USING (true);
    END IF;
END $$;
