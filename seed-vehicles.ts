import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { VEHICLES } from './src/data';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SERVICE_ROLE_SECRET || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedVehicles() {
  console.log('Seeding vehicles from data.ts...');

  for (const v of VEHICLES) {
    const data = {
      make_model: v.name,
      vehicle_category: v.type,
      transmission: v.transmission,
      fuel_type: v.fuel,
      features: v.features,
      image_url: v.imageUrl,
      gallery_urls: v.galleryUrls,
      seats: v.seats,
      engine_label: v.engine,
      price_per_day: v.pricePerDay,
      description: v.description,
      spec_engine_size: v.detailedSpecs?.engineSize,
      spec_drivetrain: v.detailedSpecs?.drivetrain,
      spec_ground_clearance: v.detailedSpecs?.groundClearance,
      spec_fuel_capacity: v.detailedSpecs?.fuelCapacity,
      spec_best_for: v.detailedSpecs?.bestFor,
      show_on_fleet: true,
      year: new Date().getFullYear(),
      odometer: 10000,
      plate_number: `TBA-${Math.floor(Math.random() * 9999)}`,
      status: 'Available',
      condition: 'Excellent',
      is_company_registered: true,
      insurance_expiry: '2027-12-31',
    };

    // Upsert by make_model since we don't have UUIDs matching existing ones
    // Or we can just insert and ignore conflicts, but let's check if there are existing ones by make_model
    const { data: existing, error: errFetch } = await supabase
      .from('vehicles')
      .select('id')
      .eq('make_model', v.name)
      .single();

    if (existing) {
      console.log(`Updating existing vehicle: ${v.name}`);
      const { error } = await supabase.from('vehicles').update(data).eq('id', existing.id);
      if (error) console.error(`Error updating ${v.name}:`, error.message);
    } else {
      console.log(`Inserting new vehicle: ${v.name}`);
      const { error } = await supabase.from('vehicles').insert([data]);
      if (error) console.error(`Error inserting ${v.name}:`, error.message);
    }
  }

  console.log('Finished seeding vehicles!');
}

seedVehicles().catch(console.error);
