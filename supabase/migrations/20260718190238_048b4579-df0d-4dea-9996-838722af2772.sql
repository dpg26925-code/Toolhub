CREATE POLICY "Users can insert their own usage" ON public.usage_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);