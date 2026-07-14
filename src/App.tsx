import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Inquiry } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeSection } from './components/HomeSection';
import { FleetSection } from './components/FleetSection';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { AdminSection } from './components/AdminSection';
import { TeamSection } from './components/TeamSection';
import { ClientsSection } from './components/ClientsSection';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useLocation } from 'react-router-dom';

// SECURITY NOTE: Admin-only seed data (inquiries, clients) has been moved into
// AdminSection.tsx which is protected behind Supabase authentication.
// Only public-facing data (fleet vehicles, team member public profiles) is
// loaded here in App.tsx.

// mapInquiryToDB is used by the public contact form submission
const mapInquiryToDB = (uiItem: Partial<Inquiry>): any => {
  const mapped: any = {};
  if (uiItem.id !== undefined) mapped.id = uiItem.id;
  if (uiItem.fullName !== undefined) mapped.fullname = uiItem.fullName;
  if (uiItem.organization !== undefined) mapped.organization = uiItem.organization;
  if (uiItem.email !== undefined) mapped.email = uiItem.email;
  if (uiItem.phone !== undefined) mapped.phone = uiItem.phone;
  if (uiItem.serviceType !== undefined) mapped.servicetype = uiItem.serviceType;
  if (uiItem.startDate !== undefined) mapped.startdate = uiItem.startDate;
  if (uiItem.endDate !== undefined) mapped.enddate = uiItem.endDate;
  if (uiItem.preferredVehicle !== undefined) mapped.preferredvehicle = uiItem.preferredVehicle;
  if (uiItem.vehiclesNeeded !== undefined) mapped.vehiclesneeded = uiItem.vehiclesNeeded;
  if (uiItem.pickupLocation !== undefined) mapped.pickuplocation = uiItem.pickupLocation;
  if (uiItem.dropoffLocation !== undefined) mapped.dropofflocation = uiItem.dropoffLocation;
  if (uiItem.specialRequirementsDet !== undefined) mapped.specialrequirementsdet = uiItem.specialRequirementsDet;
  if (uiItem.status !== undefined) mapped.status = uiItem.status;
  if (uiItem.createdAt !== undefined) mapped.createdat = uiItem.createdAt;
  return mapped;
};

const mapVehicleFromDB = (dbItem: any) => ({
  id: dbItem.id,
  makeModel: dbItem.make_model,
  year: dbItem.year,
  odometer: dbItem.odometer,
  plateNumber: dbItem.plate_number,
  insuranceExpiry: dbItem.insurance_expiry,
  condition: dbItem.condition,
  isCompanyRegistered: dbItem.is_company_registered,
  type: dbItem.vehicle_type,
  status: dbItem.status,
  imageUrl: dbItem.image_url,
  galleryUrls: dbItem.gallery_urls,
  documents: dbItem.documents || [],
  showOnFleet: dbItem.show_on_fleet,
  vehicleCategory: dbItem.vehicle_category,
  description: dbItem.description,
  pricePerDay: dbItem.price_per_day,
  features: dbItem.features,
  fuelType: dbItem.fuel_type,
  transmission: dbItem.transmission,
  seats: dbItem.seats,
  engineLabel: dbItem.engine_label,
  specEngineSize: dbItem.spec_engine_size,
  specDrivetrain: dbItem.spec_drivetrain,
  specGroundClearance: dbItem.spec_ground_clearance,
  specFuelCapacity: dbItem.spec_fuel_capacity,
  specBestFor: dbItem.spec_best_for,
});

