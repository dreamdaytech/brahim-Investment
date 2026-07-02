import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SERVICE_ROLE_SECRET || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';

const getSpecs = (model: string) => {
  const m = model.toLowerCase();
  if (m.includes('prado')) {
    return {
      vehicle_category: 'Heavy SUV', transmission: 'Automatic', fuel_type: 'Diesel', seats: 7,
      price_per_day: 150, engine_label: '3.0L D-4D Turbo Diesel',
      description: 'The standard of premium transport across West Africa. The Prado offers a perfect blend of absolute off-road strength, bulletproof reliability, and luxury high-riding comfort for both Freetown and deep upcountry deployments.',
      features: ['Full-Time 4WD with Active Traction Control', 'Spacious Cabin (Up to 7 Seats)', 'Dual-zone Automatic Climate Control', 'Advanced Multi-terrain ABS Systems', 'Heavy-duty suspension tailored for Sierra Leonean roads'],
      spec_engine_size: '2982 cc Turbo Diesel', spec_drivetrain: 'Constant 4WD with center differential lock', spec_ground_clearance: '215 mm', spec_fuel_capacity: '150 Liters (Dual tanks)', spec_best_for: 'NGO & Corporate head of missions, upcountry VIP routes.',
      image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA80uYh85m4vNLCuiR9IVe7LANbiSD68yDOKmV-dC99lK2Urdp3y19dyJW5zhey_x3NSlBuJ8qAxiEoTYTp8XmTeageQQ-TZ477-oMh40Rh5PFGNLfGMSqqNRhjOhBuEPaQT3DoR-RG1vMiabXItb3PzpRARfSgO93p-CuBbvE9OhiaeT3KyuOwpMeshR_TCeAuIA1d_ahIVb_Mytc_vg93OqQCKZ28jpoM2yFRN0U0G4MlxYY_-wnR_g-4nhWlDlrI7CVBL68V0Uc'
    };
  } else if (m.includes('v8') || m.includes('land cruiser') && !m.includes('prado')) {
    return {
      vehicle_category: 'Heavy SUV', transmission: 'Automatic', fuel_type: 'Diesel', seats: 8,
      price_per_day: 220, engine_label: '4.5L Twin-Turbo V8 Diesel',
      description: 'The ultimate symbol of rugged prestige and absolute mechanical security. Trusted by international diplomats, state dignitaries, and corporate executives.',
      features: ['Twin-Turbo Diesel V8 powertrain', 'Full Kinetic Dynamic Suspension System', 'Pre-collision Safety Systems & 10 Airbags', 'Intelligent Multi-Terrain Select', 'Ultra-premium leather upholstered interior'],
      spec_engine_size: '4461 cc Twin-Turbo V8', spec_drivetrain: 'Full-Time 4WD with Lockable Diff', spec_ground_clearance: '230 mm', spec_fuel_capacity: '138 Liters', spec_best_for: 'Diplomatic missions, high-profile dignitaries, severe offroad VIP routes.',
      image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdHsybOomm21gTtq_PQn889DOcbgLJ2maLWiuypr3ssgLZsqNxO0gYKsCExEhsrN5edi-c3LnQCV9jjjYCiZU26A_gaKLX7Bw-7GP5zxJKeMElAoW13VIaHNkePiLQ7X_4-oFPauF0t8iX6QmnQHynEduxPpIaxTcMN0x_nCvArxH9sIm6DVrKAy6PtIUrIqSroAaZH6sye_0ZC3HvX3ctBT_KCt8MSj1auV0Wy7Hci1gU49loKgIIlM4jTdELNzuDhieV5YBeSSg'
    };
  } else if (m.includes('hilux')) {
    return {
      vehicle_category: 'Truck', transmission: 'Manual', fuel_type: 'Diesel', seats: 5,
      price_per_day: 110, engine_label: '2.8L D4-D Turbo Diesel',
      description: 'The workhorse of global extreme logistics. Indestructible double-cabin design provides comfort for five personnel while transporting heavy field equipment.',
      features: ['Legendary D-4D diesel heavy torque', 'Massive 1-ton cargo payload capacity', 'Dual-range high/low gear transfer case', 'A-TRAC active traction and rear diff lock', 'Heavy duty snorkel for water wading'],
      spec_engine_size: '2755 cc Turbo Diesel', spec_drivetrain: 'Selectable 4WD with rear diff lock', spec_ground_clearance: '310 mm (raised suspension)', spec_fuel_capacity: '80 Liters', spec_best_for: 'Field exploration, technical deliveries, construction engineering missions.',
      image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJAJuwLKqmbCse-Nr7f2kMge-783BnAN83YrbCbBXXFQrYAmiS8gNRJE6LO38MhZ4HT7FLSAvK4p1lFYDTP8R7h01aKz2OMLo5TPSAWjtAGFHniLvoUXT8H-65iXd0WnnFFC9NBcRpAYn8OfD5ZiK6EDeQjRiE0OeYq7NEz3v9TyfDQLWYfnzw5bnBblcr2aAfRVqDMj2jMQAGU0wHTnKL4gua7OZoKq9J9OpAHaCf5BexXZQyIcKXTi3kpYvw-Z8HsP8-BEj8Xzw'
    };
  } else if (m.includes('everest')) {
    return {
      vehicle_category: 'Mid SUV', transmission: 'Automatic', fuel_type: 'Diesel', seats: 7,
      price_per_day: 140, engine_label: '2.0L Bi-Turbo Diesel',
      description: 'A tough, smart and capable SUV. The Ford Everest offers a comfortable ride combined with exceptional off-road performance.',
      features: ['Advanced Terrain Management System', 'Panoramic Sunroof', 'SYNC 3 Infotainment System', 'Pre-Collision Assist', 'Powerfold 3rd Row Seats'],
      spec_engine_size: '1996 cc Bi-Turbo', spec_drivetrain: 'Full-Time 4WD', spec_ground_clearance: '227 mm', spec_fuel_capacity: '80 Liters', spec_best_for: 'Family trips, corporate travel, off-road adventures.',
      image_url: 'https://images.unsplash.com/photo-1581541097864-477c7f5bebf4?auto=format&fit=crop&w=800&q=80'
    };
  } else if (m.includes('pajero')) {
    return {
      vehicle_category: 'Mid SUV', transmission: 'Automatic', fuel_type: 'Diesel', seats: 7,
      price_per_day: 135, engine_label: '3.2L DI-D Turbo Diesel',
      description: 'A legendary off-roader with a rich rally heritage. The Pajero is built for endurance and offers a spacious, versatile interior.',
      features: ['Super Select II 4WD System', 'Rear Differential Lock', 'Rockford Acoustic Design Premium Sound', 'Monocoque Body with Built-in Ladder Frame', 'Active Stability and Traction Control'],
      spec_engine_size: '3200 cc Turbo Diesel', spec_drivetrain: 'Super Select II 4WD', spec_ground_clearance: '235 mm', spec_fuel_capacity: '88 Liters', spec_best_for: 'Rugged terrain, long distance travel, heavy towing.',
      image_url: 'https://images.unsplash.com/photo-1622323719054-9467d5830b80?auto=format&fit=crop&w=800&q=80'
    };
  } else {
    // Default fallback (e.g. 4Runner / RAV4)
    return {
      vehicle_category: 'Mid SUV', transmission: 'Automatic', fuel_type: 'Petrol', seats: 5,
      price_per_day: 130, engine_label: '4.0L Dual VVT-i V6',
      description: 'A dynamic, legendary mid-size SUV that combines sporty styling with hard-core body-on-frame truck construction. Perfect for agile city navigation and secure provincial highway travel.',
      features: ['4.0L High-output V6 Engine', 'Part-time 4WD system with Active Traction Control', 'Premium SofTex heated power-adjustable seats', 'Apple CarPlay & Android Auto integration', 'Reenforced coil-spring rear suspension'],
      spec_engine_size: '3956 cc V6 Petrol', spec_drivetrain: 'Multi-Mode Part-time 4WD with A-TRAC', spec_ground_clearance: '244 mm', spec_fuel_capacity: '87 Liters', spec_best_for: 'Technical experts, independent business travelers, active field visits.',
      image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPBDsC6X_LxcHzoH67sNOy3HRZtjAaHYlzO7XiaJYzT_LFHaw2ZjP2w1Ud1Oqo7itK2te9DFm52qc2hyhZRigvBx4DXE-ipUvPK29JJkVyLc8L8rYeXFRPV-Ny9Dm7YKFfw8QqmY9wX6XJ4TyrS3ayICSgHCvEuuxfoqifvFYqPv54tED_ycELgCtSLdhIMNyEUoRlWe3Ff7TjvcHZuCQ-9Xvwk9QAKiRPHdh6OdhfrAkErz3fPI8nijwQ0unyrS0pcugThIIh9ws'
    };
  }
};

