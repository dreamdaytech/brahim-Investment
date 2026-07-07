-- ============================================================
-- BRAHIM CAR RENTALS - FLEET VEHICLES SEED DATA
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

-- 0. Ensure all required columns exist on vehicles table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS show_on_fleet BOOLEAN DEFAULT false;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_category TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS price_per_day NUMERIC DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_type TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS transmission TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS seats INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine_label TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS spec_engine_size TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS spec_drivetrain TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS spec_ground_clearance TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS spec_fuel_capacity TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS spec_best_for TEXT;
-- 1. Insert fleet vehicles
INSERT INTO vehicles (
  id, make_model, year, odometer, plate_number, insurance_expiry,
  condition, is_company_registered, type, status,
  image_url, gallery_urls,
  show_on_fleet, vehicle_category, description, price_per_day,
  features, fuel_type, transmission, seats, engine_label,
  spec_engine_size, spec_drivetrain, spec_ground_clearance,
  spec_fuel_capacity, spec_best_for
) VALUES

-- 1. Toyota Land Cruiser 200 Series
(
  'aaa00001-0000-0000-0000-000000000001',
  'Toyota Land Cruiser 200', 2022, 38500, 'BR-LC200-01', '2026-11-30',
  'Excellent', true, 'SUV', 'Available',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format',
  ARRAY[
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format',
    'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&auto=format',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format'
  ],
  true, 'Heavy SUV',
  'The flagship of our fleet. This full-size luxury SUV delivers uncompromised off-road capability with premium interior comfort. Ideal for executive transport, provincial tours, and demanding terrain.',
  250,
  ARRAY['4WD', 'Leather Seats', 'Sunroof', 'Android Auto', '360° Camera', 'Heated Seats', 'Cooled Box', '8-Seat'],
  'Diesel', 'Automatic', 8, '4.5L Twin-Turbo V8 Diesel',
  '4.5L V8 Diesel', '4WD Locking', '225mm', '93L', 'Long-distance tours, corporate groups, rugged terrain'
),

-- 2. Toyota Land Cruiser Prado 150
(
  'aaa00001-0000-0000-0000-000000000002',
  'Toyota Land Cruiser Prado 150', 2023, 21000, 'BR-PRADO-02', '2027-02-28',
  'Excellent', true, 'SUV', 'Available',
  'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&auto=format',
  ARRAY[
    'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&auto=format',
    'https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=800&auto=format',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format',
    'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&auto=format'
  ],
  true, 'SUV',
  'A refined mid-size SUV combining legendary Toyota reliability with genuine off-road prowess. Perfect for family trips and business travel across Papua New Guinea.',
  200,
  ARRAY['4WD', 'Leather Seats', 'Apple CarPlay', 'Reverse Camera', 'Roof Rack', 'Tow Bar', '7-Seat'],
  'Diesel', 'Automatic', 7, '2.8L Diesel Turbo',
  '2.8L 1GD-FTV', '4WD A-TRAC', '215mm', '87L', 'Family trips, provincial travel, light off-road'
),

-- 3. Toyota Fortuner
(
  'aaa00001-0000-0000-0000-000000000003',
  'Toyota Fortuner 2.8 GD6', 2023, 15200, 'BR-FORT-03', '2027-05-31',
  'Excellent', true, 'SUV', 'Available',
  'https://images.unsplash.com/photo-1576016770956-debb63d92058?w=800&auto=format',
  ARRAY[
    'https://images.unsplash.com/photo-1576016770956-debb63d92058?w=800&auto=format',
    'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&auto=format',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format',
    'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&auto=format'
  ],
  true, 'SUV',
  'The Toyota Fortuner is a robust, versatile SUV perfectly suited for PNG roads. It combines practicality with style, offering a smooth drive whether on tarmac or dirt tracks.',
  180,
  ARRAY['4WD', 'Android Auto', 'Apple CarPlay', 'Reverse Camera', 'Roof Rails', '7-Seat', 'LED Lights'],
  'Diesel', 'Automatic', 7, '2.8L Diesel Turbo',
  '2.8L 1GD-FTV', '4WD', '219mm', '80L', 'Business travel, airport transfers, group trips'
),

