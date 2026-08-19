
CREATE OR REPLACE FUNCTION public.assign_reference_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
  i int;
BEGIN
  IF NEW.reference_code IS NOT NULL AND NEW.reference_code <> '' THEN
    RETURN NEW;
  END IF;
  LOOP
    code := 'CTS-';
    FOR i IN 1..8 LOOP
      code := code || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.reference_code = code);
  END LOOP;
  NEW.reference_code := code;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.assign_reference_code() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.reports ALTER COLUMN reference_code DROP DEFAULT;
ALTER TABLE public.reports ALTER COLUMN reference_code DROP NOT NULL;
DROP FUNCTION IF EXISTS public.generate_reference_code();

CREATE TRIGGER reports_assign_reference_code BEFORE INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.assign_reference_code();

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
