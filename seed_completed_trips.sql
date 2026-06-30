-- Seed script for 5 Completed Dispatches, Trip Logs, and Fuel tracking.
-- This script uses an anonymous PL/pgSQL block to automatically pick valid driver and vehicle IDs,
-- ensuring it runs perfectly in your Supabase environment.
-- 
-- Run this script in the Supabase SQL Editor.

-- 0. Ensure missing columns are added first
ALTER TABLE public.trip_logs ADD COLUMN IF NOT EXISTS fuel_issued_liters NUMERIC;
ALTER TABLE public.trip_logs ADD COLUMN IF NOT EXISTS fuel_cost_per_liter NUMERIC;
ALTER TABLE public.trip_logs ADD COLUMN IF NOT EXISTS route_deviations INTEGER;
ALTER TABLE public.trip_logs ADD COLUMN IF NOT EXISTS policy_violations INTEGER;
ALTER TABLE public.trip_logs ADD COLUMN IF NOT EXISTS corporate_account_id UUID;
ALTER TABLE public.trip_logs ADD COLUMN IF NOT EXISTS dispatch_id UUID;
ALTER TABLE public.trip_logs ADD COLUMN IF NOT EXISTS project_code VARCHAR(255);
ALTER TABLE public.trip_logs ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50);
ALTER TABLE public.trip_logs ADD COLUMN IF NOT EXISTS legs JSONB;
ALTER TABLE public.trip_logs ADD COLUMN IF NOT EXISTS passengers JSONB;

ALTER TABLE public.active_dispatches ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE public.completed_dispatches ADD COLUMN IF NOT EXISTS project_id UUID;

ALTER TABLE public.fuel_collections ADD COLUMN IF NOT EXISTS is_partner_station BOOLEAN DEFAULT false;
ALTER TABLE public.fuel_collections ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.fuel_collections ADD COLUMN IF NOT EXISTS vehicle_id UUID;
ALTER TABLE public.fuel_collections ADD COLUMN IF NOT EXISTS time TIME;
ALTER TABLE public.fuel_collections ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);
ALTER TABLE public.fuel_collections ADD COLUMN IF NOT EXISTS total_cost NUMERIC;
ALTER TABLE public.fuel_collections ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100);
ALTER TABLE public.fuel_collections ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100);

DO $$
DECLARE
  v_driver_1 UUID; v_vehicle_1 UUID; v_corp_1 UUID;
  v_driver_2 UUID; v_vehicle_2 UUID;
  v_driver_3 UUID; v_vehicle_3 UUID;
  v_driver_4 UUID; v_vehicle_4 UUID;
  v_driver_5 UUID; v_vehicle_5 UUID;
  
  d_id UUID; t_id UUID; f_id UUID;
