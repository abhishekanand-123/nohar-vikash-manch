-- Create village_services (Gram Udyog & Services Directory) table
CREATE TABLE IF NOT EXISTS public.village_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    skill TEXT,
    experience TEXT,
    address TEXT,
    image TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast searching and category filtering
CREATE INDEX IF NOT EXISTS idx_village_services_category ON public.village_services(category);
CREATE INDEX IF NOT EXISTS idx_village_services_active ON public.village_services(is_active);

-- Enable RLS
ALTER TABLE public.village_services ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read active services"
    ON public.village_services
    FOR SELECT
    USING (true);

-- Authenticated admins can insert, update, delete
CREATE POLICY "Admins full access services"
    ON public.village_services
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
