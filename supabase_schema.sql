-- TurfPulse Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Turfs Table
CREATE TABLE turfs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'Football', 'Cricket'
    location TEXT NOT NULL,
    status TEXT DEFAULT 'Active', -- 'Active', 'Maintenance'
    price_per_hour DECIMAL(10,2) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 5.0,
    image_url TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    opening_time TIME,
    closing_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Slots Table
CREATE TABLE slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turf_id UUID REFERENCES turfs(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Coupons Table
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    discount_type TEXT NOT NULL, -- 'Percentage', 'Fixed'
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'Active', -- 'Active', 'Expired'
    applies_to TEXT DEFAULT 'all_slots',
    selected_slot_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref TEXT UNIQUE NOT NULL, -- e.g., 'BK-7829'
    customer_id UUID REFERENCES customers(id),
    slot_id UUID REFERENCES slots(id),
    coupon_id UUID REFERENCES coupons(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on Row Level Security (RLS) for all tables
ALTER TABLE turfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create secure policies for owner-based access
CREATE POLICY "Owners can manage their own turfs" ON turfs FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Public can view turfs" ON turfs FOR SELECT USING (true);

CREATE POLICY "Owners can manage slots for their turfs" ON slots FOR ALL USING (
    EXISTS (
        SELECT 1 FROM turfs 
        WHERE turfs.id = slots.turf_id AND turfs.owner_id = auth.uid()
    )
);
CREATE POLICY "Public can view slots" ON slots FOR SELECT USING (true);
CREATE POLICY "Allow public read/write access to customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow public read/write access to coupons" ON coupons FOR ALL USING (true);
CREATE POLICY "Allow public read/write access to bookings" ON bookings FOR ALL USING (true);
