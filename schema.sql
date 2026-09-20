-- ==============================================================================
-- DATABASE SCHEMA: Online Micro-Task & Remote Job Platform (Supabase PostgreSQL)
-- ==============================================================================

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if recreating (safe migrations)
-- DROP TABLE IF EXISTS job_submissions CASCADE;
-- DROP TABLE IF EXISTS transactions CASCADE;
-- DROP TABLE IF EXISTS jobs CASCADE;
-- DROP TABLE IF EXISTS banned_identifiers CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ------------------------------------------------------------------------------
-- Table: profiles
-- Extends Supabase auth.users with custom platform attributes
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by TEXT,
    coins_balance INTEGER DEFAULT 0 NOT NULL,
    wallet_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    registration_paid BOOLEAN DEFAULT FALSE NOT NULL,
    training_paid BOOLEAN DEFAULT FALSE NOT NULL,
    is_banned BOOLEAN DEFAULT FALSE NOT NULL,
    ban_reason TEXT,
    training_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexing for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_training_deadline ON public.profiles(training_deadline);

-- ------------------------------------------------------------------------------
-- Table: banned_identifiers
-- Ensures permanent bans cannot be bypassed by deleting an account and re-registering
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banned_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier_type TEXT NOT NULL CHECK (identifier_type IN ('email', 'phone')),
    identifier_value TEXT UNIQUE NOT NULL,
    reason TEXT NOT NULL,
    banned_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_banned_identifiers_value ON public.banned_identifiers(identifier_value);

-- ------------------------------------------------------------------------------
-- Table: transactions
-- Records all payments (KSH 300 registration, KSH 500 training, payouts, bonuses)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES' NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('registration', 'training', 'task_payout', 'referral_bonus', 'withdrawal')),
    paystack_reference TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('pending', 'success', 'failed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(paystack_reference);

-- ------------------------------------------------------------------------------
-- Table: jobs
-- Micro-tasks and remote jobs available on the platform
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    payout NUMERIC(10, 2) NOT NULL,
    duration TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    description TEXT NOT NULL,
    instructions TEXT,
    requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
    slots_available INTEGER DEFAULT 50 NOT NULL,
    slots_completed INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);

-- ------------------------------------------------------------------------------
-- Table: job_submissions
-- User completed work records
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_content TEXT NOT NULL,
    proof_url TEXT,
    payout_awarded NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.job_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_job_id ON public.job_submissions(job_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_identifiers ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile, public referral codes are searchable
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Transactions: Users can view their own transactions
CREATE POLICY "Users can view own transactions" 
    ON public.transactions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
    ON public.transactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Jobs: Authenticated users can view active jobs
CREATE POLICY "Authenticated users can view active jobs" 
    ON public.jobs FOR SELECT 
    TO authenticated 
    USING (status = 'active');

-- Job Submissions: Users can view and insert their own submissions
CREATE POLICY "Users can view own submissions" 
    ON public.job_submissions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" 
    ON public.job_submissions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Banned Identifiers: Service / Admin read
CREATE POLICY "Public read for banned identifier checking" 
    ON public.banned_identifiers FOR SELECT 
    TO anon, authenticated 
    USING (true);

-- ==============================================================================
-- DATABASE TRIGGERS & AUTOMATION
-- ==============================================================================

-- 1. Helper function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generates format 'KE-' followed by 6 random alphanumeric characters
        new_code := 'KE-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger function on auth.users insert: creates profile & handles referrals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    referrer_record RECORD;
    ref_code_input TEXT;
    user_phone TEXT;
    user_full_name TEXT;
    is_already_banned BOOLEAN;
BEGIN
    user_phone := NEW.raw_user_meta_data->>'phone';
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Remote Earner');
    ref_code_input := NEW.raw_user_meta_data->>'referred_by';

    -- Check if email or phone is already banned
    SELECT EXISTS (
        SELECT 1 FROM public.banned_identifiers 
        WHERE identifier_value IN (NEW.email, user_phone)
    ) INTO is_already_banned;

    IF is_already_banned THEN
        RAISE EXCEPTION 'Account creation blocked: This email or phone number has been permanently banned.';
    END IF;

    -- Create profile with 48-hour training window starting at registration
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone,
        referral_code,
        referred_by,
        coins_balance,
        registration_paid,
        training_paid,
        is_banned,
        training_deadline,
        created_at
    ) VALUES (
        NEW.id,
        user_full_name,
        NEW.email,
        COALESCE(user_phone, '254700000000'),
        generate_unique_referral_code(),
        ref_code_input,
        0,
        FALSE,
        FALSE,
        FALSE,
        NOW() + INTERVAL '48 HOURS',
        NOW()
    );

    -- If registered with a valid referral code, reward referrer with 50 JobCoins
    IF ref_code_input IS NOT NULL AND ref_code_input <> '' THEN
        SELECT id, coins_balance INTO referrer_record 
        FROM public.profiles 
        WHERE referral_code = ref_code_input;

        IF FOUND THEN
            UPDATE public.profiles 
            SET coins_balance = coins_balance + 50 
            WHERE id = referrer_record.id;

            -- Record referral bonus transaction
            INSERT INTO public.transactions (
                user_id,
                amount,
                currency,
                payment_type,
                paystack_reference,
                status,
                metadata
            ) VALUES (
                referrer_record.id,
                50,
                'KES',
                'referral_bonus',
                'REF_BONUS_' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 10),
                'success',
                json_build_object('referred_user_id', NEW.id, 'coins_awarded', 50)
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger creation on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. 48-Hour Training Window Expiration & Automatic Ban Enforcement Function
CREATE OR REPLACE FUNCTION public.enforce_training_deadline()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER := 0;
    expired_user RECORD;
