import React, { useState, startTransition } from 'react';
import { 
  Building2, 
  Route, 
  Truck, 
  Users, 
  CalendarCheck, 
  Key,
  ShieldCheck,
  UserCheck,
  Clock,
  Shield,
  Handshake,
  Mail,
  MapPin,
  Phone,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { VEHICLES } from '../data';

interface ServicesSectionProps {
  setSelectedVehicleId?: (id: string) => void;
  setEstimateDetails?: (details: any) => void;
  fleetVehicles?: any[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ setSelectedVehicleId, setEstimateDetails, fleetVehicles = [] }) => {
  const navigate = useNavigate();

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

  // Ensure selected vehicle is valid when the list updates
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
    if (setEstimateDetails && setSelectedVehicleId) {
      startTransition(() => {
        setSelectedVehicleId(validCalcVehicleId);
        setEstimateDetails({
          vehicleId: validCalcVehicleId,
          days: calcDays,
          chauffeur: calcChauffeur,
          provincial: calcProvincial,
          total: totalCost
        });
        navigate('/contact');
      });
    } else {
      navigate('/contact');
    }
  };

  const services = [
    {
      title: "Corporate Rentals",
      icon: <Building2 size={32} strokeWidth={1.5} />,
      desc: "Premium executive vehicles tailored for corporate clients, embassies, and NGOs."
    },
    {
      title: "Upcountry Transportation",
      icon: <Route size={32} strokeWidth={1.5} />,
      desc: "Rugged, high-clearance 4x4s equipped for challenging provincial terrains."
    },
    {
      title: "Construction & Heavy Duty Rentals",
      icon: <Truck size={32} strokeWidth={1.5} />,
      desc: "Heavy-duty logistics and transport vehicles for mining and construction projects."
    },
    {
      title: "Staff Transportation",
      icon: <Users size={32} strokeWidth={1.5} />,
      desc: "Reliable and spacious buses and vans for daily employee commuting."
    },
    {
      title: "Event & Logistics Support",
      icon: <CalendarCheck size={32} strokeWidth={1.5} />,
      desc: "Coordinated fleet deployment for conferences, delegations, and special events."
    },
    {
      title: "Long & Short Term Vehicle Hire",
      icon: <Key size={32} strokeWidth={1.5} />,
      desc: "Flexible leasing plans adapted to your specific timeframe and budget requirements."
    }
  ];

  const guarantees = [
    { title: "Well Maintained Vehicles", icon: <ShieldCheck size={24} /> },
    { title: "Experienced Drivers", icon: <UserCheck size={24} /> },
    { title: "On Time, Every Time", icon: <Clock size={24} /> },
    { title: "Safety First", icon: <Shield size={24} /> },
    { title: "Affordable & Reliable", icon: <Handshake size={24} /> }
  ];

  return (
    <div className="w-full bg-slate-50 min-h-screen font-sans flex flex-col">
      
      {/* 1. Hero Section */}
      <section className="relative w-full py-24 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        <motion.div 
          initial={{ scale: 1.0 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
          className="absolute inset-0 bg-[#0f172a]"
        >
          <img 
            src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80" 
            alt="Premium Fleet Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
        </motion.div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">


          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase whitespace-nowrap"
          >
            Brahim <span className="text-blue-400">Investment</span> Group
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mt-6 mb-4 w-full max-w-2xl"
          >
            <div className="h-0.5 flex-grow bg-gradient-to-r from-transparent to-blue-500"></div>
            <h2 className="text-sm md:text-lg font-bold text-white tracking-widest uppercase shrink-0">
              Professional Vehicle Rental Services
            </h2>
            <div className="h-0.5 flex-grow bg-gradient-to-l from-transparent to-blue-500"></div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-3xl font-serif italic text-slate-300 mb-10"
          >
            "Safe and Smooth Ride"
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-600 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-xl shadow-blue-900/50 border border-blue-500"
          >
            <MapPin size={18} />
            <span className="text-xs md:text-sm font-bold tracking-widest uppercase">
              Services Available Within Freetown & Upcountry
            </span>
          </motion.div>
        </div>
      </section>

      {/* 2. Our Services Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center gap-4 mb-16">
          <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Our Services</h2>
          <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                {service.icon}
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-3">
                {service.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* 3.5 Interactive Lease Cost Calculator */}
      <section className="w-full bg-slate-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Interactive Lease Cost Calculator</h2>
            <p className="mt-3 text-sm text-slate-500 max-w-2xl mx-auto">
              Configure your deployment variables to get a quick estimate of lease cost before completing your inquiry.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Left side: Controls */}
            <div className="w-full md:w-1/2 p-8 md:p-10 bg-white">
              <div className="space-y-8">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 tracking-wider uppercase mb-3">
                    Preferred Vehicle Unit
                  </label>
                  <select 
                    value={validCalcVehicleId}
                    onChange={(e) => setCalcVehicleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3.5 transition-all outline-none"
                  >
                    {calcVehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} (${v.pricePerDay}/day)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-[11px] font-bold text-slate-600 tracking-wider uppercase">
                      Duration of Rental ({calcDays} Days)
                    </label>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    value={calcDays}
                    onChange={(e) => setCalcDays(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 tracking-wider">
                    <span>1 Day</span>
                    <span>10 Days</span>
                    <span>20 Days</span>
                    <span>30 Days</span>
                  </div>
                </div>

                <div className="pt-4">
                  <span className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-4">Logistics Presets</span>
                  <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                        <input type="checkbox" className="peer sr-only" checked={calcChauffeur} onChange={(e) => setCalcChauffeur(e.target.checked)} />
                        <div className="w-5 h-5 rounded bg-white border border-slate-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">Include Professional Chauffeur</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">+Le 30/day. Adds Red-Cross Certified, vetted driver coverage.</p>
                      </div>
                    </label>

                    <div className="h-px w-full bg-slate-200/60 my-2"></div>

                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                        <input type="checkbox" className="peer sr-only" checked={calcProvincial} onChange={(e) => setCalcProvincial(e.target.checked)} />
                        <div className="w-5 h-5 rounded bg-white border border-slate-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">Provincial Deployment Scope</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">+Le 45/day. Includes offroad tracking gear, preventative fluids reserve, and remote safety monitoring.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Output */}
            <div className="w-full md:w-1/2 p-8 md:p-10 bg-[#0f172a] text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              
              <div className="relative z-10">
                <span className="text-[10px] font-bold tracking-widest text-blue-400 font-mono uppercase mb-4 block">Itemized Deployment Estimate</span>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">{selectedVehicle.name}</h3>
                <p className="text-xs text-slate-200 leading-relaxed max-w-sm mb-8">
                  Configured for continuous operations under BIG safety standards.
                </p>

                <div className="space-y-3 font-mono text-xs border-b border-white/10 pb-6 mb-6">
                  <div className="flex justify-between text-slate-300">
                    <span>Unit base rental ({calcDays} Days x Le {baseRate}):</span>
                    <span className="font-semibold text-white">${baseRate * calcDays}</span>
                  </div>
                  
                  {calcChauffeur && (
                    <div className="flex justify-between text-slate-300">
                      <span>Vetted driver surcharge ({calcDays} Days x Le {chauffeurRate}):</span>
                      <span className="font-semibold text-white">${chauffeurRate * calcDays}</span>
                    </div>
                  )}

                  {calcProvincial && (
                    <div className="flex justify-between text-slate-300">
                      <span>Provincial premium ({calcDays} Days x Le {provincialRate}):</span>
                      <span className="font-semibold text-white">${provincialRate * calcDays}</span>
                    </div>
                  )}

                  {discountPercentage > 0 && (
                    <div className="flex justify-between text-emerald-400 pt-2 border-t border-white/5 mt-2">
                      <span>Long-term deployment discount ({discountPercentage}%):</span>
                      <span className="font-semibold">-Le {discountAmount}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Estimated Total</span>
                  <div className="text-5xl font-black text-blue-400 tracking-tighter">${totalCost}</div>
                </div>
                
                <p className="text-[9px] text-slate-400 leading-relaxed mb-8">
                  *Surcharges exclude local GST. Formal business proposals are structured with exact dates, logistics clearances, and official corporate letterheads.
                </p>
              </div>

              <button
                onClick={handleApplyEstimate}
                className="relative z-10 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-blue-900/20"
              >
                <FileText size={16} className="group-hover:scale-110 transition-transform" />
                Apply Quote To Booking Engine
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Guarantees Banner (Moved below Calculator) */}
      <section className="w-full bg-white border-y border-slate-200 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12">
          {guarantees.map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="group flex flex-col items-center gap-3 w-40 text-center cursor-pointer"
            >
              <div className="w-12 h-12 bg-slate-50 text-blue-600 rounded-full flex items-center justify-center border border-slate-200 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                {item.icon}
              </div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide group-hover:text-blue-700 transition-colors">
                {item.title}
              </span>
            </motion.div>
          ))}
        </div>
      </section>



    </div>
  );
};