-- 4. Toyota HiLux Double Cab
(
  'aaa00001-0000-0000-0000-000000000004',
  'Toyota HiLux Double Cab', 2022, 44000, 'BR-HILUX-04', '2026-09-30',
  'Good', true, 'Pickup', 'Available',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
  ARRAY[
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
    'https://images.unsplash.com/photo-1574887427561-d3d5d58c9273?w=800&auto=format',
    'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&auto=format',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format',
    'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&auto=format'
  ],
  true, 'Pickup Truck',
  'The workhorse of Papua New Guinea. Our HiLux Double Cab handles the toughest conditions with ease, ideal for site visits, cargo transport, and remote area access.',
  150,
  ARRAY['4WD', 'Tow Bar', 'Bull Bar', 'Snorkel', 'Canopy Available', 'Reverse Camera', '5-Seat'],
  'Diesel', 'Manual', 5, '2.4L Diesel Turbo',
  '2.4L 2GD-FTV', '4WD', '310mm', '80L', 'Site access, cargo, remote areas, rugged terrain'
),

-- 5. Mitsubishi Pajero Sport
(
  'aaa00001-0000-0000-0000-000000000005',
  'Mitsubishi Pajero Sport', 2022, 29000, 'BR-PAJSP-05', '2026-12-31',
  'Good', true, 'SUV', 'Available',
  'https://images.unsplash.com/photo-1623869675781-80aa31012c6e?w=800&auto=format',
  ARRAY[
    'https://images.unsplash.com/photo-1623869675781-80aa31012c6e?w=800&auto=format',
    'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&auto=format',
    'https://images.unsplash.com/photo-1576016770956-debb63d92058?w=800&auto=format',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format'
  ],
  true, 'SUV',
  'The Mitsubishi Pajero Sport is a capable 4WD with a commanding presence on the road. Offering 7 seats and strong diesel performance, it is ideal for group excursions.',
  170,
  ARRAY['4WD', '7-Seat', 'Sunroof', 'Apple CarPlay', 'Reverse Camera', 'Super Select 4WD', 'LED DRLs'],
  'Diesel', 'Automatic', 7, '2.4L MIVEC Diesel',
  '2.4L MIVEC Diesel', 'Super Select 4WD', '218mm', '68L', 'Group travel, site visits, mixed terrain'
),

-- 6. Ford Ranger Raptor
(
  'aaa00001-0000-0000-0000-000000000006',
  'Ford Ranger Raptor', 2023, 12000, 'BR-RAPTOR-06', '2027-08-31',
  'Excellent', true, 'Pickup', 'Available',
  'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format',
  ARRAY[
    'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
    'https://images.unsplash.com/photo-1574887427561-d3d5d58c9273?w=800&auto=format',
    'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&auto=format',
    'https://images.unsplash.com/photo-1531130763054-d4fbb66dd53c?w=800&auto=format'
  ],
  true, 'Pickup Truck',
  'For those who demand the ultimate in performance and capability, the Ranger Raptor delivers. With a Fox suspension system and powerful bi-turbo engine, it conquers any terrain in style.',
  220,
  ARRAY['4WD', 'Fox Suspension', 'Bi-Turbo', 'SYNC 4', '360° Camera', 'Baja Mode', 'Sport Seats'],
  'Petrol', 'Automatic', 5, '3.0L EcoBoost V6',
  '3.0L V6 EcoBoost', '4WD', '272mm', '80L', 'Adventure travel, performance driving, off-road enthusiasts'
),

