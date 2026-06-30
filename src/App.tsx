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

  // Connect to Supabase and listen for changes
  useEffect(() => {
    const fetchInitialData = async () => {
      // Inquiries
      const { data: inquiriesData, error: inqErr } = await supabase.from('inquiries').select('*');
      if (inqErr) console.error("Error fetching inquiries:", inqErr);
      if (inquiriesData && inquiriesData.length > 0) {
        setInquiries(inquiriesData as Inquiry[]);
        localStorage.setItem('big_group_inquiries_cache', JSON.stringify(inquiriesData));
      } else if (!inqErr) {
        // Seed database if empty
        const { error: seedErr } = await supabase.from('inquiries').insert(DEFAULT_INQUIRIES);
        if (!seedErr) {
          setInquiries(DEFAULT_INQUIRIES);
        }
      }

      // Clients
      const { data: clientsData, error: cliErr } = await supabase.from('clients').select('*');
      if (cliErr) console.error("Error fetching clients:", cliErr);
      if (clientsData && clientsData.length > 0) {
        setClients(clientsData as ClientItem[]);
        localStorage.setItem('big_group_clients_cache', JSON.stringify(clientsData));
      } else if (!cliErr) {
        // Seed database if empty
        const { error: seedErr2 } = await supabase.from('clients').insert(DEFAULT_CLIENTS);
        if (!seedErr2) {
          setClients(DEFAULT_CLIENTS);
        }
      }
    };

    fetchInitialData();

    // Subscribe to realtime changes
    const inquiriesChannel = supabase.channel('public:inquiries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, async () => {
        const { data } = await supabase.from('inquiries').select('*');
        if (data) {
          setInquiries(data as Inquiry[]);
          localStorage.setItem('big_group_inquiries_cache', JSON.stringify(data));
        }
      })
      .subscribe();

    const clientsChannel = supabase.channel('public:clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, async () => {
        const { data } = await supabase.from('clients').select('*');
        if (data) {
          setClients(data as ClientItem[]);
          localStorage.setItem('big_group_clients_cache', JSON.stringify(data));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(inquiriesChannel);
      supabase.removeChannel(clientsChannel);
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

  const handleAddInquiry = async (newInquiry: Inquiry) => {
    try {
      await supabase.from('inquiries').insert([newInquiry]);
    } catch (error) {
      console.error("Error adding inquiry:", error);
    }
  };

  const handleAddClient = async (newClient: ClientItem) => {
    try {
      await supabase.from('clients').insert([newClient]);
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const handleUpdateClient = async (id: string, updateData: Partial<ClientItem>) => {
    try {
      await supabase.from('clients').update(updateData).eq('id', id);
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
          />
        );
      case 'fleet':
        return (
          <FleetSection 
            setActiveTab={setActiveTab} 
            setSelectedVehicleId={setSelectedVehicleId} 
          />
        );
      case 'services':
        return (
          <ServicesSection 
            setActiveTab={setActiveTab} 
            setSelectedVehicleId={setSelectedVehicleId} 
            setEstimateDetails={setEstimateDetails} 
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
    <div className="flex flex-col min-h-screen bg-[#f7f9fb] text-gray-900 selection:bg-indigo-600 selection:text-white antialiased">
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
              <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">Compiling Dispatch Port...</span>
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
