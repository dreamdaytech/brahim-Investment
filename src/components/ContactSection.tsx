import React, { useState, useEffect } from 'react';
import { Vehicle, Inquiry } from '../types';
import { VEHICLES } from '../data';
import { Phone, Mail, MapPin, Send, Calendar, CheckSquare, Sparkles, Building, Briefcase, Plus, Minus, ArrowRight, ShieldAlert, BadgeCheck, ChevronDown, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface ContactSectionProps {
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  estimateDetails: { vehicleId: string; days: number; chauffeur: boolean; provincial: boolean; total: number } | null;
  clearEstimateDetails: () => void;
  onAddInquiry: (inquiry: Inquiry) => Promise<{success: boolean, error?: string}> | void;
  fleetVehicles?: any[];
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  selectedVehicleId,
  setSelectedVehicleId,
  estimateDetails,
  clearEstimateDetails,
  onAddInquiry,
  fleetVehicles
}) => {
  // Use live DB vehicles if available, else fall back to hardcoded data
  // Defensive filter: only show Available vehicles in the booking form
  const sourceVehicles = (fleetVehicles && fleetVehicles.length > 0)
    ? fleetVehicles
        .filter(v => !v.status || v.status === 'Available')
        .map(v => ({
        id: v.id,
        name: v.makeModel,
        type: v.vehicleCategory || v.type || 'SUV',
        pricePerDay: v.pricePerDay || 0,
        imageUrl: v.imageUrl || (v.images && v.images[0]) || ''
      }))
    : VEHICLES.map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,
        pricePerDay: v.pricePerDay,
        imageUrl: v.imageUrl || ''
      }));

  // Wizard Step State
  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  
  // Custom Dropdown State
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState<boolean>(false);
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState<string>('');

  // Form Fields State
  const [fullName, setFullName] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  
  const [serviceType, setServiceType] = useState<Inquiry['serviceType']>('Chauffeur Driven');
  const [preferredVehicle, setPreferredVehicle] = useState<string>(selectedVehicleId || '');
  const [vehiclesNeeded, setVehiclesNeeded] = useState<number>(1);
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [pickupLocation, setPickupLocation] = useState<string>('Freetown Road Compound');
  const [dropoffLocation, setDropoffLocation] = useState<string>('Freetown Road Compound');
  
  const [travelScope, setTravelScope] = useState<'Freetown Only' | 'Upcountry Provinces'>('Freetown Only');
  const [fuelPolicy, setFuelPolicy] = useState<'Client Top-up' | 'Pre-paid fuel card'>('Client Top-up');
  const [specialRequirementsDet, setSpecialRequirementsDet] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  // Handle pre-population when estimate is loaded
  useEffect(() => {
    if (selectedVehicleId) {
      setPreferredVehicle(selectedVehicleId);
    }
  }, [selectedVehicleId]);

  useEffect(() => {
    if (estimateDetails) {
      setPreferredVehicle(estimateDetails.vehicleId);
      setServiceType(estimateDetails.chauffeur ? 'Chauffeur Driven' : 'Self-Drive Fleet');
      setTravelScope(estimateDetails.provincial ? 'Upcountry Provinces' : 'Freetown Only');
      
      const today = new Date();
      const startStr = today.toISOString().split('T')[0];
      setStartDate(startStr);
      
      const future = new Date();
      future.setDate(today.getDate() + estimateDetails.days);
      const endStr = future.toISOString().split('T')[0];
      setEndDate(endStr);
    }
  }, [estimateDetails]);

  // Handle Validation
  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      return fullName.trim() !== '' && email.trim() !== '' && phone.trim() !== '';
    }
    if (currentStep === 2) {
      return preferredVehicle !== '';
    }
    if (currentStep === 3) {
      return startDate !== '' && endDate !== '' && pickupLocation.trim() !== '' && dropoffLocation.trim() !== '';
    }
    return true;
  };

  const currentVehicleObj = sourceVehicles.find(v => v.id === preferredVehicle);

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      alert("Please fill in all requested fields to safely proceed.");
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert("Please accept the BIG vehicle vetting & agreement code to proceed.");
      return;
    }

    const randomID = 'BIG-' + Math.floor(1000 + Math.random() * 9000);
    const newInquiry: Inquiry = {
      id: randomID,
      fullName,
      organization: organization || 'Independent Consultant',
      email,
      phone,
      serviceType,
      startDate,
      endDate,
      preferredVehicle: currentVehicleObj?.name || '',
      vehiclesNeeded,
      pickupLocation,
      dropoffLocation,
      specialRequirementsDet: `[Travel Scope: ${travelScope}, Fuel: ${fuelPolicy}] ${specialRequirementsDet}`,
      status: 'Pending',
      createdAt: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    const result = await onAddInquiry(newInquiry);
    if (result && !result.success) {
      alert(`Booking submission failed: ${result.error}\nPlease contact support or try again later.`);
      return;
    }

    setIsSubmitted(true);
    clearEstimateDetails();
  };

  return (
    <div className="w-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT COLUMN: MULTI-STEP FORM */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm">
            
            {/* Success State */}
            {isSubmitted ? (
               <div className="py-12 text-center max-w-xl mx-auto space-y-6">
                 <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-250">
                  <BadgeCheck size={44} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-950 tracking-tight">Proposal Request Received</h2>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Thank you, <strong>{fullName}</strong>. We have registered your inquiry on our Freetown servers. An official, itemized logistics quote complete with driver security credentials and fuel cycle audits will be generated under direct oversight by <strong>Emmanuel Kpakama (<a href="https://wa.me/23234692208" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">+232 34 692208</a> / <a href="https://wa.me/23276268296" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">+232 76 268296</a> / <a href="https://wa.me/23279121013" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">+232 79 121013</a>)</strong> and dispatched to <strong><a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a></strong> as soon as possible.
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-3">
                  <span className="text-[9px] font-mono font-bold text-blue-600 block uppercase tracking-wide">CONFIRMATION DETAILS</span>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block font-mono">REQUEST REFERENCE</span>
                      <span className="font-bold text-slate-800">BIG-9482-A</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-mono">DISPATCH WINDOW</span>
                      <span className="font-bold text-slate-800">As soon as possible</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setStep(1);
                    setFullName('');
                    setOrganization('');
                    setEmail('');
                    setPhone('');
                    setSpecialRequirementsDet('');
                    setTermsAccepted(false);
                  }}
                  className="px-6 py-3.5 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Create Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">LOGISTICS DIRECT PORTAL</span>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight mt-1">Book Your Vehicle</h1>
                  <p className="text-xs text-slate-600 mt-1">Please provide accurate corporate coordinates to ensure dynamic proposal vetting.</p>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-full overflow-x-auto gap-2">
                  {[
                    { s: 1, text: 'Contact' },
                    { s: 2, text: 'Service' },
                    { s: 3, text: 'Specifics' },
                    { s: 4, text: 'Vetting' }
                  ].map((pStep) => (
                    <div key={pStep.s} className="flex items-center space-x-2 shrink-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                        step >= pStep.s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {pStep.s}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider font-sans ${
                        step >= pStep.s ? 'text-blue-600' : 'text-slate-500'
                      }`}>
                        {pStep.text}
                      </span>
                      {pStep.s < 4 && <span className="text-slate-400 font-mono text-sm">&rarr;</span>}
                    </div>
                  ))}
                </div>

                {/* STEP CONTENT SWITCH */}

                {/* STEP 1: Contact details */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <span className="text-[10px] uppercase font-mono font-extrabold text-blue-600">PHASE 1 SEC-A: INDIVIDUAL VETTING CODES</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Full Representative Name*</label>
                        <input 
                          type="text" 
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g., Dr. Roland Cole"
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Organization / Mission Name</label>
                        <input 
                          type="text" 
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="e.g., World Health Organization (WHO)"
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Corporate Email Address</label>
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g., r.cole@who.int"
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Telephone / WhatsApp Contact*</label>
                        <input 
                          type="tel" 
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g., +232 76 990 880"
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm font-sans"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Service Details */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <span className="text-[10px] uppercase font-mono font-extrabold text-blue-600">PHASE 2 SEC-B: LOGISTICAL CATEGORIES</span>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Choose General Program Class Of Service</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { val: 'Chauffeur Driven', title: 'Chauffeur Driven', desc: 'Professional driver provided for your comfort and safety' },
                          { val: 'Self-Drive Fleet', title: 'Self-Drive Fleet', desc: 'Rent a vehicle and drive yourself with complete freedom' },
                          { val: 'Custom Logistics', title: 'Custom Logistics', desc: 'Tailored transport solutions for corporate and cargo needs' },
                          { val: 'Event Transport', title: 'Event Transport', desc: 'Coordinated transportation for weddings, conferences, and tours' }
                        ].map((srv) => (
                          <div 
                            key={srv.val}
                            onClick={() => setServiceType(srv.val as any)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start select-none ${
                              serviceType === srv.val 
                                ? 'bg-blue-50 border-blue-600 text-blue-900' 
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex-1 pr-2">
                              <span className="text-xs font-bold block">{srv.title}</span>
                              <span className={`text-[10px] leading-snug block mt-1 ${serviceType === srv.val ? 'text-blue-700/80' : 'text-slate-600'}`}>{srv.desc}</span>
                            </div>
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              serviceType === srv.val ? 'border-blue-605 bg-blue-600' : 'border-slate-300'
                            }`}>
                              {serviceType === srv.val && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Preferred Vehicle Class</label>
                        <div 
                          onClick={() => setIsVehicleDropdownOpen(!isVehicleDropdownOpen)}
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus-within:ring-2 focus-within:ring-blue-600 focus-within:outline-none shadow-sm cursor-pointer flex items-center justify-between"
                        >
                          <span className="font-medium truncate">
                            {sourceVehicles.find(v => v.id === preferredVehicle)?.name || 'Select a vehicle...'} 
                            {sourceVehicles.find(v => v.id === preferredVehicle) && ` ($${sourceVehicles.find(v => v.id === preferredVehicle)?.pricePerDay}/day - Est.)`}
                          </span>
                          <ChevronDown size={14} className="text-slate-500 shrink-0 ml-2" />
                        </div>

                        {isVehicleDropdownOpen && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col">
                            <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center">
                              <Search size={14} className="text-slate-500 mr-2" />
                              <input 
                                type="text" 
                                placeholder="Search vehicles..." 
                                value={vehicleSearchTerm}
                                onChange={(e) => setVehicleSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 text-xs text-slate-700 p-0"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                              {sourceVehicles.filter(v => v.name.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) || v.type.toLowerCase().includes(vehicleSearchTerm.toLowerCase())).length > 0 ? (
                                sourceVehicles.filter(v => v.name.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) || v.type.toLowerCase().includes(vehicleSearchTerm.toLowerCase())).map((v) => (
                                  <div 
                                    key={v.id} 
                                    onClick={() => {
                                      setPreferredVehicle(v.id);
                                      setIsVehicleDropdownOpen(false);
                                      setVehicleSearchTerm('');
                                    }}
                                    className={`p-3 rounded-lg cursor-pointer text-xs flex justify-between items-center transition-colors ${
                                      preferredVehicle === v.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <span className="truncate">{v.name}</span>
                                    <span className="text-[10px] text-slate-500 ml-2 whitespace-nowrap">${v.pricePerDay}/day</span>
                                  </div>
                                ))
                              ) : (
                                <div className="p-4 text-center text-xs text-slate-500">No vehicles found matching "{vehicleSearchTerm}"</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Number of vehicles needed</label>
                        <div className="flex items-center space-x-4">
                          <button 
                            type="button"
                            onClick={() => setVehiclesNeeded(prev => Math.max(1, prev - 1))}
                            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center border border-slate-200 cursor-pointer text-slate-700 font-bold"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-mono font-bold text-lg text-slate-800">{vehiclesNeeded}</span>
                          <button 
                            type="button"
                            onClick={() => setVehiclesNeeded(prev => prev + 1)}
                            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center border border-slate-200 cursor-pointer text-slate-700 font-bold"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Rental Specifics */}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <span className="text-[10px] uppercase font-mono font-extrabold text-blue-600">PHASE 3 SEC-C: ROUTING &amp; DISPATCH</span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Vetting start date*</label>
                        <input 
                          type="date" 
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Vetting return date*</label>
                        <input 
                          type="date" 
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Compound pickup Location</label>
                        <input 
                          type="text" 
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          placeholder="e.g., Lungi Airport Terminal / Depot Compound"
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Compound return Location</label>
                        <input 
                          type="text" 
                          value={dropoffLocation}
                          onChange={(e) => setDropoffLocation(e.target.value)}
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Vetting Code / Special details */}
                {step === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <span className="text-[10px] uppercase font-mono font-extrabold text-blue-600">PHASE 4 SEC-D: OPERATIONS STATEMENT</span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Deploy Terrain Zone Scope</label>
                        <select 
                          value={travelScope}
                          onChange={(e) => setTravelScope(e.target.value as any)}
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="Freetown Only">Freetown Only Limits</option>
                          <option value="Upcountry Provinces">Upcountry Provinces (Severe offroad maintenance index)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Fuel Supply Management</label>
                        <select 
                          value={fuelPolicy}
                          onChange={(e) => setFuelPolicy(e.target.value as any)}
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="Client Top-up">Client Top-up (Daily fuel audit by driver)</option>
                          <option value="Pre-paid fuel card">Preloaded fuel card supplied (Flat billing)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Specialized deployment requests (e.g. security escort, satellite GPS)</label>
                      <textarea 
                        rows={3}
                        value={specialRequirementsDet}
                        onChange={(e) => setSpecialRequirementsDet(e.target.value)}
                        placeholder="e.g. Requires satellite tracker pre-configuration and diplomatic license plate holder..."
                        className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-600"
                      ></textarea>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          required
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded border-slate-300 accent-blue-600 mt-0.5 shrink-0 cursor-pointer"
                        />
                        <span className="text-[11px] text-slate-700 font-sans leading-relaxed">
                          I verify and agree that the driver and logistics coordinators assigned by BIG are fully credentialed, and that our organization guarantees compliance with direct vehicle diagnostic checks and local safety audits during the scope of leasing.
                        </span>
                      </label>
                    </div>
                  </motion.div>
                )}


                {/* Form Navigation Controls */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-5 py-3 hover:bg-slate-55 text-slate-700 font-bold rounded-xl text-xs uppercase cursor-pointer border border-slate-200 transition-colors"
                    >
                      Back
                    </button>
                  ) : <div />}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Proceed</span>
                      <ArrowRight size={12} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200"
                    >
                      <Send size={13} />
                      <span>Request Formal Proposal</span>
                    </button>
                  )}
                </div>

              </form>
            )}

          </div>

          {/* RIGHT COLUMN: CONTACT DETAILS & REAL-TIME ESTIMATE SUMMARY */}
          <div className="space-y-8">
            
            {/* REAL-TIME PREVIEW BOARD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">live proposal preview</span>
              <h4 className="text-sm font-extrabold text-slate-950 tracking-tight">Dynamic Rental Breakdown</h4>

              <div className="mt-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-3 font-mono text-slate-700">
                <div className="text-center pb-2 border-b border-slate-200">
                  <span className="font-extrabold tracking-widest text-[#0f172a] block text-xs">BIG (SL)</span>
                  <span className="text-[8px] text-slate-500 block uppercase">3 Massalay Drive Juba Formerly Johnny Paul Drive</span>
                </div>

                {currentVehicleObj?.imageUrl ? (
                  <div className="flex justify-center py-2">
                    <img 
                      src={currentVehicleObj.imageUrl} 
                      alt={currentVehicleObj.name} 
                      className="h-24 w-auto object-contain drop-shadow-md rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center py-6 text-slate-300">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 border border-slate-200 px-4 py-2 rounded-xl border-dashed">No Vehicle Selected</span>
                  </div>
                )}

                <div className="space-y-1 text-sm">
                  <p><strong>REPRESENTATIVE:</strong> {fullName || '---'}</p>
                  <p><strong>ORGANIZATION:</strong> {organization || '---'}</p>
                  <p><strong>SERVICE TYPE:</strong> {serviceType}</p>
                  <p><strong>VEHICLE UNIT:</strong> {currentVehicleObj?.name || '---'}</p>
                  <p><strong>QUANTITY:</strong> {vehiclesNeeded} Unit(s)</p>
                  {startDate && <p><strong>DEPLOY DATE:</strong> {startDate}</p>}
                  {endDate && <p><strong>RETURN DATE:</strong> {endDate}</p>}
                  <p><strong>TERRAIN ZONE:</strong> {travelScope}</p>
                  <p><strong>FUEL:</strong> {fuelPolicy}</p>
                </div>

                <hr className="border-slate-200" />

                <div className="flex justify-between items-center font-bold text-slate-950">
                  <span>VETTED SECURITY STATUS:</span>
                  <span className="text-emerald-600 font-bold uppercase block">CLEARED READY</span>
                </div>
              </div>
            </div>

            {/* Quick Contacts Block */}
            <div className="bg-[#0f172a] text-white rounded-3xl p-6 border border-slate-800 shadow-sm space-y-6">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-blue-400 font-mono font-bold block mb-1">BRAHIM INVESTMENT GROUP</span>
                <h3 className="text-xl font-bold text-white tracking-tight">Direct Contact Info</h3>
                <p className="text-xs text-slate-200 mt-1">Get immediate answers for emergency deployments.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-200 block font-mono text-[9px] uppercase">TECHNICAL DEPOT Compound</span>
                    <span className="text-white leading-relaxed font-semibold">3 Massalay Drive Juba Formerly Johnny Paul Drive</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-200 block font-mono text-[9px] uppercase">Leasing Desk Phone</span>
                    <a href={`https://wa.me/23234692208?text=${encodeURIComponent("Hello Brahim Investment Group, I am reaching out from your website: " + window.location.origin)}`} target="_blank" rel="noopener noreferrer" className="text-white font-semibold block hover:underline">+232 34 692208</a>
                    <a href={`https://wa.me/23276268296?text=${encodeURIComponent("Hello Brahim Investment Group, I am reaching out from your website: " + window.location.origin)}`} target="_blank" rel="noopener noreferrer" className="text-white font-semibold block hover:underline">+232 76 268296</a>
                    <a href={`https://wa.me/23279121013?text=${encodeURIComponent("Hello Brahim Investment Group, I am reaching out from your website: " + window.location.origin)}`} target="_blank" rel="noopener noreferrer" className="text-white font-semibold block hover:underline">+232 79 121013</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-200 block font-mono text-[9px] uppercase">Corporate Mail</span>
                    <span className="text-white font-semibold block">bigroupsl2010@gmail.com</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[10px] text-slate-400 leading-normal">
                📍 <strong>Headquarters.</strong> Ample customer parking is available. Technical staff on standby 24 hours.
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
