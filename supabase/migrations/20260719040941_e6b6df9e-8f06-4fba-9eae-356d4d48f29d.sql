
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.refill_free_credits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _count integer;
BEGIN
  UPDATE public.profiles
     SET credits = 10
   WHERE plan = 'free' AND credits < 10;
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

SELECT cron.unschedule('refill-free-credits-daily')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refill-free-credits-daily');

SELECT cron.schedule(
  'refill-free-credits-daily',
  '0 0 * * *',
  $$ SELECT public.refill_free_credits(); $$
);
