-- Create lekha_jokha_records (Annual Financial PDF Documents) table
CREATE TABLE IF NOT EXISTS public.lekha_jokha_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year TEXT NOT NULL DEFAULT '2026',
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'वार्षिक विवरण',
    pdf_url TEXT NOT NULL,
    file_name TEXT,
    file_size TEXT,
    description TEXT,
    total_income NUMERIC,
    total_expense NUMERIC,
    closing_balance NUMERIC,
    is_verified BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create lekha_jokha_events (Cultural Program Accounts & Reports) table
CREATE TABLE IF NOT EXISTS public.lekha_jokha_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year TEXT NOT NULL DEFAULT '2026',
    event_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'सांस्कृतिक संध्या',
    event_date TEXT,
    total_income NUMERIC DEFAULT 0,
    total_expense NUMERIC DEFAULT 0,
    balance NUMERIC DEFAULT 0,
    organizer TEXT DEFAULT 'नोहर विकास युवक संघ',
    highlights TEXT,
    pdf_url TEXT,
    image_url TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lekha_records_year ON public.lekha_jokha_records(year);
CREATE INDEX IF NOT EXISTS idx_lekha_records_active ON public.lekha_jokha_records(is_active);
CREATE INDEX IF NOT EXISTS idx_lekha_events_year ON public.lekha_jokha_events(year);
CREATE INDEX IF NOT EXISTS idx_lekha_events_active ON public.lekha_jokha_events(is_active);

-- Enable RLS
ALTER TABLE public.lekha_jokha_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lekha_jokha_events ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read active lekha records"
    ON public.lekha_jokha_records
    FOR SELECT
    USING (true);

CREATE POLICY "Admins full access lekha records"
    ON public.lekha_jokha_records
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public read active lekha events"
    ON public.lekha_jokha_events
    FOR SELECT
    USING (true);

CREATE POLICY "Admins full access lekha events"
    ON public.lekha_jokha_events
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
