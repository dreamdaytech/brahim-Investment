import React, { useState, useEffect, useTransition } from 'react';
import { ActiveTab, Vehicle, Inquiry } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeSection } from './components/HomeSection';
import { FleetSection } from './components/FleetSection';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { AdminSection } from './components/AdminSection';
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

export default function App() {
  const [activeTab, setActiveTabVar] = useState<ActiveTab>('home');
  const [isPending, startTransition] = useTransition();

  const setActiveTab = (tab: ActiveTab) => {
    startTransition(() => {
      setActiveTabVar(tab);
    });
  };

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [estimateDetails, setEstimateDetails] = useState<{ vehicleId: string; days: number; chauffeur: boolean; provincial: boolean; total: number } | null>(null);

  // Core App database inside localStorage
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('big_group_inquiries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Error reading storage:", err);
      }
    }
    return DEFAULT_INQUIRIES;
  });

  // Save inquiries to localStorage on change
  useEffect(() => {
    localStorage.setItem('big_group_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  // Administration State modifications
  const handleUpdateStatus = (id: string, status: Inquiry['status']) => {
    setInquiries(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status };
      }
      return item;
    }));
  };

  const handleDeleteInquiry = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this logged inquiry from active dispatch logs?")) {
      setInquiries(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAddInquiry = (newInquiry: Inquiry) => {
    setInquiries(prev => [newInquiry, ...prev]);
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
        return <AboutSection />;
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