-- 7. Toyota Land Cruiser 79 Series (Work Horse)
(
  'aaa00001-0000-0000-0000-000000000007',
  'Toyota Land Cruiser 79 Series', 2021, 67000, 'BR-LC79-07', '2026-08-31',
  'Good', true, 'Pickup', 'Available',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format',
  ARRAY[
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format',
    'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&auto=format',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format'
  ],
  true, 'Work Vehicle',
  'The legendary LC79 is the ultimate PNG workhorse. Built for extreme conditions, this vehicle is trusted by mining companies, NGOs, and government agencies across the region.',
  160,
  ARRAY['4WD Low Range', 'Diff Lock', 'Bull Bar', 'Long Tray', 'Snorkel', 'Rated for 1T Payload', 'HD Suspension'],
  'Diesel', 'Manual', 5, '4.5L V8 Diesel',
  '4.5L V8 1VD-FTV', '4WD Locking', '235mm', '95L', 'Mining sites, heavy loads, extreme terrain, remote access'
),

-- 8. Isuzu MUX
(
  'aaa00001-0000-0000-0000-000000000008',
  'Isuzu MU-X 4WD', 2022, 33000, 'BR-MUX-08', '2026-10-31',
  'Good', true, 'SUV', 'Available',
  'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&auto=format',
  ARRAY[
    'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&auto=format',
    'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&auto=format',
    'https://images.unsplash.com/photo-1576016770956-debb63d92058?w=800&auto=format',
    'https://images.unsplash.com/photo-1623869675781-80aa31012c6e?w=800&auto=format',
    'https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=800&auto=format'
  ],
  true, 'SUV',
  'The Isuzu MU-X is a practical, value-focused 7-seat SUV built on the proven D-MAX platform. Reliable and spacious, it is perfect for corporate and family travel.',
  155,
  ARRAY['4WD', '7-Seat', 'Apple CarPlay', 'Reverse Camera', 'Tow Bar', 'LED Headlights', 'Terrain Command'],
  'Diesel', 'Automatic', 7, '3.0L Blue Power Diesel',
  '3.0L 4JJ3-TCX', '4WD Terrain Command', '215mm', '76L', 'Corporate transport, family groups, provincial travel'
)

ON CONFLICT (id) DO UPDATE SET
  make_model = EXCLUDED.make_model,
  year = EXCLUDED.year,
  odometer = EXCLUDED.odometer,
  plate_number = EXCLUDED.plate_number,
  insurance_expiry = EXCLUDED.insurance_expiry,
  condition = EXCLUDED.condition,
  is_company_registered = EXCLUDED.is_company_registered,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  show_on_fleet = EXCLUDED.show_on_fleet,
  vehicle_category = EXCLUDED.vehicle_category,
  description = EXCLUDED.description,
  price_per_day = EXCLUDED.price_per_day,
  features = EXCLUDED.features,
  fuel_type = EXCLUDED.fuel_type,
  transmission = EXCLUDED.transmission,
  seats = EXCLUDED.seats,
  engine_label = EXCLUDED.engine_label,
  spec_engine_size = EXCLUDED.spec_engine_size,
  spec_drivetrain = EXCLUDED.spec_drivetrain,
  spec_ground_clearance = EXCLUDED.spec_ground_clearance,
  spec_fuel_capacity = EXCLUDED.spec_fuel_capacity,
  spec_best_for = EXCLUDED.spec_best_for;


-- ============================================================
-- 2. Insert vehicle documents (placeholder URLs - 
--    replace with real Supabase Storage URLs after upload)
-- ============================================================

-- LC200 documents
INSERT INTO vehicle_documents (vehicle_id, doc_type, label, file_url, file_name) VALUES
('aaa00001-0000-0000-0000-000000000001', 'insurance', 'Insurance Certificate 2025-2026', 'https://example.com/placeholder.pdf', 'lc200_insurance.pdf'),
('aaa00001-0000-0000-0000-000000000001', 'registration', 'Vehicle Registration - LC200', 'https://example.com/placeholder.pdf', 'lc200_registration.pdf'),
('aaa00001-0000-0000-0000-000000000001', 'road_worthiness', 'Road Worthiness Certificate', 'https://example.com/placeholder.pdf', 'lc200_rwc.pdf'),
('aaa00001-0000-0000-0000-000000000001', 'logbook', 'Vehicle Logbook (V5C)', 'https://example.com/placeholder.pdf', 'lc200_logbook.pdf'),
('aaa00001-0000-0000-0000-000000000001', 'maintenance', 'Service Record - Jan 2026', 'https://example.com/placeholder.pdf', 'lc200_service_jan2026.pdf')
ON CONFLICT DO NOTHING;

