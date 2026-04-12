-- Enable PostGIS extension for geolocation
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    coordinates geography(POINT, 4326) NOT NULL,
    original_text TEXT,
    image_base64 TEXT,
    semantic_node VARCHAR(255),
    problem_title VARCHAR(255),
    urgency_rating INTEGER,
    importance_rating INTEGER,
    verification_score INTEGER DEFAULT 1,
    child_reports JSONB DEFAULT '[]'::jsonb
);

-- Index for spatial queries
CREATE INDEX IF NOT EXISTS reports_geo_index ON public.reports USING GIST (coordinates);

-- Create RPC function to get nearby reports within last 48 hours and 2km
CREATE OR REPLACE FUNCTION get_nearby_reports(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION
)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    original_text TEXT,
    semantic_node VARCHAR,
    problem_title VARCHAR,
    urgency_rating INTEGER,
    importance_rating INTEGER,
    verification_score INTEGER,
    child_reports JSONB,
    distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.created_at,
        r.latitude,
        r.longitude,
        r.original_text,
        r.semantic_node,
        r.problem_title,
        r.urgency_rating,
        r.importance_rating,
        r.verification_score,
        r.child_reports,
        ST_Distance(r.coordinates, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) AS distance_meters
    FROM 
        public.reports r
    WHERE 
        r.created_at >= now() - INTERVAL '48 hours'
        AND ST_DWithin(r.coordinates, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, 2000)
    ORDER BY 
        distance_meters ASC
    LIMIT 3;
END;
$$;

-- Create volunteers table
CREATE TABLE IF NOT EXISTS public.volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    skills TEXT[] NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    coordinates geography(POINT, 4326) NOT NULL
);

-- Index for spatial queries on volunteers
CREATE INDEX IF NOT EXISTS volunteers_geo_index ON public.volunteers USING GIST (coordinates);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false
);

-- Create RPC function to get perfectly matched volunteers based on overlapping skills and within 5km radius
CREATE OR REPLACE FUNCTION get_matched_volunteers(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_skills TEXT[]
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    skills TEXT[],
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.name,
        v.skills,
        v.latitude,
        v.longitude,
        ST_Distance(v.coordinates, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) AS distance_meters
    FROM 
        public.volunteers v
    WHERE 
        v.skills && p_skills -- Overlap operator for arrays
        AND ST_DWithin(v.coordinates, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, 5000)
    ORDER BY 
        distance_meters ASC;
END;
$$;

-- RBAC Constraint
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- PHASE 9 UPGRADES: Multi-Tenant Architecture Auth
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS is_authorized BOOLEAN DEFAULT false;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE TABLE IF NOT EXISTS public.ngos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    is_authorized BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS ngo_id UUID REFERENCES public.ngos(id);
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'critical';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
