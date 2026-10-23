-- Create contact_messages table for storing inquiries submitted via the Contact Us form
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    category TEXT DEFAULT 'सामान्य पूछताछ (General Inquiry)',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new', -- 'new', 'in_progress', 'resolved'
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to submit contact messages
CREATE POLICY "Anyone can submit a contact message"
    ON public.contact_messages
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Only authenticated users (admins/editors) can view contact messages
CREATE POLICY "Admins can view contact messages"
    ON public.contact_messages
    FOR SELECT
    TO authenticated
    USING (true);

-- Only authenticated users can update contact messages (e.g. mark status as resolved)
CREATE POLICY "Admins can update contact messages"
    ON public.contact_messages
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create index for faster querying by creation date and status
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
