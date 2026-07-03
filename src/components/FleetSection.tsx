import React, { useState, startTransition } from 'react';
import { ActiveTab } from '../types';
import { VEHICLES } from '../data';
import { ShieldAlert, Info, Fuel, Users, CircleCheck, X, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface FleetSectionProps {
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedVehicleId: (id: string) => void;
  fleetVehicles?: any[];
}

export const FleetSection: React.FC<FleetSectionProps> = ({ setActiveTab, setSelectedVehicleId, fleetVehicles }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedSpecVehicle, setSelectedSpecVehicle] = useState<any | null>(null);

  // Use live DB vehicles if available, else fall back to hardcoded data
  const sourceVehicles = (fleetVehicles && fleetVehicles.length > 0)
    ? fleetVehicles.map(v => ({
        id: v.id,
        name: v.makeModel,
        type: v.vehicleCategory || v.type || 'SUV',
        fuel: v.fuelType || 'Diesel',
        transmission: v.transmission || 'Automatic',
        seats: v.seats || 5,
        engine: v.engineLabel || '',
        pricePerDay: v.pricePerDay || 0,
        description: v.description || '',
        features: v.features || [],
        image: v.imageUrl || '',
        gallery: v.galleryUrls || [],
        detailedSpecs: {
          engineSize: v.specEngineSize || '',
          drivetrain: v.specDrivetrain || '',
          groundClearance: v.specGroundClearance || '',
          fuelCapacity: v.specFuelCapacity || '',
          bestFor: v.specBestFor || '',
        },
      }))
    : VEHICLES.map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,
        fuel: v.fuel,
        transmission: v.transmission,
        seats: v.seats,
        engine: v.engine,
        pricePerDay: v.pricePerDay,
        description: v.description,
        features: v.features,
        image: v.imageUrl || (v as any).image || '',
        gallery: v.galleryUrls || (v as any).gallery || [],
        detailedSpecs: v.detailedSpecs,
      }));

  const vehicleTypes = ['All', ...Array.from(new Set(sourceVehicles.map(v => v.type)))];
  const filteredVehicles = filterType === 'All' ? sourceVehicles : sourceVehicles.filter(v => v.type === filterType);

  const handleInquire = (vehicleId: string) => {
    startTransition(() => {
      setSelectedVehicleId(vehicleId);
      setActiveTab('contact');
    });
  };

  if (selectedSpecVehicle) {
    return (
      <div className="w-full bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-6xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <button
              onClick={() => setSelectedSpecVehicle(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer group text-xs font-bold uppercase tracking-wider font-mono bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-indigo-600" />
              <span>Back to Fleet Registry</span>
            </button>
          </div>

          {/* Main Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Images (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative aspect-[16/10]"
              >
                {(selectedSpecVehicle.gallery?.[1] || selectedSpecVehicle.image) ? (
                  <img 
                    src={selectedSpecVehicle.gallery?.[1] || selectedSpecVehicle.image} 
                    alt={selectedSpecVehicle.name} 
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <span className="text-6xl font-black text-slate-400">{selectedSpecVehicle.name?.slice(0, 2)}</span>
                  </div>
                )}
                <span className="absolute top-6 left-6 bg-[#0f172a] text-indigo-400 text-xs uppercase font-mono font-bold px-3 py-1.5 rounded-lg border border-slate-800 shadow-lg">
                  {selectedSpecVehicle.type}
                </span>
              </motion.div>

              {/* Gallery Section */}
              {selectedSpecVehicle.gallery && selectedSpecVehicle.gallery.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
                >
                  <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">Visual Media Profiles</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedSpecVehicle.gallery.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative group">
                        <img 
                          src={imgUrl} 
                          alt={`${selectedSpecVehicle.name} - View ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right side: Key Info, Booking & Tech Specs (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Primary details card */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-widest">
                    Vetted Fleet Asset
                  </span>
                  <h1 className="text-3xl font-black text-slate-950 tracking-tight mt-3 leading-tight">{selectedSpecVehicle.name}</h1>
                  {selectedSpecVehicle.description && (
                    <p className="mt-4 text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                      {selectedSpecVehicle.description}
                    </p>
                  )}
                </div>

                {/* Core characteristics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[10px] font-mono block uppercase">Transmission</span>
                    <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{selectedSpecVehicle.transmission}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[10px] font-mono block uppercase">Fuel Type</span>
                    <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{selectedSpecVehicle.fuel}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[10px] font-mono block uppercase">Seating Capacity</span>
                    <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{selectedSpecVehicle.seats} Adults</span>
                  </div>
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                    <span className="text-indigo-500 text-[10px] font-mono block uppercase">Daily Rate (Est)</span>
                    <span className="font-extrabold text-indigo-700 text-sm mt-0.5 block">${selectedSpecVehicle.pricePerDay}<span className="text-[10px] text-indigo-400 font-normal ml-0.5">/day</span></span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => {
                    handleInquire(selectedSpecVehicle.id);
                    setSelectedSpecVehicle(null);
                  }}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs tracking-wider uppercase transition-colors shadow-md cursor-pointer text-center"
                >
                  Request Dispatch Setup
                </button>
              </motion.div>

              {/* Spec sheet card */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-5"
              >
                <h3 className="text-base font-black text-slate-950 tracking-tight">Technical Specifications</h3>
                
                <div className="space-y-3 divide-y divide-slate-100 text-xs font-semibold">
                  <div className="flex justify-between py-2.5">
                    <span className="text-slate-500 font-mono uppercase text-[10px]">Engine Capacity</span>
                    <span className="text-slate-800 font-bold">{selectedSpecVehicle.detailedSpecs.engineSize || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-slate-500 font-mono uppercase text-[10px]">Drivetrain</span>
                    <span className="text-slate-800 font-bold">{selectedSpecVehicle.detailedSpecs.drivetrain || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-slate-500 font-mono uppercase text-[10px]">Ground Clearance</span>
                    <span className="text-slate-800 font-bold">{selectedSpecVehicle.detailedSpecs.groundClearance || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-slate-500 font-mono uppercase text-[10px]">Fuel Capacity</span>
                    <span className="text-slate-800 font-bold">{selectedSpecVehicle.detailedSpecs.fuelCapacity || 'N/A'}</span>
                  </div>
                </div>

                {selectedSpecVehicle.detailedSpecs.bestFor && (
                  <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100 text-xs mt-4">
                    <span className="text-indigo-600 font-mono font-bold uppercase tracking-wider block mb-1">STRATEGIC ALIGNMENT: Best For</span>
                    <p className="text-slate-700 font-sans leading-relaxed font-medium">{selectedSpecVehicle.detailedSpecs.bestFor}</p>
                  </div>
                )}
              </motion.div>

              {/* Custom modifications list */}
              {selectedSpecVehicle.features && selectedSpecVehicle.features.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                  className="bg-[#0f172a] text-white rounded-3xl p-8 border border-slate-800 shadow-xl space-y-5"
                >
                  <div>
                    <span className="text-indigo-400 text-[10px] uppercase font-mono font-bold tracking-widest block mb-1">
                      SECURITY &amp; RUNTIME SPECS
                    </span>
                    <h3 className="text-base font-black tracking-tight text-slate-100">Custom Upcountry Setup</h3>
                  </div>
                  <ul className="space-y-3">
                    {selectedSpecVehicle.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed font-medium">
                        <CircleCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 font-mono bg-indigo-50 border border-indigo-100 px-3 py-1 rounded">Sierra Leone Ready Fleet</span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tight mt-3">Our Premium 4WD Fleet</h1>
          <p className="mt-2 text-sm text-slate-600">
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
            <p className="text-xs md:text-sm text-slate-500 mt-2 leading-relaxed">
              Every driver shift and logistics deployment begins with a meticulous mechanical scan. Under direct oversight by our workshop director on Freetown Road, we inspect suspension pressure, tire tread depth, battery output, and fluids, ensuring absolute upcountry runtime and zero breakdowns.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[10px] text-slate-500 font-mono font-semibold">
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
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800'
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
                {vehicle.image ? (
                  <img 
                    src={vehicle.image} 
                    alt={vehicle.name} 
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full min-h-[220px] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <span className="text-4xl font-black text-slate-400">{vehicle.name.slice(0, 2)}</span>
                  </div>
                )}
                <span className="absolute top-4 left-4 bg-[#0f172a] text-indigo-400 text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded shadow-sm border border-slate-800">
                  {vehicle.type}
                </span>
              </div>

              {/* Text / Actions side */}
              <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest leading-none">Vetted Ready</span>
                    <span className="text-slate-950 font-extrabold text-sm tracking-tight">${vehicle.pricePerDay}<span className="text-[10px] text-slate-500 font-normal ml-0.5">/day (est)</span></span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-950 mt-2 tracking-tight leading-tight">{vehicle.name}</h3>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{vehicle.description}</p>

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
                      className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-[11px] uppercase border border-slate-200 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
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

      </div>
    </div>
  );
};
