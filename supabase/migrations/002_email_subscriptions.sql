-- ============================================
-- Email Subscriptions Migration
-- Vue Blog Application
-- ============================================

-- ============================================
-- 1. EMAIL SUBSCRIPTIONS TABLE
-- ============================================
-- ตารางสำหรับเก็บการตั้งค่าการรับอีเมลของผู้ใช้

CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscription_updates BOOLEAN DEFAULT true,
  new_articles BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own email subscriptions
CREATE POLICY "Users can view own email subscriptions"
  ON public.email_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own email subscriptions
CREATE POLICY "Users can insert own email subscriptions"
  ON public.email_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own email subscriptions
CREATE POLICY "Users can update own email subscriptions"
  ON public.email_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_user ON public.email_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_enabled ON public.email_subscriptions(enabled, new_articles);

-- ============================================
-- 2. EMAIL LOGS TABLE
-- ============================================
-- ตารางสำหรับเก็บ log การส่งอีเมล

CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('subscription_update', 'new_article', 'weekly_digest', 'marketing')),
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  error_message TEXT,
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own email logs
CREATE POLICY "Users can view own email logs"
  ON public.email_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert email logs
CREATE POLICY "System can insert email logs"
  ON public.email_logs FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_user ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON public.email_logs(email_type, created_at DESC);

-- ============================================
-- 3. FUNCTIONS
-- ============================================

