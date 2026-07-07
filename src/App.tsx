import React, { useState, useEffect, useTransition } from 'react';
import { supabase } from './lib/supabase';
import { ActiveTab, Vehicle, Inquiry, ClientItem } from './types';
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

// Seeding Initial Inquiries for outstanding presentation
const DEFAULT_INQUIRIES: Inquiry[] = [
  {
    id: 'BIG-4829',
    fullName: 'Dr. Sarah Jenkins',
    organization: 'World Health Organization (WHO)',
    email: 's.jenkins@who.int',
    phone: '+232 76 554 332',
    serviceType: 'Chauffeur Driven',
    startDate: '2026-07-01',
    endDate: '2026-07-15',
    preferredVehicle: 'Toyota Land Cruiser Prado',
    vehiclesNeeded: 3,
    pickupLocation: 'Freetown Wilkinson Road Compound',
    dropoffLocation: 'Freetown Wilkinson Road Compound',
    specialRequirementsDet: '[Travel Scope: Upcountry Provinces, Fuel: Client Top-up] High field urgency. Requires satellite communications pre-configured on all units.',
    status: 'Approved',
    createdAt: '06/22/2026, 09:12 AM'
  },
  {
    id: 'BIG-8921',
    fullName: 'Ambassador Hans-Dieter',
    organization: 'European Union delegation to SL',
    email: 'h.dieter@eeas.europa.eu',
    phone: '+232 30 112 233',
    serviceType: 'Chauffeur Driven',
    startDate: '2026-07-10',
    endDate: '2026-07-14',
    preferredVehicle: 'Toyota Land Cruiser V8 (Series 200)',
    vehiclesNeeded: 2,
    pickupLocation: 'Lungi Airport Main Terminal',
    dropoffLocation: 'Radisson Blu Mammy Yoko, Freetown',
    specialRequirementsDet: '[Travel Scope: Freetown Only, Fuel: Pre-paid fuel card] Dignitary protocols apply. Defensive drivers with diplomatic clearance preferred.',
    status: 'Pending',
    createdAt: '06/22/2026, 11:45 AM'
  },
  {
    id: 'BIG-3029',
    fullName: 'Marcus Vance',
    organization: 'USAID Freetown',
    email: 'mvance@usaid.gov',
    phone: '+232 88 120 440',
    serviceType: 'Self-Drive Fleet',
    startDate: '2026-07-05',
    endDate: '2026-07-12',
    preferredVehicle: 'Toyota 4Runner SR5 Premium',
    vehiclesNeeded: 1,
    pickupLocation: 'Freetown Wilkinson Road Compound',
    dropoffLocation: 'Freetown Wilkinson Road Compound',
    specialRequirementsDet: '[Travel Scope: Freetown Only, Fuel: Client Top-up] Standard field team visit.',
    status: 'Pending',
    createdAt: '06/22/2026, 12:05 PM'
  }
];

const DEFAULT_CLIENTS = [
  { id: 'client-1', name: 'JHPIEGO', service: 'Vehicle Rental Service Within Freetown and the Provinces', status: 'Ongoing' },
  { id: 'client-2', name: 'Amref Health Africa', service: 'Vehicle Rental Service Within Freetown And the Provinces', status: 'Ongoing' },
  { id: 'client-3', name: 'Qcell SL Limited', service: 'Vehicle Rental Service Within Freetown And the Provinces', status: 'Ongoing' },
  { id: 'client-4', name: 'Clinton Health Access Initiative (CHAI)', service: 'Vehicle Rental Within Freetown And the Provinces', status: 'Ongoing' },
  { id: 'client-5', name: 'Alpenglow', service: 'Vehicle Rental Service Within Freetown and the Provinces', status: 'Ongoing' },
  { id: 'client-6', name: 'Partners in Health (PIH)', service: 'Vehicle Rental Service Within Freetown And The Provinces', status: 'Completed' },
  { id: 'client-7', name: 'ABT Associate Vector Link', service: 'Vehicle Rental Service to The Provinces, Including Trucks And Business', status: 'Ongoing' },
  { id: 'client-8', name: 'Integrated Health Project Administration Unit (IHPAU)', service: 'Vehicle Rental Service to The Provinces', status: 'Ongoing' },
  { id: 'client-9', name: 'Alhuda International Foundation', service: 'Vehicle Rental Service Within Freetown and the Provinces', status: 'Ongoing' },
  { id: 'client-10', name: 'Ministry of Health and Sanitation (MOHS)', service: 'Vehicle Rental Service to The Provinces', status: 'Completed' },
  { id: 'client-11', name: 'UNFPA', service: 'Vehicle Rental Service to The Provinces', status: 'Ongoing as and when needed basis' },
  { id: 'client-12', name: 'Bintassco SL Limited', service: 'Vehicle Rental Service Within Freetown And the Provinces', status: 'Ongoing' },
  { id: 'client-13', name: 'Aggreko International', service: 'Vehicle Rental Service in Freetown', status: 'Completed and Project Closed' },
  { id: 'client-14', name: 'Team & Team Ngo', service: 'Vehicle Rental Service Within Freetown and the Provinces', status: 'Completed and Project Closed' },
  { id: 'client-15', name: 'Brunnenbau Conrad Sl Ltd', service: 'Vehicle Rental Service Within Freetown And the Provinces', status: 'Ongoing' },
  { id: 'client-16', name: 'Mas Company SL Ltd', service: 'Vehicle Rental Service Within Freetown', status: 'Ongoing' }
];

