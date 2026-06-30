GRANT ALL ON TABLE public.fuel_cities TO anon, authenticated;
GRANT ALL ON TABLE public.fuel_stations TO anon, authenticated;

-- Force Supabase to reload the API schema
NOTIFY pgrst, reload_schema;