export default function App() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const location = useLocation();


  const [estimateDetails, setEstimateDetails] = useState<{ vehicleId: string; days: number; chauffeur: boolean; provincial: boolean; total: number } | null>(null);

  // SECURITY: inquiries and clients are admin-only data — fetched inside AdminSection behind auth.
  // Only public data is held here.
  const [fleetVehicles, setFleetVehicles] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  // Connect to Supabase and listen for PUBLIC data changes only
  useEffect(() => {
    // SECURITY: Only public data is fetched here. Admin-only data (inquiries,
    // clients) is fetched inside AdminSection.tsx behind authentication.
    const fetchPublicData = async () => {
      // Fleet vehicles (public pages: home, fleet, services, contact)
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('id, make_model, year, vehicle_type, status, show_on_fleet, image_url, gallery_urls, vehicle_category, description, price_per_day, features, fuel_type, transmission, seats, engine_label, spec_engine_size, spec_drivetrain, spec_ground_clearance, spec_fuel_capacity, spec_best_for')
        .eq('show_on_fleet', true)
        .eq('status', 'Available');
      if (vehiclesData) {
        setFleetVehicles(vehiclesData.map(mapVehicleFromDB));
      }

      // Team Members (public /team page — only non-sensitive public profile fields)
      const { data: teamData } = await supabase
        .from('team_members')
        .select('id, name, role, bio, dedicated_role, languages, skills, image_url, display_order, is_active')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (teamData) {
        const mapped = teamData.map((m: any) => ({
          id: m.id, name: m.name, role: m.role, bio: m.bio,
          dedicatedRole: m.dedicated_role, languages: m.languages,
          skills: m.skills || [],
          imageUrl: m.image_url, displayOrder: m.display_order, isActive: m.is_active,
          // SECURITY: phone and email intentionally excluded from public fetch
        }));
        setTeamMembers(mapped);
      }
      // Clients (public /clients page)
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*');
      if (clientsData) {
        const mappedClients = clientsData.map((c: any) => ({
          id: c.id,
          name: c.name,
          service: c.service,
          status: c.status,
          isDraft: c.isdraft,
          shortCode: c.short_code,
          logoUrl: c.logoUrl || c.logourl
        }));
        setClients(mappedClients);
      }
    };

    fetchPublicData();

    // Only subscribe to vehicle changes for real-time fleet page updates
    const vehiclesChannel = supabase.channel('public:vehicles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, async () => {
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('id, make_model, year, vehicle_type, status, show_on_fleet, image_url, gallery_urls, vehicle_category, description, price_per_day, features, fuel_type, transmission, seats, engine_label, spec_engine_size, spec_drivetrain, spec_ground_clearance, spec_fuel_capacity, spec_best_for')
          .eq('show_on_fleet', true)
          .eq('status', 'Available');
        if (vehiclesData) {
          setFleetVehicles(vehiclesData.map(mapVehicleFromDB));
        }
      })
      .subscribe();

    const clientsChannel = supabase.channel('public:clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, async () => {
        const { data: clientsData } = await supabase.from('clients').select('*');
        if (clientsData) {
          const mappedClients = clientsData.map((c: any) => ({
            id: c.id,
            name: c.name,
            service: c.service,
            status: c.status,
            isDraft: c.isdraft,
            shortCode: c.short_code,
            logoUrl: c.logoUrl || c.logourl
          }));
          setClients(mappedClients);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(vehiclesChannel);
      supabase.removeChannel(clientsChannel);
    };
  }, []);

  // SECURITY: handleAddInquiry is kept here as it's called from the PUBLIC contact form.
  // All other admin-only data handlers (update/delete inquiries, clients CRUD) have been
  // moved into AdminSection.tsx behind authentication.
  const handleAddInquiry = async (newInquiry: Inquiry): Promise<{success: boolean, error?: string}> => {
    try {
      const { error } = await supabase.from('inquiries').insert([mapInquiryToDB(newInquiry)]);
      if (error) {
        return { success: false, error: error.message || JSON.stringify(error) };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  };

  const handleClearEstimate = () => {
    setEstimateDetails(null);
  };

  const mapTeamToDB = (m: any) => ({
    ...(m.id ? { id: m.id } : {}),
    name: m.name,
    role: m.role,
    bio: m.bio || null,
    dedicated_role: m.dedicatedRole || null,
    languages: m.languages || null,
    phone: m.phone || null,
    email: m.email || null,
    skills: m.skills || [],
    image_url: m.imageUrl || null,
    display_order: m.displayOrder ?? 0,
    is_active: m.isActive !== false,
  });

  const handleAddTeamMember = async (member: any) => {
    const { error } = await supabase.from('team_members').insert([mapTeamToDB(member)]);
    if (error) { console.error('Error adding team member:', error); throw error; }
  };

  const handleUpdateTeamMember = async (id: string, member: any) => {
    const { error } = await supabase.from('team_members').update(mapTeamToDB(member)).eq('id', id);
    if (error) { console.error('Error updating team member:', error); throw error; }
  };

  const handleDeleteTeamMember = async (id: string) => {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) { console.error('Error deleting team member:', error); throw error; }
  };

  const renderRoutes = () => (
    <Routes>
      <Route path="/" element={<HomeSection setSelectedVehicleId={setSelectedVehicleId} fleetVehicles={fleetVehicles} clients={clients} />} />
      <Route path="/fleet" element={<FleetSection setSelectedVehicleId={setSelectedVehicleId} fleetVehicles={fleetVehicles} />} />
      <Route path="/services" element={<ServicesSection setSelectedVehicleId={setSelectedVehicleId} setEstimateDetails={setEstimateDetails} fleetVehicles={fleetVehicles} />} />
      <Route path="/about" element={<AboutSection />} />
      <Route path="/team" element={<TeamSection teamMembers={teamMembers} />} />
      <Route path="/clients" element={<ClientsSection clients={clients} />} />
      <Route path="/contact" element={<ContactSection selectedVehicleId={selectedVehicleId} setSelectedVehicleId={setSelectedVehicleId} estimateDetails={estimateDetails} clearEstimateDetails={handleClearEstimate} onAddInquiry={handleAddInquiry} fleetVehicles={fleetVehicles} />} />
      {/* SECURITY: AdminSection now fetches its own data internally behind authentication */}
      <Route path="/admin" element={<AdminSection teamMembers={teamMembers} onAddTeamMember={handleAddTeamMember} onUpdateTeamMember={handleUpdateTeamMember} onDeleteTeamMember={handleDeleteTeamMember} />} />
      <Route path="*" element={<HomeSection setSelectedVehicleId={setSelectedVehicleId} fleetVehicles={fleetVehicles} clients={clients} />} />
    </Routes>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fb] text-slate-950 selection:bg-blue-600 selection:text-white antialiased">
      {/* Dynamic sticky header */}
      <Header />

      {/* Main active sections manager layout */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {renderRoutes()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Corporate values and copyright bottom board */}
      <Footer />
    </div>
  );
}
