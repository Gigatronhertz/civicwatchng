
CREATE TYPE public.app_role AS ENUM ('admin','officer');
CREATE TYPE public.report_status AS ENUM ('submitted','under_review','in_progress','resolved','rejected');
CREATE TYPE public.report_category AS ENUM ('crime','corruption','public_safety','environment','infrastructure','other');
CREATE TYPE public.report_priority AS ENUM ('low','medium','high','critical');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE,
  category public.report_category NOT NULL DEFAULT 'other',
  subject text NOT NULL,
  details text NOT NULL,
  location_text text,
  latitude double precision,
  longitude double precision,
  incident_at timestamptz,
  status public.report_status NOT NULL DEFAULT 'submitted',
  priority public.report_priority NOT NULL DEFAULT 'medium',
  is_anonymous boolean NOT NULL DEFAULT true,
  contact_email text,
  contact_phone text,
  reporter_id uuid,
  evidence_paths text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.generate_reference_code()
RETURNS text LANGUAGE plpgsql VOLATILE SET search_path = public AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
  i int;
BEGIN
  LOOP
    code := 'CTS-';
    FOR i IN 1..8 LOOP
      code := code || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.reports r WHERE r.reference_code = code);
  END LOOP;
  RETURN code;
END;
$$;
ALTER TABLE public.reports ALTER COLUMN reference_code SET DEFAULT public.generate_reference_code();

GRANT INSERT ON public.reports TO anon;
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit" ON public.reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "staff read reports" ON public.reports FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "reporter reads own" ON public.reports FOR SELECT TO authenticated USING (reporter_id IS NOT NULL AND reporter_id = auth.uid());
CREATE POLICY "staff update reports" ON public.reports FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.report_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  status public.report_status,
  note text NOT NULL,
  is_public boolean NOT NULL DEFAULT true,
  author_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.report_updates TO authenticated;
GRANT ALL ON public.report_updates TO service_role;
ALTER TABLE public.report_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read updates" ON public.report_updates FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff add updates" ON public.report_updates FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

CREATE INDEX reports_status_idx ON public.reports(status);
CREATE INDEX reports_created_idx ON public.reports(created_at DESC);
CREATE INDEX report_updates_report_idx ON public.report_updates(report_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER reports_updated_at BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.track_report(_reference_code text)
RETURNS TABLE (
  reference_code text,
  category public.report_category,
  subject text,
  status public.report_status,
  priority public.report_priority,
  created_at timestamptz,
  updated_at timestamptz,
  updates jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.reference_code, r.category, r.subject, r.status, r.priority, r.created_at, r.updated_at,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object('note', u.note, 'status', u.status, 'created_at', u.created_at) ORDER BY u.created_at DESC)
      FROM public.report_updates u WHERE u.report_id = r.id AND u.is_public
    ), '[]'::jsonb)
  FROM public.reports r
  WHERE upper(trim(r.reference_code)) = upper(trim(_reference_code));
$$;
GRANT EXECUTE ON FUNCTION public.track_report(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.public_stats()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM public.reports),
    'resolved', (SELECT count(*) FROM public.reports WHERE status = 'resolved'),
    'in_progress', (SELECT count(*) FROM public.reports WHERE status IN ('under_review','in_progress'))
  );
$$;
GRANT EXECUTE ON FUNCTION public.public_stats() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