// Mappers
const mapInquiryFromDB = (dbItem: any): Inquiry => ({
  id: dbItem.id,
  fullName: dbItem.fullname || dbItem.fullName,
  organization: dbItem.organization,
  email: dbItem.email,
  phone: dbItem.phone,
  serviceType: dbItem.servicetype || dbItem.serviceType,
  startDate: dbItem.startdate || dbItem.startDate,
  endDate: dbItem.enddate || dbItem.endDate,
  preferredVehicle: dbItem.preferredvehicle || dbItem.preferredVehicle,
  vehiclesNeeded: dbItem.vehiclesneeded || dbItem.vehiclesNeeded,
  pickupLocation: dbItem.pickuplocation || dbItem.pickupLocation,
  dropoffLocation: dbItem.dropofflocation || dbItem.dropoffLocation,
  specialRequirementsDet: dbItem.specialrequirementsdet || dbItem.specialRequirementsDet,
  status: dbItem.status,
  createdAt: dbItem.createdat || dbItem.createdAt
});

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

const mapClientFromDB = (dbItem: any): ClientItem => ({
  id: dbItem.id,
  name: dbItem.name,
  service: dbItem.service,
  status: dbItem.status,
  isDraft: dbItem.isdraft ?? dbItem.isDraft,
  shortCode: dbItem.short_code ?? dbItem.shortCode,
  isPartner: dbItem.is_partner ?? dbItem.isPartner,
  contactPerson: dbItem.contact_person ?? dbItem.contactPerson,
  phone: dbItem.phone,
  email: dbItem.email,
  website: dbItem.website,
  headOfficeAddress: dbItem.head_office_address ?? dbItem.headOfficeAddress,
  city: dbItem.city,
  country: dbItem.country,
  accountNumber: dbItem.account_number ?? dbItem.accountNumber,
  contractRef: dbItem.contract_ref ?? dbItem.contractRef,
  contractStartDate: dbItem.contract_start_date ?? dbItem.contractStartDate,
  contractEndDate: dbItem.contract_end_date ?? dbItem.contractEndDate,
  creditLimit: dbItem.credit_limit !== undefined && dbItem.credit_limit !== null ? Number(dbItem.credit_limit) : dbItem.creditLimit,
  totalPurchases: dbItem.total_purchases !== undefined && dbItem.total_purchases !== null ? Number(dbItem.total_purchases) : dbItem.totalPurchases,
  totalVolume: dbItem.total_volume !== undefined && dbItem.total_volume !== null ? Number(dbItem.total_volume) : dbItem.totalVolume,
  notes: dbItem.notes,
  logoUrl: dbItem.logoUrl,
  createdAt: dbItem.created_at ?? dbItem.createdAt
});