-- Prado documents
INSERT INTO vehicle_documents (vehicle_id, doc_type, label, file_url, file_name) VALUES
('aaa00001-0000-0000-0000-000000000002', 'insurance', 'Insurance Certificate 2026', 'https://example.com/placeholder.pdf', 'prado_insurance.pdf'),
('aaa00001-0000-0000-0000-000000000002', 'registration', 'Vehicle Registration - Prado', 'https://example.com/placeholder.pdf', 'prado_registration.pdf'),
('aaa00001-0000-0000-0000-000000000002', 'road_worthiness', 'Road Worthiness Certificate', 'https://example.com/placeholder.pdf', 'prado_rwc.pdf'),
('aaa00001-0000-0000-0000-000000000002', 'logbook', 'Vehicle Logbook (V5C)', 'https://example.com/placeholder.pdf', 'prado_logbook.pdf'),
('aaa00001-0000-0000-0000-000000000002', 'maintenance', 'Service Record - Mar 2026', 'https://example.com/placeholder.pdf', 'prado_service_mar2026.pdf')
ON CONFLICT DO NOTHING;

-- Fortuner documents
INSERT INTO vehicle_documents (vehicle_id, doc_type, label, file_url, file_name) VALUES
('aaa00001-0000-0000-0000-000000000003', 'insurance', 'Insurance Certificate 2026', 'https://example.com/placeholder.pdf', 'fortuner_insurance.pdf'),
('aaa00001-0000-0000-0000-000000000003', 'registration', 'Vehicle Registration - Fortuner', 'https://example.com/placeholder.pdf', 'fortuner_registration.pdf'),
('aaa00001-0000-0000-0000-000000000003', 'road_worthiness', 'Road Worthiness Certificate', 'https://example.com/placeholder.pdf', 'fortuner_rwc.pdf'),
('aaa00001-0000-0000-0000-000000000003', 'logbook', 'Vehicle Logbook (V5C)', 'https://example.com/placeholder.pdf', 'fortuner_logbook.pdf'),
('aaa00001-0000-0000-0000-000000000003', 'maintenance', 'Service Record - May 2026', 'https://example.com/placeholder.pdf', 'fortuner_service_may2026.pdf')
ON CONFLICT DO NOTHING;

-- HiLux documents
INSERT INTO vehicle_documents (vehicle_id, doc_type, label, file_url, file_name) VALUES
('aaa00001-0000-0000-0000-000000000004', 'insurance', 'Insurance Certificate 2025-2026', 'https://example.com/placeholder.pdf', 'hilux_insurance.pdf'),
('aaa00001-0000-0000-0000-000000000004', 'registration', 'Vehicle Registration - HiLux', 'https://example.com/placeholder.pdf', 'hilux_registration.pdf'),
('aaa00001-0000-0000-0000-000000000004', 'road_worthiness', 'Road Worthiness Certificate', 'https://example.com/placeholder.pdf', 'hilux_rwc.pdf'),
('aaa00001-0000-0000-0000-000000000004', 'logbook', 'Vehicle Logbook (V5C)', 'https://example.com/placeholder.pdf', 'hilux_logbook.pdf'),
('aaa00001-0000-0000-0000-000000000004', 'maintenance', 'Service Record - Feb 2026', 'https://example.com/placeholder.pdf', 'hilux_service_feb2026.pdf')
ON CONFLICT DO NOTHING;

