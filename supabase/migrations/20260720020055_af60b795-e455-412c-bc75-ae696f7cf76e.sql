
REVOKE ALL ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.attach_referral(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.attach_referral(text) TO authenticated;
