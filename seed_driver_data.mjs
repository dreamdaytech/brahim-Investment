import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SERVICE_ROLE_SECRET || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(url, key);

const SL_NAMES = ["Ibrahim", "Abdul", "Fatima", "Mariama", "Mohamed", "Isatu", "Alhaji", "Kadiatu", "Samuel", "John", "Sarah", "Sia", "Fatmata", "Osman", "Abubakar", "Mustapha"];
const SL_SURNAMES = ["Kamara", "Bangura", "Sesay", "Koroma", "Kargbo", "Turay", "Conteh", "Mansaray", "Jalloh", "Fofanah", "Kanu", "Bah"];
const CITIES = ["Freetown", "Bo", "Kenema", "Makeni", "Koidu", "Lunsar", "Port Loko", "Waterloo"];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generatePhone = () => `+232 ${['76','77','78','79','30','31','33','34','88'][Math.floor(Math.random()*9)]} ${Math.floor(100000 + Math.random() * 900000)}`;

async function seed() {
  console.log("Fetching drivers...");
  const { data: drivers, error: driverErr } = await supabase.from('drivers').select('*');
  
  if (driverErr || !drivers?.length) {
    console.error("Error fetching drivers:", driverErr);
    return;
  }

  console.log(`Found ${drivers.length} drivers. Updating with realistic data...`);

  for (const driver of drivers) {
    // Generate realistic data
    const nameParts = driver.name.split(' ');
    const firstName = nameParts[0] || getRandomItem(SL_NAMES);
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : getRandomItem(SL_SURNAMES);
    
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const phone = generatePhone();
    const address = `${Math.floor(Math.random() * 100) + 1} ${getRandomItem(['Main Street', 'Circular Road', 'Wilkinson Road', 'Kissy Road', 'Lumley Beach Road', 'Siaka Stevens St'])}, ${getRandomItem(CITIES)}, Sierra Leone`;
    
    const dobYear = 1970 + Math.floor(Math.random() * 30);
    const dobMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const dobDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    
    const nextOfKinName = `${getRandomItem(SL_NAMES)} ${lastName}`;
    
    const updateData = {
      phone: driver.phone || phone,
      email: driver.email || email,
      address: driver.address || address,
      date_of_birth: driver.date_of_birth || `${dobYear}-${dobMonth}-${dobDay}`,
      nationality: driver.nationality || 'Sierra Leonean',
      national_id: driver.national_id || `SL-${Math.floor(1000000 + Math.random() * 9000000)}`,
      license_number: driver.license_number || `DL-${Math.floor(1000000 + Math.random() * 9000000)}`,
      license_type: driver.license_type || getRandomItem(['Commercial (CDL)', 'Standard (Class B)', 'Heavy Goods (HGV)']),
      next_of_kin_name: driver.next_of_kin_name || nextOfKinName,
      next_of_kin_phone: driver.next_of_kin_phone || generatePhone(),
      next_of_kin_relationship: driver.next_of_kin_relationship || getRandomItem(['Spouse', 'Sibling', 'Parent', 'Child']),
      emergency_contact_name: driver.emergency_contact_name || `${getRandomItem(SL_NAMES)} ${getRandomItem(SL_SURNAMES)}`,
      emergency_contact_phone: driver.emergency_contact_phone || generatePhone()
    };

    const { error } = await supabase.from('drivers').update(updateData).eq('id', driver.id);
    if (error) {
      console.error(`Failed to update driver ${driver.id}:`, error);
    } else {
      console.log(`Updated ${driver.name}`);
    }
  }

  console.log("Data seeding complete!");
}

seed();
