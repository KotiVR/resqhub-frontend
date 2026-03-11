
-- Create chat_logs table
CREATE TABLE public.chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own chat logs
CREATE POLICY "Users can view own chat logs"
ON public.chat_logs FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert own chat logs
CREATE POLICY "Users can insert own chat logs"
ON public.chat_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow anonymous inserts (for non-logged-in users)
CREATE POLICY "Anonymous users can insert chat logs"
ON public.chat_logs FOR INSERT
WITH CHECK (user_id IS NULL);

-- Admins can view all chat logs
CREATE POLICY "Admins can view all chat logs"
ON public.chat_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