BEGIN
  -- Get 5 drivers and 5 vehicles
  SELECT id INTO v_driver_1 FROM public.drivers LIMIT 1;
  SELECT id INTO v_driver_2 FROM public.drivers OFFSET 1 LIMIT 1;
  SELECT id INTO v_driver_3 FROM public.drivers OFFSET 2 LIMIT 1;
  SELECT id INTO v_driver_4 FROM public.drivers OFFSET 3 LIMIT 1;
  SELECT id INTO v_driver_5 FROM public.drivers OFFSET 4 LIMIT 1;

  SELECT id INTO v_vehicle_1 FROM public.vehicles LIMIT 1;
  SELECT id INTO v_vehicle_2 FROM public.vehicles OFFSET 1 LIMIT 1;
  SELECT id INTO v_vehicle_3 FROM public.vehicles OFFSET 2 LIMIT 1;
  SELECT id INTO v_vehicle_4 FROM public.vehicles OFFSET 3 LIMIT 1;
  SELECT id INTO v_vehicle_5 FROM public.vehicles OFFSET 4 LIMIT 1;
  
  SELECT id INTO v_corp_1 FROM public.corporate_accounts LIMIT 1;

  -- =========================================================================
  -- 1. TRIP 1 (Freetown to Bo - Business Trip)
  -- =========================================================================
  d_id := gen_random_uuid(); t_id := gen_random_uuid();
  INSERT INTO public.completed_dispatches 
    (id, original_dispatch_id, driver_id, vehicle_id, corporate_account_id, dispatch_time, odometer_out, fuel_level_out, condition_out, expected_return_date, completed_at, trip_log_id)
  VALUES 
    (d_id, gen_random_uuid(), v_driver_1, v_vehicle_1, v_corp_1, NOW() - INTERVAL '5 days', 120000, 'Full', 'Clean, minor scratch on bumper', CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '2 days', t_id);
    
  INSERT INTO public.trip_logs
    (id, date, driver_id, vehicle_id, district, distance_traveled_km, fuel_consumed_liters, fuel_issued_liters, fuel_cost_per_liter, incidents, speeding_events, harsh_braking, idling_time_hours, route_deviations, policy_violations, maintenance_issues_logged, corporate_account_id, notes, dispatch_id, project_code, approval_status, legs, passengers)
  VALUES
    (t_id, CURRENT_DATE - INTERVAL '2 days', v_driver_1, v_vehicle_1, 'Bo', 255.5, 30, 35, 30.50, 0, 1, 0, 1.5, 0, 0, false, v_corp_1, 'Smooth trip to Bo, heavy traffic at Waterloo checkpoint.', d_id, 'PRJ-102', 'Approved', 
    '[{"departurePoint": "Freetown", "destinationPoint": "Bo", "departureTime": "08:00", "arrivalTime": "13:30", "odometerStart": 120000, "odometerEnd": 120255.5, "purposeOfTrip": "Site Inspection"}]'::jsonb, 
    '[{"name": "Ibrahim Kamara"}]'::jsonb);
    
  INSERT INTO public.fuel_collections
    (id, trip_log_id, driver_id, vehicle_id, date, time, station_name, supplier, is_partner_station, location, fuel_type, liters, cost_per_liter, total_cost, payment_method, receipt_number, notes)
  VALUES
    (gen_random_uuid(), t_id, v_driver_1, v_vehicle_1, CURRENT_DATE - INTERVAL '4 days', '09:15:00', 'NP Waterloo', 'NP', true, 'Waterloo', 'Diesel', 35, 30.50, 1067.50, 'Corporate Card', 'RCP-8821', 'Refueled on the way to Bo');


  -- =========================================================================
  -- 2. TRIP 2 (Freetown Local Shuttle)
  -- =========================================================================
  d_id := gen_random_uuid(); t_id := gen_random_uuid();
  INSERT INTO public.completed_dispatches 
    (id, original_dispatch_id, driver_id, vehicle_id, corporate_account_id, dispatch_time, odometer_out, fuel_level_out, condition_out, expected_return_date, completed_at, trip_log_id)
  VALUES 
    (d_id, gen_random_uuid(), v_driver_2, v_vehicle_2, NULL, NOW() - INTERVAL '3 days', 85000, 'Half', 'Perfect condition', CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '8 hours', t_id);
    
  INSERT INTO public.trip_logs
    (id, date, driver_id, vehicle_id, district, distance_traveled_km, fuel_consumed_liters, fuel_issued_liters, fuel_cost_per_liter, incidents, speeding_events, harsh_braking, idling_time_hours, route_deviations, policy_violations, maintenance_issues_logged, corporate_account_id, notes, dispatch_id, project_code, approval_status, legs, passengers)
  VALUES
    (t_id, CURRENT_DATE - INTERVAL '3 days', v_driver_2, v_vehicle_2, 'Western Area Urban', 45, 8, 10, 30.50, 0, 0, 2, 3.2, 0, 0, false, NULL, 'City shuttle rounds, heavy AC usage leading to idling.', d_id, 'LOCAL-SHUTTLE', 'Approved', 
    '[{"departurePoint": "Lumina HQ", "destinationPoint": "Aberdeen", "departureTime": "09:00", "arrivalTime": "09:45"}, {"departurePoint": "Aberdeen", "destinationPoint": "Lumina HQ", "departureTime": "16:00", "arrivalTime": "17:00"}]'::jsonb, 
    '[{"name": "Sarah Mensah"}, {"name": "David Conteh"}]'::jsonb);
    
  INSERT INTO public.fuel_collections
    (id, trip_log_id, driver_id, vehicle_id, date, time, station_name, supplier, is_partner_station, location, fuel_type, liters, cost_per_liter, total_cost, payment_method, receipt_number, notes)
  VALUES
    (gen_random_uuid(), t_id, v_driver_2, v_vehicle_2, CURRENT_DATE - INTERVAL '3 days', '08:45:00', 'TotalEnergies Lumley', 'TotalEnergies', true, 'Freetown', 'Petrol', 10, 30.50, 305.00, 'Voucher', 'VCH-099', 'Morning top-up');


  -- =========================================================================
  -- 3. TRIP 3 (Makeni Run - Maintenance Flagged)
  -- =========================================================================
  d_id := gen_random_uuid(); t_id := gen_random_uuid();
  INSERT INTO public.completed_dispatches 
    (id, original_dispatch_id, driver_id, vehicle_id, corporate_account_id, dispatch_time, odometer_out, fuel_level_out, condition_out, expected_return_date, completed_at, trip_log_id)
  VALUES 
    (d_id, gen_random_uuid(), v_driver_3, v_vehicle_3, v_corp_1, NOW() - INTERVAL '7 days', 210050, 'Quarter', 'AC making noise', CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '4 days', t_id);
    
  INSERT INTO public.trip_logs
    (id, date, driver_id, vehicle_id, district, distance_traveled_km, fuel_consumed_liters, fuel_issued_liters, fuel_cost_per_liter, incidents, speeding_events, harsh_braking, idling_time_hours, route_deviations, policy_violations, maintenance_issues_logged, corporate_account_id, notes, dispatch_id, project_code, approval_status, legs, passengers)
  VALUES
    (t_id, CURRENT_DATE - INTERVAL '4 days', v_driver_3, v_vehicle_3, 'Bombali', 380, 50, 60, 30.50, 1, 3, 1, 1.0, 1, 1, true, v_corp_1, 'Vehicle broke down briefly near Lunsar, radiator overheated.', d_id, 'PRJ-MAK', 'Flagged', 
    '[{"departurePoint": "Freetown", "destinationPoint": "Makeni", "departureTime": "06:30", "arrivalTime": "11:00"}, {"departurePoint": "Makeni", "destinationPoint": "Freetown", "departureTime": "14:00", "arrivalTime": "19:00"}]'::jsonb, 
    '[]'::jsonb);
    
  INSERT INTO public.fuel_collections
    (id, trip_log_id, driver_id, vehicle_id, date, time, station_name, supplier, is_partner_station, location, fuel_type, liters, cost_per_liter, total_cost, payment_method, invoice_number, notes)
  VALUES
    (gen_random_uuid(), t_id, v_driver_3, v_vehicle_3, CURRENT_DATE - INTERVAL '7 days', '06:00:00', 'Malado Lunsar', 'Malado', false, 'Lunsar', 'Diesel', 60, 30.50, 1830.00, 'Cash', 'INV-5501', 'Emergency refuel on highway');


  -- =========================================================================
  -- 4. TRIP 4 (Kenema VIP Transport)
  -- =========================================================================
  d_id := gen_random_uuid(); t_id := gen_random_uuid();
  INSERT INTO public.completed_dispatches 
    (id, original_dispatch_id, driver_id, vehicle_id, corporate_account_id, dispatch_time, odometer_out, fuel_level_out, condition_out, expected_return_date, completed_at, trip_log_id)
  VALUES 
    (d_id, gen_random_uuid(), v_driver_4, v_vehicle_4, NULL, NOW() - INTERVAL '2 days', 95000, 'Full', 'Pristine, just washed', CURRENT_DATE, NOW() - INTERVAL '1 hour', t_id);
    
  INSERT INTO public.trip_logs
    (id, date, driver_id, vehicle_id, district, distance_traveled_km, fuel_consumed_liters, fuel_issued_liters, fuel_cost_per_liter, incidents, speeding_events, harsh_braking, idling_time_hours, route_deviations, policy_violations, maintenance_issues_logged, corporate_account_id, notes, dispatch_id, project_code, approval_status, legs, passengers)
  VALUES
    (t_id, CURRENT_DATE, v_driver_4, v_vehicle_4, 'Kenema', 600, 75, 80, 30.50, 0, 0, 0, 4.0, 0, 0, false, NULL, 'VIP transport to Kenema. Smooth drive, no issues.', d_id, 'VIP-TRANS', 'Approved', 
    '[{"departurePoint": "Freetown", "destinationPoint": "Kenema", "departureTime": "07:00", "arrivalTime": "12:30"}, {"departurePoint": "Kenema", "destinationPoint": "Freetown", "departureTime": "15:00", "arrivalTime": "21:00"}]'::jsonb, 
    '[{"name": "Minister of Energy"}]'::jsonb);
    
  INSERT INTO public.fuel_collections
    (id, trip_log_id, driver_id, vehicle_id, date, time, station_name, supplier, is_partner_station, location, fuel_type, liters, cost_per_liter, total_cost, payment_method, receipt_number, notes)
  VALUES
    (gen_random_uuid(), t_id, v_driver_4, v_vehicle_4, CURRENT_DATE - INTERVAL '2 days', '06:45:00', 'NP Congo Cross', 'NP', true, 'Freetown', 'Diesel', 40, 30.50, 1220.00, 'Corporate Card', 'RCP-1192', 'Fill up before departure'),
    (gen_random_uuid(), t_id, v_driver_4, v_vehicle_4, CURRENT_DATE, '14:30:00', 'Total Kenema', 'TotalEnergies', true, 'Kenema', 'Diesel', 40, 30.50, 1220.00, 'Corporate Card', 'RCP-9912', 'Fill up for return trip');


  -- =========================================================================
  -- 5. TRIP 5 (Airport Shuttle)
  -- =========================================================================
  d_id := gen_random_uuid(); t_id := gen_random_uuid();
  INSERT INTO public.completed_dispatches 
    (id, original_dispatch_id, driver_id, vehicle_id, corporate_account_id, dispatch_time, odometer_out, fuel_level_out, condition_out, expected_return_date, completed_at, trip_log_id)
  VALUES 
    (d_id, gen_random_uuid(), v_driver_5, v_vehicle_5, v_corp_1, NOW() - INTERVAL '1 day', 150200, 'Three Quarter', 'Good condition', CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '12 hours', t_id);
    
  INSERT INTO public.trip_logs
    (id, date, driver_id, vehicle_id, district, distance_traveled_km, fuel_consumed_liters, fuel_issued_liters, fuel_cost_per_liter, incidents, speeding_events, harsh_braking, idling_time_hours, route_deviations, policy_violations, maintenance_issues_logged, corporate_account_id, notes, dispatch_id, project_code, approval_status, legs, passengers)
  VALUES
    (t_id, CURRENT_DATE - INTERVAL '1 day', v_driver_5, v_vehicle_5, 'Port Loko', 180, 25, 25, 30.50, 0, 1, 0, 2.5, 0, 0, false, v_corp_1, 'Freetown to Lungi Airport and back.', d_id, 'AIR-TRANSFER', 'Pending', 
    '[{"departurePoint": "Freetown HQ", "destinationPoint": "Lungi Airport", "departureTime": "18:00", "arrivalTime": "21:00"}, {"departurePoint": "Lungi Airport", "destinationPoint": "Freetown HQ", "departureTime": "22:00", "arrivalTime": "01:00"}]'::jsonb, 
    '[{"name": "Client Delegate A"}, {"name": "Client Delegate B"}]'::jsonb);
    
  INSERT INTO public.fuel_collections
    (id, trip_log_id, driver_id, vehicle_id, date, time, station_name, supplier, is_partner_station, location, fuel_type, liters, cost_per_liter, total_cost, payment_method, receipt_number, notes)
  VALUES
    (gen_random_uuid(), t_id, v_driver_5, v_vehicle_5, CURRENT_DATE - INTERVAL '1 day', '17:30:00', 'NP Ferry Junction', 'NP', true, 'Freetown', 'Petrol', 25, 30.50, 762.50, 'Corporate Card', 'RCP-334', 'Pre-airport fuel');

END $$;