-- Pajero Sport documents
INSERT INTO vehicle_documents (vehicle_id, doc_type, label, file_url, file_name) VALUES
('aaa00001-0000-0000-0000-000000000005', 'insurance', 'Insurance Certificate 2025-2026', 'https://example.com/placeholder.pdf', 'pajero_insurance.pdf'),
('aaa00001-0000-0000-0000-000000000005', 'registration', 'Vehicle Registration - Pajero Sport', 'https://example.com/placeholder.pdf', 'pajero_registration.pdf'),
('aaa00001-0000-0000-0000-000000000005', 'road_worthiness', 'Road Worthiness Certificate', 'https://example.com/placeholder.pdf', 'pajero_rwc.pdf'),
('aaa00001-0000-0000-0000-000000000005', 'logbook', 'Vehicle Logbook (V5C)', 'https://example.com/placeholder.pdf', 'pajero_logbook.pdf'),
('aaa00001-0000-0000-0000-000000000005', 'maintenance', 'Service Record - Apr 2026', 'https://example.com/placeholder.pdf', 'pajero_service_apr2026.pdf')
ON CONFLICT DO NOTHING;

-- Ranger Raptor documents
INSERT INTO vehicle_documents (vehicle_id, doc_type, label, file_url, file_name) VALUES
('aaa00001-0000-0000-0000-000000000006', 'insurance', 'Insurance Certificate 2026-2027', 'https://example.com/placeholder.pdf', 'raptor_insurance.pdf'),
('aaa00001-0000-0000-0000-000000000006', 'registration', 'Vehicle Registration - Raptor', 'https://example.com/placeholder.pdf', 'raptor_registration.pdf'),
('aaa00001-0000-0000-0000-000000000006', 'road_worthiness', 'Road Worthiness Certificate', 'https://example.com/placeholder.pdf', 'raptor_rwc.pdf'),
('aaa00001-0000-0000-0000-000000000006', 'logbook', 'Vehicle Logbook (V5C)', 'https://example.com/placeholder.pdf', 'raptor_logbook.pdf'),
('aaa00001-0000-0000-0000-000000000006', 'maintenance', 'PDI Inspection Report', 'https://example.com/placeholder.pdf', 'raptor_pdi.pdf')
ON CONFLICT DO NOTHING;

-- LC79 documents
INSERT INTO vehicle_documents (vehicle_id, doc_type, label, file_url, file_name) VALUES
('aaa00001-0000-0000-0000-000000000007', 'insurance', 'Insurance Certificate 2025-2026', 'https://example.com/placeholder.pdf', 'lc79_insurance.pdf'),
('aaa00001-0000-0000-0000-000000000007', 'registration', 'Vehicle Registration - LC79', 'https://example.com/placeholder.pdf', 'lc79_registration.pdf'),
('aaa00001-0000-0000-0000-000000000007', 'road_worthiness', 'Road Worthiness Certificate', 'https://example.com/placeholder.pdf', 'lc79_rwc.pdf'),
('aaa00001-0000-0000-0000-000000000007', 'logbook', 'Vehicle Logbook (V5C)', 'https://example.com/placeholder.pdf', 'lc79_logbook.pdf'),
('aaa00001-0000-0000-0000-000000000007', 'maintenance', 'Service Record - Jun 2026', 'https://example.com/placeholder.pdf', 'lc79_service_jun2026.pdf')
ON CONFLICT DO NOTHING;

-- MU-X documents
INSERT INTO vehicle_documents (vehicle_id, doc_type, label, file_url, file_name) VALUES
('aaa00001-0000-0000-0000-000000000008', 'insurance', 'Insurance Certificate 2025-2026', 'https://example.com/placeholder.pdf', 'mux_insurance.pdf'),
('aaa00001-0000-0000-0000-000000000008', 'registration', 'Vehicle Registration - MU-X', 'https://example.com/placeholder.pdf', 'mux_registration.pdf'),
('aaa00001-0000-0000-0000-000000000008', 'road_worthiness', 'Road Worthiness Certificate', 'https://example.com/placeholder.pdf', 'mux_rwc.pdf'),
('aaa00001-0000-0000-0000-000000000008', 'logbook', 'Vehicle Logbook (V5C)', 'https://example.com/placeholder.pdf', 'mux_logbook.pdf'),
('aaa00001-0000-0000-0000-000000000008', 'maintenance', 'Service Record - Mar 2026', 'https://example.com/placeholder.pdf', 'mux_service_mar2026.pdf')
ON CONFLICT DO NOTHING;

SELECT make_model, plate_number, status, price_per_day, vehicle_category FROM vehicles ORDER BY make_model;