BEGIN
    FOR expired_user IN 
        SELECT id, email, phone 
        FROM public.profiles 
        WHERE training_paid = FALSE 
          AND is_banned = FALSE 
          AND training_deadline IS NOT NULL 
          AND training_deadline < NOW()
    LOOP
        -- Mark profile as banned
        UPDATE public.profiles 
        SET is_banned = TRUE, 
            ban_reason = 'Permanent exclusion: 48-hour training window expired without training fee payment.'
        WHERE id = expired_user.id;

        -- Record into permanent banned identifiers list
        INSERT INTO public.banned_identifiers (identifier_type, identifier_value, reason)
        VALUES ('email', expired_user.email, '48-hour training window expiration')
        ON CONFLICT (identifier_value) DO NOTHING;

        IF expired_user.phone IS NOT NULL AND expired_user.phone <> '' THEN
            INSERT INTO public.banned_identifiers (identifier_type, identifier_value, reason)
            VALUES ('phone', expired_user.phone, '48-hour training window expiration')
            ON CONFLICT (identifier_value) DO NOTHING;
        END IF;

        expired_count := expired_count + 1;
    END LOOP;

    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- SEED DATA: Realistic Remote Micro-Tasks (Kenyan Market)
-- ==============================================================================

INSERT INTO public.jobs (title, category, payout, duration, difficulty, status, description, instructions, requirements, slots_available)
VALUES 
(
    'AI Prompt Response Quality Evaluation', 
    'AI Annotation', 
    450.00, 
    '15 mins', 
    'Beginner', 
    'active', 
    'Review two AI chatbot answers for accuracy, tone, clarity, and factual correctness. Provide a rating from 1 to 5 and brief justification.',
    'Carefully read the user query and both model responses. Identify any hallucinations or awkward phrasing. Pick the superior response and submit your feedback.',
    ARRAY['Fluent in English', 'Attentive to detail', 'Familiar with conversational AI'],
    120
),
(
    'Kenyan Swahili & Sheng Audio Transcription', 
    'Transcription', 
    650.00, 
    '20 mins', 
    'Intermediate', 
    'active', 
    'Listen to a 3-minute conversational audio clip featuring Kenyan urban vernacular (Swahili/Sheng) and transcribe it word-for-word into text.',
    'Use standard Swahili orthography for common slang terms. Include timestamps when speaker changes occur.',
    ARRAY['Native Swahili speaker', 'Good earphones', 'Keen listening skills'],
    85
),
(
    'E-Commerce Product Categorization & Image Tagging', 
    'Data Entry', 
    300.00, 
    '10 mins', 
    'Beginner', 
    'active', 
    'Tag 15 online retail items with appropriate subcategories, color attributes, and material tags for a leading African retail marketplace.',
    'Verify that bounding boxes align with products and attributes match product images accurately.',
    ARRAY['Basic computer literacy', 'High accuracy'],
    200
),
(
    'Mobile Banking & M-Pesa Usability Feedback Survey', 
    'Surveys & Research', 
    250.00, 
    '8 mins', 
    'Beginner', 
    'active', 
    'Complete an 8-question structured survey exploring your experience with USSD vs. App-based mobile money transactions in Kenya.',
    'Answer all multiple-choice questions genuinely and write at least two sentences on feature improvements.',
    ARRAY['Active M-Pesa user', 'Honest subjective feedback'],
    350
),
(
    'Medical Prescription Transcription Proofreading', 
    'Transcription', 
    850.00, 
    '25 mins', 
    'Advanced', 
    'active', 
    'Verify digitized doctor clinical notes against anonymized handwritten scans for pharmaceutical dosages and medical terms.',
    'Cross-check drug names with the provided medical dictionary. Flag any illegible text with [UNCLEAR].',
    ARRAY['High typing speed', 'Precision focus', 'Medical terminology familiarity is a plus'],
    45
),
(
    'Social Media Community Content Moderation', 
    'Content Review', 
    400.00, 
    '12 mins', 
    'Intermediate', 
    'active', 
    'Audit 25 user comments and posts for violations of community guidelines, including spam, harassment, and hate speech.',
    'Classify each post as Safe, Borderline, or Toxic based on the provided moderation taxonomy.',
    ARRAY['Good comprehension', 'Objective judgment', 'Emotional resilience'],
    160
),
(
    'Nairobi Local Business Google Maps POI Verification', 
    'Verification', 
    350.00, 
    '10 mins', 
    'Beginner', 
    'active', 
    'Verify operating hours, phone numbers, and physical building signage for listed businesses along major Nairobi roads.',
    'Compare current Google Maps street data with business directory records. Update missing phone codes.',
    ARRAY['Familiarity with Nairobi geography', 'Internet access'],
    110
),
(
    'Android Micro-Lending App Usability Testing', 
    'Testing & QA', 
    750.00, 
    '20 mins', 
    'Intermediate', 
    'active', 
    'Walk through onboarding, KYC document upload, and loan calculator screens on a test Android APK. Report any UI bugs or glitches.',
    'Capture 3 screenshots of each key step and list any confusing navigation points.',
    ARRAY['Android smartphone', 'Ability to write structured bug descriptions'],
    70
)
ON CONFLICT DO NOTHING;
