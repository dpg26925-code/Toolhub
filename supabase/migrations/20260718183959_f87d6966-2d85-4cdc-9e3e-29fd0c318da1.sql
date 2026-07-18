
CREATE OR REPLACE FUNCTION public.consume_credits(_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _remaining integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '42501';
  END IF;
  IF _amount IS NULL OR _amount < 1 THEN
    RAISE EXCEPTION 'invalid amount' USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles
     SET credits = credits - _amount
   WHERE id = auth.uid()
     AND credits >= _amount
  RETURNING credits INTO _remaining;

  IF _remaining IS NULL THEN
    RAISE EXCEPTION 'insufficient_credits' USING ERRCODE = 'P0001';
  END IF;

  RETURN _remaining;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_credits(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_credits(integer) TO authenticated;
