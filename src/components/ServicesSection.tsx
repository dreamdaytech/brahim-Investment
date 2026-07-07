import React, { useState, startTransition } from 'react';
import { ActiveTab, Vehicle } from '../types';
import { VEHICLES } from '../data';
import { Truck, ShieldCheck, Wrench, Users, Calendar, ArrowRight, DollarSign, HelpCircle, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface ServicesSectionProps {
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedVehicleId: (id: string) => void;
  setEstimateDetails: (details: { vehicleId: string; days: number; chauffeur: boolean; provincial: boolean; total: number }) => void;
  fleetVehicles?: any[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ setActiveTab, setSelectedVehicleId, setEstimateDetails, fleetVehicles = [] }) => {
  // Use live DB vehicles if available, fallback to static hardcoded list
  const calcVehicles: Array<{ id: string; name: string; pricePerDay: number }> = (
    fleetVehicles.length > 0
      ? fleetVehicles
          .filter(v => v.showOnFleet !== false && v.status === 'Available')
          .map(v => ({ id: v.id, name: v.makeModel, pricePerDay: v.pricePerDay ?? 130 }))
      : VEHICLES.map(v => ({ id: v.id, name: v.name, pricePerDay: v.pricePerDay }))
  );

  // Interactive Calculator State
  const [calcVehicleId, setCalcVehicleId] = useState<string>(() => calcVehicles[0]?.id ?? VEHICLES[0].id);
  const [calcDays, setCalcDays] = useState<number>(5);
  const [calcChauffeur, setCalcChauffeur] = useState<boolean>(true);
  const [calcProvincial, setCalcProvincial] = useState<boolean>(false);

  // Ensure selected vehicle is valid when the list updates (e.g. after DB load)
  const validCalcVehicleId = calcVehicles.some(v => v.id === calcVehicleId)
    ? calcVehicleId
    : (calcVehicles[0]?.id ?? calcVehicleId);

  // Find vehicle details
  const selectedVehicle = calcVehicles.find(v => v.id === validCalcVehicleId) ?? calcVehicles[0] ?? VEHICLES[0];

  // Calculate pricing
  const baseRate = selectedVehicle?.pricePerDay ?? 130;
  const chauffeurRate = 30; // 30 USD per day
  const provincialRate = 45; // 45 USD per day for provincial maintenance index

  const dailyRate = baseRate + (calcChauffeur ? chauffeurRate : 0) + (calcProvincial ? provincialRate : 0);
  
  // Calculate discount for longer rental
  let discountPercentage = 0;
  if (calcDays >= 14) discountPercentage = 15; // 15% discount for 2+ weeks
  else if (calcDays >= 7) discountPercentage = 10;  // 10% discount for 1+ week

  const subtotal = dailyRate * calcDays;
  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const totalCost = subtotal - discountAmount;

  const handleApplyEstimate = () => {
    startTransition(() => {
      setSelectedVehicleId(validCalcVehicleId);
      setEstimateDetails({
        vehicleId: validCalcVehicleId,
        days: calcDays,
        chauffeur: calcChauffeur,
        provincial: calcProvincial,
        total: totalCost
      });
      setActiveTab('contact');
    });
  };

  return (
    <div className="w-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 font-mono bg-indigo-50 border border-indigo-100 px-3 py-1 rounded">LOGISTICS EXCELLENCE</span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tight mt-3">Comprehensive Services</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            High-integrity fleet solutions for demanding upcountry and Freetown missions. Grounded on program integrity, direct OEM parts inventory, and defensively certified drivers.
          </p>
        </div>

        {/* Dynamic Bento Grid of Services */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          
          {/* Card 1: Large Bento on Left - Vehicle Rental & Deployment */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between col-span-1 lg:col-span-2">
            <div className="p-8">
              <span className="text-[10px] uppercase tracking-widest text-indigo-600 font-mono font-bold">DEPLOYMENT CAPABILITY MODEL</span>
              <h3 className="text-2xl font-black text-slate-950 mt-1 tracking-tight">Vehicle Rental &amp; Deployment</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                We manage a dedicated, fully insured fleet configured according to rigorous global standards. From independent research tours to corporate executive pools, our administrative dispatch handles everything from police clearance to toll payments flawlessly.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 shrink-0"></span>
                  <span className="text-xs text-slate-700 font-sans"><strong>In-Field Recovery Protocol:</strong> Automatic spot vehicle swap-out anywhere in Sierra Leone within strict regional timing window if any check indicates technical attention.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 shrink-0"></span>
                  <span className="text-xs text-slate-700 font-sans"><strong>Standard Fuel Auditing:</strong> Full transparent digital fuel logbooks supplied for corporate accounting and carbon offsetting programs.</span>
                </div>
              </div>
            </div>

            <div className="h-56 w-full relative">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJAJuwLKqmbCse-Nr7f2kMge-783BnAN83YrbCbBXXFQrYAmiS8gNRJE6LO38MhZ4HT7FLSAvK4p1lFYDTP8R7h01aKz2OMLo5TPSAWjtAGFHniLvoUXT8H-65iXd0WnnFFC9NBcRpAYn8OfD5ZiK6EDeQjRiE0OeYq7NEz3v9TyfDQLWYfnzw5bnBblcr2aAfRVqDMj2jMQAGU0wHTnKL4gua7OZoKq9J9OpAHaCf5BexXZQyIcKXTi3kpYvw-Z8HsP8-BEj8Xzw" 
                alt="BIG Group multi-vehicle deployment in Freetown" 
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 to-transparent"></div>
            </div>
          </div>

          {/* Card 2: Tall Bento on Right - Professional Chauffeurs */}
          <div className="bg-[#0f172a] text-slate-400 rounded-3xl p-8 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-indigo-400 text-[10px] uppercase font-mono font-bold tracking-widest block mb-1">DRIVER STANDARDS SEC-02</span>
              <h3 className="text-2xl font-black tracking-tight text-white">Professional Chauffeurs</h3>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                The driver is the paramount factor of route safety. We hire only vetted, highly communicative drivers who undergo biannual defensive handling coaching.
              </p>

              <ul className="mt-8 space-y-4 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <div className="p-0.5 bg-indigo-600 text-white rounded-full mt-0.5 shrink-0">
                    <ShieldCheck size={11} />
                  </div>
                  <span>First-Aid certified by Red Cross standards</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="p-0.5 bg-indigo-600 text-white rounded-full mt-0.5 shrink-0">
                    <ShieldCheck size={11} />
                  </div>
                  <span>High fluency in Krio, English and provincial dialects</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="p-0.5 bg-indigo-600 text-white rounded-full mt-0.5 shrink-0">
                    <ShieldCheck size={11} />
                  </div>
                  <span>Tested across severe upcountry logging tracks</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="p-0.5 bg-indigo-600 text-white rounded-full mt-0.5 shrink-0">
                    <ShieldCheck size={11} />
                  </div>
                  <span>Administrative discretion and non-disclosure standards</span>
                </li>
              </ul>
            </div>

            <div className="mt-12 p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs text-indigo-300 font-mono text-center">
              VETTED DIPLOMATIC &amp; VIP DRIVERS AVAILABLE
            </div>
          </div>

          {/* Card 3: Wide Bento - Fleet Maintenance & Repair */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col md:flex-row col-span-1 lg:col-span-3">
            <div className="p-8 md:w-3/5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-indigo-600 font-mono font-bold">TECHNICAL AND QUALITY CONTROL LAB</span>
                <h3 className="text-2xl font-black text-slate-950 mt-1 tracking-tight">Technical Maintenance Hub &amp; Repairs</h3>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  Our private maintenance depot on Freetown Road is outfitted with professional diagnostic machinery. Because our fleet consists entirely of highly standardized Toyota utility bodies, we keep a pristine stock of OEM filters, heavy-duty shocks, clutch kits, and reinforced tires to guarantee immediate repairs without delays.
                </p>

                <div className="grid grid-cols-3 gap-4 mt-6 text-center border-t border-slate-100 pt-6">
                  <div>
                    <span className="text-slate-950 font-black text-lg font-mono">100%</span>
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">OEM Parts Registry</span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-slate-950 font-black text-lg font-mono">Every 5k</span>
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">KM Complete Vetting</span>
                  </div>
                  <div>
                    <span className="text-slate-950 font-black text-lg font-mono">Certified</span>
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">Technical Mechanics</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full font-mono font-semibold">
                  <Wrench size={12} />
                  <span>Programmatic preventative diagnostic loops</span>
                </span>
              </div>
            </div>

            <div className="md:w-2/5 h-64 md:h-auto bg-slate-100 relative min-h-[220px]">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8ns-JlLcgH4lpL_0gzDXnZOiEvikbkDh6Ejooh74nU2nYPPPIN_5ldGfKiJUHqhANF8XGPDC2uLWKhkS6u5_PL_XvQhG50XH9dFSFOlzM8709QYnr8MFktDC4YeLuKbltR1mZ6pNHcp8-VL3btZ6vQBV49wmoHOaCB62F9sXdbVh_rQy2uIUSKUQrat3MtD_r9vMwItfyM-4F4JkWZ4uJf39BVnU-iU_11TcA2O3cmUQvGFtsw28A7Fj2dwCa6pJgvEggdtJAsWw" 
                alt="BIG Group automotive diagnostics depot" 
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0f172a]/10 to-[#0f172a]/40"></div>
            </div>
          </div>

        </div>

        {/* INTERACTIVE VALUE-ADD: COST ESTIMATOR */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-5xl mx-auto mb-12">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-2xl font-extrabold text-slate-950">Interactive Lease Cost Calculator</h3>
            <p className="text-xs text-slate-600 mt-1">Configure your deployment variables to get a quick estimate of lease cost before completing your inquiry.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Controls Input */}
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Preferred Vehicle Unit</label>
                <select 
                  value={validCalcVehicleId}
                  onChange={(e) => setCalcVehicleId(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-sm cursor-pointer"
                >
                  {calcVehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} (${v.pricePerDay}/day)</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Duration of Rental ({calcDays} Days)</label>
                  {calcDays >= 7 && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-mono">
                      {calcDays >= 14 ? '15% Volume Discount' : '10% Volume Discount'}
                    </span>
                  )}
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  value={calcDays}
                  onChange={(e) => setCalcDays(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 font-semibold">
                  <span>1 Day</span>
                  <span>10 Days</span>
                  <span>20 Days</span>
                  <span>30 Days</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[9px] font-mono font-extrabold text-slate-500 uppercase tracking-widest block mb-1">LOGISTICS PRESETS</span>
                
                <label className="flex items-center gap-3 cursor-pointer text-xs select-none">
                  <input 
                    type="checkbox" 
                    checked={calcChauffeur}
                    onChange={(e) => setCalcChauffeur(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Include Professional Chauffeur</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">+$30/day. Adds Red-Cross Certified, vetted driver coverage.</span>
                  </div>
                </label>

                <hr className="border-slate-200" />

                <label className="flex items-center gap-3 cursor-pointer text-xs select-none">
                  <input 
                    type="checkbox" 
                    checked={calcProvincial}
                    onChange={(e) => setCalcProvincial(e.target.checked)}
                    className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">Provincial Deployment Scope</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">+$45/day. Includes offroad tracking gear, preventative fluids reserve, and remote safety monitoring.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Calculations Estimate Display */}
            <div className="bg-[#0f172a] text-slate-400 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl text-center md:text-left">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-400 block mb-1">ITEMIZED DEPLOYMENT ESTIMATE</span>
              <h4 className="text-lg font-bold text-white tracking-tight">{selectedVehicle.name}</h4>
              <p className="text-xs text-slate-500 mt-1">Configured for continuous operations under BIG Group safety standards.</p>

              <hr className="border-slate-800 my-4" />

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Unit base rental ({calcDays} Days x ${baseRate}):</span>
                  <span className="font-mono font-semibold">${baseRate * calcDays}</span>
                </div>
                {calcChauffeur && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vetted driver surcharge ({calcDays} Days x $30):</span>
                    <span className="font-mono font-semibold">${chauffeurRate * calcDays}</span>
                  </div>
                )}
                {calcProvincial && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Upcountry remote logistical premium ({calcDays} x $45):</span>
                    <span className="font-mono font-semibold">${provincialRate * calcDays}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Volume incentive discount ({discountPercentage}%):</span>
                    <span className="font-mono font-semibold">-${discountAmount}</span>
                  </div>
                )}
              </div>

              <hr className="border-slate-800 my-4" />

              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-white uppercase font-mono">ESTIMATED TOTAL</span>
                <span className="text-3xl font-black text-indigo-400 font-mono">${totalCost}</span>
              </div>
              <p className="text-[9px] text-slate-600 leading-tight block mt-2 text-center md:text-left">
                *Surcharges exclude local GST. Formal business proposals are structured with exact dates, logistics clearances, and official corporate letterheads.
              </p>

              <div className="mt-6">
                <button
                  onClick={handleApplyEstimate}
                  className="w-full py-3.5 bg-indigo-600 text-white text-center font-semibold rounded-lg hover:bg-indigo-700 transition-all text-xs tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileText size={14} />
                  <span>Apply quote to booking engine</span>
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
