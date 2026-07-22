
CREATE OR REPLACE FUNCTION public.attach_referral(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _referrer uuid;
  _current uuid := auth.uid();
  _updated boolean := false;
BEGIN
  IF _current IS NULL THEN RETURN false; END IF;
  IF _code IS NULL OR length(_code) < 4 THEN RETURN false; END IF;

  SELECT id INTO _referrer FROM public.profiles WHERE upper(referral_code) = upper(_code);
  IF _referrer IS NULL OR _referrer = _current THEN RETURN false; END IF;

  UPDATE public.profiles
     SET referred_by = _referrer
   WHERE id = _current AND referred_by IS NULL;
  GET DIAGNOSTICS _updated = ROW_COUNT;

  -- Insert pending referral row if none exists yet for this user
  INSERT INTO public.referrals (referrer_id, referred_user_id, status, commission_cents, currency)
  VALUES (_referrer, _current, 'pending', 0, 'USD')
  ON CONFLICT (referred_user_id) DO NOTHING;

  RETURN _updated;
END;
$$;

-- Ensure a user can only be referred once
CREATE UNIQUE INDEX IF NOT EXISTS referrals_referred_user_id_key ON public.referrals(referred_user_id);

-- Allow referrer to read the referred user's email via a security-definer helper
CREATE OR REPLACE FUNCTION public.get_referred_emails(_ids uuid[])
RETURNS TABLE(id uuid, email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.email
  FROM public.profiles p
  WHERE p.id = ANY(_ids)
    AND EXISTS (
      SELECT 1 FROM public.referrals r
      WHERE r.referrer_id = auth.uid() AND r.referred_user_id = p.id
    );
$$;

GRANT EXECUTE ON FUNCTION public.get_referred_emails(uuid[]) TO authenticated;
