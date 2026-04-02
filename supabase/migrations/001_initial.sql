-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  coins INTEGER DEFAULT 100,
  is_verified BOOLEAN DEFAULT false,
  is_disabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tiktok_url TEXT NOT NULL,
  target_followers INTEGER NOT NULL,
  current_followers INTEGER DEFAULT 0,
  cost INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_follows_user_id ON follows(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_ad_id ON follows(ad_id);
CREATE INDEX IF NOT EXISTS idx_follows_status ON follows(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Service role bypass (used by our API with service role key)
-- All operations go through API routes using service role key, so we allow all for service role
CREATE POLICY "Service role full access users" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access ads" ON ads FOR ALL USING (true);
CREATE POLICY "Service role full access follows" ON follows FOR ALL USING (true);
CREATE POLICY "Service role full access transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Service role full access admin_users" ON admin_users FOR ALL USING (true);
CREATE POLICY "Service role full access otp_codes" ON otp_codes FOR ALL USING (true);
CREATE POLICY "Service role full access contact_messages" ON contact_messages FOR ALL USING (true);

-- Supabase Storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for screenshots
CREATE POLICY "Public screenshots read" ON storage.objects FOR SELECT USING (bucket_id = 'screenshots');
CREATE POLICY "Authenticated screenshots upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'screenshots');
