import React, { useState, startTransition } from 'react';
import { ActiveTab, Vehicle } from '../types';
import { VEHICLES } from '../data';
import { ShieldAlert, Info, Fuel, AlertTriangle, Users, Compass, CircleCheck, Star, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FleetSectionProps {
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedVehicleId: (id: string) => void;
}

export const FleetSection: React.FC<FleetSectionProps> = ({ setActiveTab, setSelectedVehicleId }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedSpecVehicle, setSelectedSpecVehicle] = useState<Vehicle | null>(null);

  const vehicleTypes = ['All', 'Heavy SUV', 'Mid SUV', 'Truck'];

  const filteredVehicles = filterType === 'All' 
    ? VEHICLES 
    : VEHICLES.filter(v => v.type === filterType);

  const handleInquire = (vehicleId: string) => {
    startTransition(() => {
      setSelectedVehicleId(vehicleId);
      setActiveTab('contact');
    });
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 font-mono bg-indigo-50 border border-indigo-100 px-3 py-1 rounded">Sierra Leone Ready Fleet</span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mt-3">Our Premium 4WD Fleet</h1>
          <p className="mt-2 text-sm text-slate-550">
            Uncompromising mechanical safety and peak structural capability. Fully customized with heavy-duty suspension and extra-clearance setups for regional terrain demands.
          </p>
        </div>

        {/* Preventative Maintenance Notice Card */}
        <div className="bg-[#0f172a] text-white rounded-2xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto mb-12 border border-slate-800 flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-indigo-600/10 p-4 rounded-full text-indigo-400 shrink-0 border border-indigo-500/20 animate-pulse">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200 tracking-tight flex items-center gap-2">
              Rigorous Preventative Maintenance Active
            </h3>
            <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed">
              Every driver shift and logistics deployment begins with a meticulous mechanical scan. Under direct oversight by our workshop director on Wilkinson Road, we inspect suspension pressure, tire tread depth, battery output, and fluids, ensuring absolute upcountry runtime and zero breakdowns.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[10px] text-slate-400 font-mono font-semibold">
              <span className="flex items-center gap-1"><CircleCheck size={12} className="text-emerald-400" /> Full Diagnostic Computer Scans</span>
              <span className="flex items-center gap-1"><CircleCheck size={12} className="text-emerald-400" /> Dynamic Brake Thermal Analysis</span>
              <span className="flex items-center gap-1"><CircleCheck size={12} className="text-emerald-400" /> Complete OEM Spares Registry</span>
            </div>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex justify-center flex-wrap gap-2 mb-10 max-w-lg mx-auto">
          {vehicleTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-sm border border-indigo-600'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {type === 'All' ? 'All Vehicles' : `${type}s`}
            </button>
          ))}
        </div>

        {/* Main Fleet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {filteredVehicles.map((vehicle) => (
            <div 
              key={vehicle.id} 
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row h-full"
            >
              {/* Image side */}
              <div className="md:w-1/2 relative bg-slate-50 min-h-[220px] max-h-[300px] md:max-h-full">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name} 
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-[#0f172a] text-indigo-400 text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded shadow-sm border border-slate-800">
                  {vehicle.type}
                </span>
              </div>

              {/* Text / Actions side */}
              <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest leading-none">Vetted Ready</span>
                    <span className="text-slate-900 font-extrabold text-sm tracking-tight">${vehicle.pricePerDay}<span className="text-[10px] text-slate-400 font-normal ml-0.5">/day (est)</span></span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mt-2 tracking-tight leading-tight">{vehicle.name}</h3>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{vehicle.description}</p>

                  {/* Highlights checklist */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <Fuel size={14} className="text-indigo-500" />
                      <span>{vehicle.engine} ({vehicle.fuel})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <Users size={14} className="text-indigo-500" />
                      <span>Accommodates up to {vehicle.seats} adult passengers</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-6 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleInquire(vehicle.id)}
                      className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-[11px] tracking-wider uppercase transition-all duration-200 shadow-sm cursor-pointer text-center"
                    >
                      Inquire Now
                    </button>
                    <button
                      onClick={() => setSelectedSpecVehicle(vehicle)}
                      className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-705 font-bold rounded-xl text-[11px] uppercase border border-slate-200 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Info size={12} />
                      <span>Specifications</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Spec Modal Dialogue */}
        <AnimatePresence>
          {selectedSpecVehicle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full border border-slate-200 p-6 relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setSelectedSpecVehicle(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 hover:text-black transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>

                <span className="text-[10px] uppercase tracking-widest text-indigo-600 font-mono font-bold block mb-1">
                  OFF-ROAD PROFILE SCI-01
                </span>
                <h3 className="text-2xl font-black text-[#0f172a] tracking-tight">{selectedSpecVehicle.name}</h3>

                {/* Main Modal Spec Image */}
                <div className="my-5 h-48 w-full rounded-2xl bg-slate-50 overflow-hidden relative border border-slate-100">
                  <img 
                    src={selectedSpecVehicle.gallery[1] || selectedSpecVehicle.image} 
                    alt={selectedSpecVehicle.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 bg-indigo-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                    Field-Proven Upcountry Setup
                  </span>
                </div>

                {/* In Depth Specs list */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[10px] font-mono block">ENGINE CAPACITY</span>
                      <span className="font-bold text-slate-850 text-sm">{selectedSpecVehicle.detailedSpecs.engineSize}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[10px] font-mono block">DRIVETRAIN CONFIGURATION</span>
                      <span className="font-bold text-slate-850 text-sm">{selectedSpecVehicle.detailedSpecs.drivetrain}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[10px] font-mono block">GROUND CLEARANCE</span>
                      <span className="font-bold text-slate-850 text-sm">{selectedSpecVehicle.detailedSpecs.groundClearance}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[10px] font-mono block">FUEL CAPACITY</span>
                      <span className="font-bold text-slate-850 text-sm">{selectedSpecVehicle.detailedSpecs.fuelCapacity}</span>
                    </div>
                  </div>

                  <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100 text-xs">
                     <span className="text-indigo-650 font-mono font-bold uppercase tracking-wider block mb-1">STRATEGIC ALIGNMENT: Best For</span>
                    <p className="text-slate-700 font-sans leading-relaxed">{selectedSpecVehicle.detailedSpecs.bestFor}</p>
                  </div>

                  <hr className="border-slate-200" />

                  <div>
                    <span className="text-[10px] text-slate-500 font-mono font-bold block mb-2 uppercase">Custom Modifications Installed for Safe Transit</span>
                    <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                      {selectedSpecVehicle.features.map((feature, idx) => (
                        <li key={idx} className="leading-relaxed">{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => {
                      handleInquire(selectedSpecVehicle.id);
                      setSelectedSpecVehicle(null);
                    }}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold uppercase tracking-wider text-xs rounded-xl transition-all shadow-md cursor-pointer text-center"
                  >
                    Select vehicle &amp; proceed to book
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
