-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Note: Supabase provides auth.uid() by default
-- We'll use it directly in policies

-- USERS POLICIES
-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Allow service role to read all users (for admin operations)
CREATE POLICY "Service role can read all users"
  ON users FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

-- PROFESSIONAL PROFILES POLICIES
-- Professionals can read and update their own profile
CREATE POLICY "Professionals can manage own profile"
  ON professional_profiles FOR ALL
  USING (auth.uid() = user_id);

-- Parents can read professional profiles (for search)
-- Only show profiles where identity_verified = true
CREATE POLICY "Parents can view verified professional profiles"
  ON professional_profiles FOR SELECT
  USING (
    identity_verified = true AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'parent'
    )
  );

-- PARENT PROFILES POLICIES
CREATE POLICY "Parents can manage own profile"
  ON parent_profiles FOR ALL
  USING (auth.uid() = user_id);

-- JOBS POLICIES
-- Parents can create and manage their own jobs
CREATE POLICY "Parents can manage own jobs"
  ON jobs FOR ALL
  USING (
    parent_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'parent'
    )
  );

-- Professionals can view and update jobs they're involved in
CREATE POLICY "Professionals can view assigned jobs"
  ON jobs FOR SELECT
  USING (
    professional_id = auth.uid() OR
    (status = 'open' AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'professional'
    ))
  );

CREATE POLICY "Professionals can update assigned jobs"
  ON jobs FOR UPDATE
  USING (
    professional_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'professional'
    )
  );

-- Professionals can apply to open jobs (update professional_id)
CREATE POLICY "Professionals can apply to open jobs"
  ON jobs FOR UPDATE
  USING (
    status = 'open' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'professional'
    )
  )
  WITH CHECK (
    professional_id = auth.uid()
  );

-- MESSAGES POLICIES
-- Users can only see messages for jobs they're involved in
CREATE POLICY "Users can view messages for their jobs"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = messages.job_id
      AND (jobs.parent_id = auth.uid() OR jobs.professional_id = auth.uid())
    )
  );

-- Users can send messages for jobs they're involved in
CREATE POLICY "Users can send messages for their jobs"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = messages.job_id
      AND (jobs.parent_id = auth.uid() OR jobs.professional_id = auth.uid())
    )
  );

-- SUBSCRIPTIONS POLICIES
-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- AI USAGE LOGS POLICIES
-- Users can only see their own usage logs
CREATE POLICY "Users can view own usage logs"
  ON ai_usage_logs FOR SELECT
  USING (user_id = auth.uid());

-- Service role can insert usage logs (for tracking)
CREATE POLICY "Service role can insert usage logs"
  ON ai_usage_logs FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

