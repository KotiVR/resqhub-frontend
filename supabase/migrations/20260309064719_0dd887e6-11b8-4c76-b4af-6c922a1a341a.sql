
CREATE TABLE public.emergency_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text,
  age integer,
  gender text,
  address text,
  city_state text,
  blood_group text,
  phone_number text,
  guardian_name text,
  emergency_contact_1 text,
  emergency_contact_2 text,
  emergency_relationship text,
  medical_conditions text,
  allergies text,
  current_medications text,
  disability_info text,
  doctor_name text,
  doctor_contact text,
  preferred_hospital text,
  insurance_info text,
  organ_donor boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.emergency_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emergency profile"
  ON public.emergency_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency profile"
  ON public.emergency_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency profile"
  ON public.emergency_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_emergency_profiles_updated_at
  BEFORE UPDATE ON public.emergency_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