const mapClientToDB = (uiItem: Partial<ClientItem>): any => {
  const mapped: any = {};
  if (uiItem.id !== undefined) mapped.id = uiItem.id;
  if (uiItem.name !== undefined) mapped.name = uiItem.name;
  if (uiItem.service !== undefined) mapped.service = uiItem.service;
  if (uiItem.status !== undefined) mapped.status = uiItem.status;
  if (uiItem.isDraft !== undefined) mapped.isdraft = uiItem.isDraft;
  if (uiItem.shortCode !== undefined) mapped.short_code = uiItem.shortCode;
  if (uiItem.isPartner !== undefined) mapped.is_partner = uiItem.isPartner;
  if (uiItem.contactPerson !== undefined) mapped.contact_person = uiItem.contactPerson;
  if (uiItem.phone !== undefined) mapped.phone = uiItem.phone;
  if (uiItem.email !== undefined) mapped.email = uiItem.email;
  if (uiItem.website !== undefined) mapped.website = uiItem.website;
  if (uiItem.headOfficeAddress !== undefined) mapped.head_office_address = uiItem.headOfficeAddress;
  if (uiItem.city !== undefined) mapped.city = uiItem.city;
  if (uiItem.country !== undefined) mapped.country = uiItem.country;
  if (uiItem.accountNumber !== undefined) mapped.account_number = uiItem.accountNumber;
  if (uiItem.contractRef !== undefined) mapped.contract_ref = uiItem.contractRef;
  if (uiItem.contractStartDate !== undefined) mapped.contract_start_date = uiItem.contractStartDate;
  if (uiItem.contractEndDate !== undefined) mapped.contract_end_date = uiItem.contractEndDate;
  if (uiItem.creditLimit !== undefined) mapped.credit_limit = uiItem.creditLimit;
  if (uiItem.totalPurchases !== undefined) mapped.total_purchases = uiItem.totalPurchases;
  if (uiItem.totalVolume !== undefined) mapped.total_volume = uiItem.totalVolume;
  if (uiItem.notes !== undefined) mapped.notes = uiItem.notes;
  if (uiItem.logoUrl !== undefined) mapped.logoUrl = uiItem.logoUrl;
  if (uiItem.createdAt !== undefined) mapped.created_at = uiItem.createdAt;
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
  type: dbItem.type,
  status: dbItem.status,
  imageUrl: dbItem.image_url,
  galleryUrls: dbItem.gallery_urls,
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
  const [activeTab, setActiveTabVar] = useState<ActiveTab>(() => {
    return (sessionStorage.getItem('mainActiveTab') as ActiveTab) || 'home';
  });
  const [isPending, startTransition] = useTransition();

  const setActiveTab = (tab: ActiveTab) => {
    sessionStorage.setItem('mainActiveTab', tab);
    startTransition(() => {
      setActiveTabVar(tab);
    });
  };

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [estimateDetails, setEstimateDetails] = useState<{ vehicleId: string; days: number; chauffeur: boolean; provincial: boolean; total: number } | null>(null);

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('big_group_inquiries_cache');
    return saved ? JSON.parse(saved) : DEFAULT_INQUIRIES;
  });
  const [clients, setClients] = useState<ClientItem[]>(() => {
    const saved = localStorage.getItem('big_group_clients_cache');
    return saved ? JSON.parse(saved) : DEFAULT_CLIENTS;
  });
  const [fleetVehicles, setFleetVehicles] = useState<any[]>([]);

  // Connect to Supabase and listen for changes
  useEffect(() => {
    const fetchInitialData = async () => {
      // Inquiries
      const { data: inquiriesData, error: inqErr } = await supabase.from('inquiries').select('*');
      if (inqErr) console.error("Error fetching inquiries:", inqErr);
      if (inquiriesData && inquiriesData.length > 0) {
        const mapped = inquiriesData.map(mapInquiryFromDB);
        setInquiries(mapped);
        localStorage.setItem('big_group_inquiries_cache', JSON.stringify(mapped));
      } else if (!inqErr) {
        // Seed database if empty
        const { error: seedErr } = await supabase.from('inquiries').insert(DEFAULT_INQUIRIES.map(mapInquiryToDB));
        if (!seedErr) {
          setInquiries(DEFAULT_INQUIRIES);
        }
      }

      // Clients
      const { data: clientsData, error: cliErr } = await supabase.from('clients').select('*');
      if (cliErr) console.error("Error fetching clients:", cliErr);
      if (clientsData && clientsData.length > 0) {
        const mapped = clientsData.map(mapClientFromDB);
        setClients(mapped);
        localStorage.setItem('big_group_clients_cache', JSON.stringify(mapped));
      } else if (!cliErr) {
        // Seed database if empty
        const { error: seedErr2 } = await supabase.from('clients').insert(DEFAULT_CLIENTS.map(mapClientToDB));
        if (!seedErr2) {
          setClients(DEFAULT_CLIENTS);
        }
      }

      // Fleet vehicles (public page)
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('show_on_fleet', true)
        .eq('status', 'Available');
      if (vehiclesData) {
        setFleetVehicles(vehiclesData.map(mapVehicleFromDB));
      }
    };

    fetchInitialData();

    // Subscribe to realtime changes
    const inquiriesChannel = supabase.channel('public:inquiries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, async () => {
        const { data } = await supabase.from('inquiries').select('*');
        if (data) {
          const mapped = data.map(mapInquiryFromDB);
          setInquiries(mapped);
          localStorage.setItem('big_group_inquiries_cache', JSON.stringify(mapped));
        }
      })
      .subscribe();

    const clientsChannel = supabase.channel('public:clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, async () => {
        const { data } = await supabase.from('clients').select('*');
        if (data) {
          const mapped = data.map(mapClientFromDB);
          setClients(mapped);
          localStorage.setItem('big_group_clients_cache', JSON.stringify(mapped));
        }
      })
      .subscribe();

    const vehiclesChannel = supabase.channel('public:vehicles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, async () => {
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('*')
          .eq('show_on_fleet', true)
          .eq('status', 'Available');
        if (vehiclesData) {
          setFleetVehicles(vehiclesData.map(mapVehicleFromDB));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(inquiriesChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(vehiclesChannel);
    };
  }, []);

  // Administration State modifications
  const handleUpdateStatus = async (id: string, status: Inquiry['status']) => {
    try {
      await supabase.from('inquiries').update({ status }).eq('id', id);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this logged inquiry from active dispatch logs?")) {
      try {
        await supabase.from('inquiries').delete().eq('id', id);
      } catch (error) {
        console.error("Error deleting inquiry:", error);
      }
    }
  };

  const handleAddInquiry = async (newInquiry: Inquiry): Promise<{success: boolean, error?: string}> => {
    try {
      const { error } = await supabase.from('inquiries').insert([mapInquiryToDB(newInquiry)]);
      if (error) {
        console.error("Error adding inquiry:", error);
        return { success: false, error: error.message || JSON.stringify(error) };
      }
      
      // Update local state immediately so it appears in the dashboard without requiring a refresh
      setInquiries(prev => [newInquiry, ...prev]);
      
      return { success: true };
    } catch (error: any) {
      console.error("Exception adding inquiry:", error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  };

  const handleAddClient = async (newClient: ClientItem) => {
    try {
      await supabase.from('clients').insert([mapClientToDB(newClient)]);
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const handleUpdateClient = async (id: string, updateData: Partial<ClientItem>) => {
    try {
      await supabase.from('clients').update(mapClientToDB(updateData)).eq('id', id);
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await supabase.from('clients').delete().eq('id', id);
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const handleClearEstimate = () => {
    setEstimateDetails(null);
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeSection 
            setActiveTab={setActiveTab} 
            setSelectedVehicleId={setSelectedVehicleId} 
            fleetVehicles={fleetVehicles}
          />
        );
      case 'fleet':
        return (
          <FleetSection 
            setActiveTab={setActiveTab} 
            setSelectedVehicleId={setSelectedVehicleId}
            fleetVehicles={fleetVehicles}
          />
        );
      case 'services':
        return (
          <ServicesSection 
            setActiveTab={setActiveTab} 
            setSelectedVehicleId={setSelectedVehicleId} 
            setEstimateDetails={setEstimateDetails}
            fleetVehicles={fleetVehicles}
          />
        );
      case 'about':
        return <AboutSection setActiveTab={setActiveTab} />;
      case 'team':
        return <TeamSection setActiveTab={setActiveTab} />;
      case 'clients':
        return <ClientsSection setActiveTab={setActiveTab} clients={clients} />;
      case 'contact':
        return (
          <ContactSection 
            selectedVehicleId={selectedVehicleId} 
            setSelectedVehicleId={setSelectedVehicleId}
            estimateDetails={estimateDetails}
            clearEstimateDetails={handleClearEstimate}
            onAddInquiry={handleAddInquiry}
            fleetVehicles={fleetVehicles}
          />
        );
      case 'admin':
        return (
          <AdminSection 
            inquiries={inquiries}
            onUpdateStatus={handleUpdateStatus}
            onDeleteInquiry={handleDeleteInquiry}
            clients={clients}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        );
      default:
        return <HomeSection setActiveTab={setActiveTab} setSelectedVehicleId={setSelectedVehicleId} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fb] text-slate-950 selection:bg-indigo-600 selection:text-white antialiased">
      {/* Dynamic sticky header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenAdmin={() => setActiveTab('admin')} 
      />

      {/* Main active sections manager layout */}
      <main className="flex-grow">
        {isPending ? (
          <div className="w-full h-96 flex items-center justify-center bg-[#f7f9fb]">
            <div className="flex flex-col items-center space-y-3">
              <span className="w-12 h-12 rounded-full border-4 border-[#131b2e] border-t-transparent animate-spin"></span>
              <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest">Compiling Dispatch Port...</span>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {renderActiveSection()}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Corporate values and copyright bottom board */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