async function updateAllVehicles() {
  console.log('Fetching all vehicles...');
  const { data: vehicles, error } = await supabase.from('vehicles').select('*');
  if (error) {
    console.error('Error fetching vehicles:', error.message);
    return;
  }

  for (const v of vehicles) {
    console.log(`Updating ${v.make_model} (ID: ${v.id})...`);
    const specs = getSpecs(v.make_model || '');

    const updates = {
      ...specs,
      image_url: v.image_url || specs.image_url || DEFAULT_IMAGE, // Only set if not already set, or overwrite? Let's overwrite to ensure high quality
      gallery_urls: v.gallery_urls && v.gallery_urls.length > 0 ? v.gallery_urls : [specs.image_url],
      show_on_fleet: true, // Make sure they all show on fleet!
      // Add missing required fields just in case
      insurance_expiry: v.insurance_expiry || '2027-12-31',
      status: v.status || 'Available',
      condition: v.condition || 'Excellent',
      is_company_registered: v.is_company_registered === undefined ? true : v.is_company_registered
    };
    
    // Explicitly overwrite image with our high quality one for the mockup
    updates.image_url = specs.image_url;

    const { error: updateErr } = await supabase.from('vehicles').update(updates).eq('id', v.id);
    if (updateErr) {
      console.error(`Failed to update ${v.make_model}:`, updateErr.message);
    } else {
      console.log(`Successfully updated ${v.make_model}`);
    }
  }
  
  console.log('All vehicles updated successfully!');
}

updateAllVehicles().catch(console.error);
