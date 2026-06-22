import React, { useState, useEffect } from 'react';
import { ActiveTab, Vehicle, Inquiry } from '../types';
import { VEHICLES } from '../data';
import { Phone, Mail, MapPin, Send, Calendar, CheckSquare, Sparkles, Building, Briefcase, Plus, Minus, ArrowRight, ShieldAlert, BadgeCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ContactSectionProps {
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  estimateDetails: { vehicleId: string; days: number; chauffeur: boolean; provincial: boolean; total: number } | null;
  clearEstimateDetails: () => void;
  onAddInquiry: (inquiry: Inquiry) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  selectedVehicleId,
  setSelectedVehicleId,
  estimateDetails,
  clearEstimateDetails,
  onAddInquiry
}) => {
  // Wizard Step State
  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Form Fields State
  const [fullName, setFullName] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  
  const [serviceType, setServiceType] = useState<Inquiry['serviceType']>('Chauffeur Driven');
  const [preferredVehicle, setPreferredVehicle] = useState<string>(selectedVehicleId || VEHICLES[0].id);
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

  const currentVehicleObj = VEHICLES.find(v => v.id === preferredVehicle) || VEHICLES[0];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert("Please accept the BIG Group vehicle vetting & agreement code to proceed.");
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
      preferredVehicle: currentVehicleObj.name,
      vehiclesNeeded,
      pickupLocation,
      dropoffLocation,
      specialRequirementsDet: `[Travel Scope: ${travelScope}, Fuel: ${fuelPolicy}] ${specialRequirementsDet}`,
      status: 'Pending',
      createdAt: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    onAddInquiry(newInquiry);
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
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Proposal Request Received</h2>
                  <p className="text-sm text-slate-550 mt-2 leading-relaxed">
                    Thank you, <strong>{fullName}</strong>. We have registered your inquiry on our Freetown servers. An official, itemized logistics quote complete with driver security credentials and fuel cycle audits will be generated under direct oversight by <strong>Emmanuel Kpakama</strong> and dispatched to <strong>{email}</strong> within 30 minutes.
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-3">
                  <span className="text-[9px] font-mono font-bold text-indigo-600 block uppercase tracking-wide">CONFIRMATION DETAILS</span>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-mono">REQUEST REFERENCE</span>
                      <span className="font-bold text-slate-800">BIG-9482-A</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">DISPATCH WINDOW</span>
                      <span className="font-bold text-slate-800">Under 30 Minutes</span>
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
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider font-mono">LOGISTICS DIRECT PORTAL</span>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">Book Your Vehicle</h1>
                  <p className="text-xs text-slate-500 mt-1">Please provide accurate corporate coordinates to ensure dynamic proposal vetting.</p>
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
                        step >= pStep.s ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {pStep.s}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider font-sans ${
                        step >= pStep.s ? 'text-indigo-600' : 'text-slate-400'
                      }`}>
                        {pStep.text}
                      </span>
                      {pStep.s < 4 && <span className="text-slate-300 font-mono text-sm">&rarr;</span>}
                    </div>
                  ))}
                </div>

                {/* STEP CONTENT SWITCH */}

                {/* STEP 1: Contact details */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <span className="text-[10px] uppercase font-mono font-extrabold text-indigo-600">PHASE 1 SEC-A: INDIVIDUAL VETTING CODES</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Full Representative Name*</label>
                        <input 
                          type="text" 
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g., Dr. Roland Cole"
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-sm font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Organization / Mission Name</label>
                        <input 
                          type="text" 
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="e.g., World Health Organization (WHO)"
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-sm font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Corporate Email Address*</label>
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g., r.cole@who.int"
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-sm font-sans"
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
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-sm font-sans"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Service Details */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <span className="text-[10px] uppercase font-mono font-extrabold text-indigo-600">PHASE 2 SEC-B: LOGISTICAL CATEGORIES</span>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Choose General Program Class Of Service</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { val: 'Chauffeur Driven', title: 'Chauffeur Driven' },
                          { val: 'Self-Drive Fleet', title: 'Self-Drive Fleet' },
                          { val: 'Custom Logistics', title: 'Custom Logistics' },
                          { val: 'Event Transport', title: 'Event Transport' }
                        ].map((srv) => (
                          <div 
                            key={srv.val}
                            onClick={() => setServiceType(srv.val as any)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                              serviceType === srv.val 
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-900' 
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-xs font-bold">{srv.title}</span>
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              serviceType === srv.val ? 'border-indigo-605 bg-indigo-600' : 'border-slate-300'
                            }`}>
                              {serviceType === srv.val && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Preferred Vehicle Class</label>
                      <select 
                        value={preferredVehicle}
                        onChange={(e) => setPreferredVehicle(e.target.value)}
                        className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-sm cursor-pointer"
                      >
                        {VEHICLES.map((v) => (
                          <option key={v.id} value={v.id}>{v.name} (${v.pricePerDay}/day - Est.)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Number of vehicles needed</label>
                      <div className="flex items-center space-x-4">
                        <button 
                          type="button"
                          onClick={() => setVehiclesNeeded(prev => Math.max(1, prev - 1))}
                          className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center border border-slate-200 cursor-pointer text-slate-705 font-bold"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-mono font-bold text-lg text-slate-800">{vehiclesNeeded}</span>
                        <button 
                          type="button"
                          onClick={() => setVehiclesNeeded(prev => prev + 1)}
                          className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center border border-slate-200 cursor-pointer text-slate-705 font-bold"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Rental Specifics */}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <span className="text-[10px] uppercase font-mono font-extrabold text-indigo-600">PHASE 3 SEC-C: ROUTING &amp; DISPATCH</span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Vetting start date*</label>
                        <input 
                          type="date" 
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-sm cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Vetting return date*</label>
                        <input 
                          type="date" 
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-sm cursor-pointer"
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
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Compound return Location</label>
                        <input 
                          type="text" 
                          value={dropoffLocation}
                          onChange={(e) => setDropoffLocation(e.target.value)}
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Vetting Code / Special details */}
                {step === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <span className="text-[10px] uppercase font-mono font-extrabold text-indigo-600">PHASE 4 SEC-D: OPERATIONS STATEMENT</span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Deploy Terrain Zone Scope</label>
                        <select 
                          value={travelScope}
                          onChange={(e) => setTravelScope(e.target.value as any)}
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600"
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
                          className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600"
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
                        className="w-full p-3.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600"
                      ></textarea>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          required
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="w-5 h-5 text-indigo-600 rounded border-slate-300 accent-indigo-600 mt-0.5 shrink-0 cursor-pointer"
                        />
                        <span className="text-[11px] text-slate-600 font-sans leading-relaxed">
                          I verify and agree that the driver and logistics coordinators assigned by B.I.G Group are fully credentialed, and that our organization guarantees compliance with direct vehicle diagnostic checks and local safety audits during the scope of leasing.
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
                      className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200"
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
            
            {/* Quick Contacts Block */}
            <div className="bg-[#0f172a] text-slate-300 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-6">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-mono font-bold block mb-1">BRAHIM INVESTMENT GROUP</span>
                <h3 className="text-xl font-bold text-white tracking-tight">Direct Contact Info</h3>
                <p className="text-xs text-slate-400 mt-1">Get immediate answers for emergency deployments.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block font-mono text-[9px] uppercase">TECHNICAL DEPOT Compound</span>
                    <span className="text-white leading-relaxed font-semibold">11 Freetown Road, Wilberforce, Freetown</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block font-mono text-[9px] uppercase">Leasing Desk Phone</span>
                    <span className="text-white font-semibold block">+232 79 121 013</span>
                    <span className="text-white font-semibold block">+232 30 133 574</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block font-mono text-[9px] uppercase">Corporate Mail</span>
                    <span className="text-white font-semibold block">bossbahonly@gmail.com</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[10px] text-slate-300 leading-normal">
                📍 <strong>Headquarters.</strong> Ample customer parking is available. Technical staff on standby 24 hours.
              </div>
            </div>

            {/* REAL-TIME PREVIEW BOARD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-mono font-bold text-gray-400 block mb-1">live proposal preview</span>
              <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">Dynamic Rental Breakdown</h4>

              <div className="mt-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-3 font-mono text-slate-600">
                <div className="text-center pb-2 border-b border-slate-200">
                  <span className="font-extrabold tracking-widest text-[#0f172a] block text-xs">B.I.G GROUP (SL)</span>
                  <span className="text-[8px] text-gray-400 block uppercase">11 Freetown Road, Wilberforce, Freetown</span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <p><strong>REPRESENTATIVE:</strong> {fullName || '---'}</p>
                  <p><strong>ORGANIZATION:</strong> {organization || '---'}</p>
                  <p><strong>SERVICE TYPE:</strong> {serviceType}</p>
                  <p><strong>VEHICLE UNIT:</strong> {currentVehicleObj.name}</p>
                  <p><strong>QUANTITY:</strong> {vehiclesNeeded} Unit(s)</p>
                  {startDate && <p><strong>DEPLOY DATE:</strong> {startDate}</p>}
                  {endDate && <p><strong>RETURN DATE:</strong> {endDate}</p>}
                  <p><strong>TERRAIN ZONE:</strong> {travelScope}</p>
                  <p><strong>FUEL:</strong> {fuelPolicy}</p>
                </div>

                <hr className="border-slate-200" />

                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>VETTED SECURITY STATUS:</span>
                  <span className="text-emerald-600 font-bold uppercase block">CLEARED READY</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