-- Function to create default email subscription for new users
CREATE OR REPLACE FUNCTION public.create_default_email_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_subscriptions (user_id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default email subscription
DROP TRIGGER IF EXISTS on_profile_created_email_subscription ON public.profiles;
CREATE TRIGGER on_profile_created_email_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_email_subscription();

-- Function to update updated_at timestamp
CREATE TRIGGER update_email_subscriptions_updated_at
  BEFORE UPDATE ON public.email_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to send email notification (calls Edge Function)
CREATE OR REPLACE FUNCTION public.send_email_notification(
  p_user_id UUID,
  p_email_type TEXT,
  p_subject TEXT,
  p_html_content TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_email_subscription RECORD;
  v_user_email TEXT;
  v_result JSONB;
BEGIN
  -- Get user email subscription settings
  SELECT es.*, p.email as user_email
  INTO v_email_subscription
  FROM public.email_subscriptions es
  JOIN public.profiles p ON es.user_id = p.id
  WHERE es.user_id = p_user_id
    AND es.enabled = true;

  -- Check if user has email subscription
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email subscription not found or disabled'
    );
  END IF;

  -- Check if this email type is enabled
  IF p_email_type = 'subscription_update' AND v_email_subscription.subscription_updates = false THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Subscription updates emails are disabled'
    );
  END IF;

  IF p_email_type = 'new_article' AND v_email_subscription.new_articles = false THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'New articles emails are disabled'
    );
  END IF;

  -- Use user email from subscription or profile
  v_user_email := COALESCE(v_email_subscription.email, v_email_subscription.user_email);

  -- Insert email log
  INSERT INTO public.email_logs (
    user_id,
    email,
    email_type,
    subject,
    status,
    metadata
  ) VALUES (
    p_user_id,
    v_user_email,
    p_email_type,
    p_subject,
    'pending',
    p_metadata
  ) RETURNING id INTO v_result;

  -- Note: Actual email sending will be handled by Edge Function
  -- This function just logs the email request
  -- The Edge Function will be called via pg_net or webhook

  RETURN jsonb_build_object(
    'success', true,
    'log_id', v_result->>'id',
    'email', v_user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify subscribers about new article
CREATE OR REPLACE FUNCTION public.notify_subscribers_new_article()
RETURNS TRIGGER AS $$
DECLARE
  v_subscriber RECORD;
  v_article_url TEXT;
  v_email_subject TEXT;
  v_email_html TEXT;
  v_should_send BOOLEAN := false;
BEGIN
  -- Check if we should send email
  -- For INSERT: send if published = true
  -- For UPDATE: send if changed from false to true
  IF TG_OP = 'INSERT' THEN
    v_should_send := NEW.published = true;
  ELSIF TG_OP = 'UPDATE' THEN
    v_should_send := NEW.published = true AND (OLD.published IS NULL OR OLD.published = false);
  END IF;

  -- Only send email if article is being published
  IF v_should_send THEN
    -- Get article URL (adjust based on your domain)
    v_article_url := 'https://wongshare-5ed5c.web.app/article/' || NEW.slug;
    
    -- Email subject
    v_email_subject := 'บทความใหม่: ' || NEW.title;
    
    -- Email HTML content
    v_email_html := '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .article { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>บทความใหม่!</h1>
    </div>
    <div class="content">
      <div class="article">
        <h2>' || NEW.title || '</h2>
        <p>' || COALESCE(NEW.excerpt, LEFT(NEW.content, 200)) || '...</p>
        <a href="' || v_article_url || '" class="button">อ่านต่อ</a>
      </div>
    </div>
    <div class="footer">
      <p>คุณได้รับอีเมลนี้เพราะคุณได้สมัครรับการแจ้งเตือนบทความใหม่</p>
      <p><a href="https://wongshare-5ed5c.web.app/settings/email">จัดการการตั้งค่าอีเมล</a></p>
    </div>
  </div>
</body>
</html>';

    -- Send email to all subscribers who have new_articles enabled
    FOR v_subscriber IN
      SELECT es.user_id, es.email, p.email as user_email
      FROM public.email_subscriptions es
      JOIN public.profiles p ON es.user_id = p.id
      WHERE es.enabled = true
        AND es.new_articles = true
        AND es.user_id != NEW.author_id  -- Don't send to author
    LOOP
      PERFORM public.send_email_notification(
        v_subscriber.user_id,
        'new_article',
        v_email_subject,
        v_email_html,
        jsonb_build_object(
          'article_id', NEW.id,
          'article_slug', NEW.slug,
          'article_title', NEW.title
        )
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify subscribers about new article (for INSERT)
DROP TRIGGER IF EXISTS on_article_inserted_notify ON public.articles;
CREATE TRIGGER on_article_inserted_notify
  AFTER INSERT ON public.articles
  FOR EACH ROW
  WHEN (NEW.published = true)
  EXECUTE FUNCTION public.notify_subscribers_new_article();

-- Trigger to notify subscribers about new article (for UPDATE)
DROP TRIGGER IF EXISTS on_article_updated_notify ON public.articles;
CREATE TRIGGER on_article_updated_notify
  AFTER UPDATE OF published ON public.articles
  FOR EACH ROW
  WHEN (NEW.published = true AND (OLD.published IS NULL OR OLD.published = false))
  EXECUTE FUNCTION public.notify_subscribers_new_article();

-- Function to notify user about subscription update
CREATE OR REPLACE FUNCTION public.notify_subscription_update()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
  v_email_subject TEXT;
  v_email_html TEXT;
  v_subscription_type_text TEXT;
BEGIN
  -- Only send email if subscription status or type changed
  IF (OLD.status IS DISTINCT FROM NEW.status) OR 
     (OLD.subscription_type IS DISTINCT FROM NEW.subscription_type) THEN
    
    -- Get user email
    SELECT email INTO v_user_email
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Subscription type text
    CASE NEW.subscription_type
      WHEN 'free' THEN v_subscription_type_text := 'ฟรี';
      WHEN 'premium' THEN v_subscription_type_text := 'Premium';
      WHEN 'pro' THEN v_subscription_type_text := 'Pro';
      ELSE v_subscription_type_text := NEW.subscription_type;
    END CASE;

    -- Email subject
    IF NEW.status = 'active' AND OLD.status != 'active' THEN
      v_email_subject := 'ยินดีต้อนรับสู่ ' || v_subscription_type_text || ' Subscription!';
    ELSIF NEW.status = 'cancelled' THEN
      v_email_subject := 'การสมัครสมาชิกของคุณถูกยกเลิกแล้ว';
    ELSIF NEW.status = 'expired' THEN
      v_email_subject := 'การสมัครสมาชิกของคุณหมดอายุแล้ว';
    ELSE
      v_email_subject := 'อัปเดตการสมัครสมาชิกของคุณ';
    END IF;

    -- Email HTML content
    v_email_html := '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4F46E5; }
    .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>อัปเดตการสมัครสมาชิก</h1>
    </div>
    <div class="content">
      <div class="info-box">
        <h2>สถานะการสมัครสมาชิก</h2>
        <p><strong>แผน:</strong> ' || v_subscription_type_text || '</p>
        <p><strong>สถานะ:</strong> ' || 
          CASE NEW.status
            WHEN 'active' THEN 'ใช้งานอยู่'
            WHEN 'cancelled' THEN 'ยกเลิกแล้ว'
            WHEN 'expired' THEN 'หมดอายุแล้ว'
            WHEN 'pending' THEN 'รอการยืนยัน'
            ELSE NEW.status
          END || '</p>';

    IF NEW.end_date IS NOT NULL THEN
      v_email_html := v_email_html || '<p><strong>วันหมดอายุ:</strong> ' || 
        TO_CHAR(NEW.end_date, 'DD/MM/YYYY') || '</p>';
    END IF;

    v_email_html := v_email_html || '
        <a href="https://your-domain.com/subscription" class="button">ดูรายละเอียด</a>
      </div>
    </div>
    <div class="footer">
      <p>คุณได้รับอีเมลนี้เพราะคุณได้สมัครรับการแจ้งเตือนการอัปเดตการสมัครสมาชิก</p>
      <p><a href="https://your-domain.com/settings/email">จัดการการตั้งค่าอีเมล</a></p>
    </div>
  </div>
</body>
</html>';

    -- Send email notification
    PERFORM public.send_email_notification(
      NEW.user_id,
      'subscription_update',
      v_email_subject,
      v_email_html,
      jsonb_build_object(
        'subscription_id', NEW.id,
        'subscription_type', NEW.subscription_type,
        'status', NEW.status,
        'old_status', OLD.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify about subscription update
DROP TRIGGER IF EXISTS on_subscription_updated_notify ON public.subscriptions;
CREATE TRIGGER on_subscription_updated_notify
  AFTER UPDATE ON public.subscriptions
  FOR EACH ROW
  WHEN (
    (OLD.status IS DISTINCT FROM NEW.status) OR 
    (OLD.subscription_type IS DISTINCT FROM NEW.subscription_type)
  )
  EXECUTE FUNCTION public.notify_subscription_update();

-- ============================================
-- 4. VIEWS
-- ============================================

-- View for email subscription status
CREATE OR REPLACE VIEW public.email_subscription_status AS
SELECT 
  es.*,
  p.email as user_email,
  p.full_name
FROM public.email_subscriptions es
JOIN public.profiles p ON es.user_id = p.id;

