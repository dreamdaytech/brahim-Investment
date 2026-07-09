import React, { useState, startTransition } from 'react';
import { VEHICLES } from '../data';
import { ShieldAlert, Info, Fuel, Users, CircleCheck, ArrowLeft, LayoutGrid, List, ChevronRight, Gauge, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface FleetSectionProps {
  setSelectedVehicleId: (id: string) => void;
  fleetVehicles?: any[];
}

export const FleetSection: React.FC<FleetSectionProps> = ({ setSelectedVehicleId, fleetVehicles }) => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedSpecVehicle, setSelectedSpecVehicle] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Use live DB vehicles if available, else fall back to hardcoded data
  const sourceVehicles = (fleetVehicles && fleetVehicles.length > 0)
    ? fleetVehicles
        .filter(v => !v.status || v.status === 'Available')
        .map(v => ({
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
      navigate('/contact');
    });
  };

  // ── Vehicle Detail View ──────────────────────────────────────────────────────
  if (selectedSpecVehicle) {
    return (
      <div className="w-full bg-slate-50 min-h-screen py-12 px-4 md:px-6 font-sans">
        <div className="max-w-[96%] xl:max-w-[98%] 2xl:max-w-[1600px] mx-auto">

          {/* Breadcrumb */}
          <div className="mb-8">
            <button
              onClick={() => setSelectedSpecVehicle(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer group text-xs font-bold uppercase tracking-wider font-mono bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-blue-600" />
              <span>Back to Fleet Registry</span>
            </button>
          </div>

          {/* Main Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left: Images */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative aspect-[16/10]"
              >
                {(selectedSpecVehicle.gallery?.[0] || selectedSpecVehicle.image) ? (
                  <img
                    src={selectedSpecVehicle.gallery?.[0] || selectedSpecVehicle.image}
                    alt={selectedSpecVehicle.name}
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <span className="text-6xl font-black text-slate-400">{selectedSpecVehicle.name?.slice(0, 2)}</span>
                  </div>
                )}
                <span className="absolute top-6 left-6 bg-[#0f172a] text-blue-400 text-xs uppercase font-mono font-bold px-3 py-1.5 rounded-lg border border-slate-800 shadow-lg">
                  {selectedSpecVehicle.type}
                </span>
              </motion.div>

              {/* Gallery */}
              {selectedSpecVehicle.gallery && selectedSpecVehicle.gallery.length > 1 && (
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

            {/* Right: Info + Specs */}
            <div className="lg:col-span-5 space-y-6">
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
                  {selectedSpecVehicle.pricePerDay > 0 && (
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                      <span className="text-blue-500 text-[10px] font-mono block uppercase">Daily Rate (Est)</span>
                      <span className="font-extrabold text-blue-700 text-sm mt-0.5 block">${selectedSpecVehicle.pricePerDay}<span className="text-[10px] text-blue-400 font-normal ml-0.5">/day</span></span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { handleInquire(selectedSpecVehicle.id); setSelectedSpecVehicle(null); }}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs tracking-wider uppercase transition-colors shadow-md cursor-pointer text-center"
                >
                  Request Dispatch Setup
                </button>
              </motion.div>

              {/* Tech Specs */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-5"
              >
                <h3 className="text-base font-black text-slate-950 tracking-tight">Technical Specifications</h3>
                <div className="space-y-3 divide-y divide-slate-100 text-xs font-semibold">
                  {[
                    { label: 'Engine Capacity', val: selectedSpecVehicle.detailedSpecs?.engineSize },
                    { label: 'Drivetrain', val: selectedSpecVehicle.detailedSpecs?.drivetrain },
                    { label: 'Ground Clearance', val: selectedSpecVehicle.detailedSpecs?.groundClearance },
                    { label: 'Fuel Capacity', val: selectedSpecVehicle.detailedSpecs?.fuelCapacity },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between py-2.5">
                      <span className="text-slate-500 font-mono uppercase text-[10px]">{label}</span>
                      <span className="text-slate-800 font-bold">{val || 'N/A'}</span>
                    </div>
                  ))}
                </div>
                {selectedSpecVehicle.detailedSpecs?.bestFor && (
                  <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 text-xs mt-4">
                    <span className="text-blue-600 font-mono font-bold uppercase tracking-wider block mb-1">STRATEGIC ALIGNMENT: Best For</span>
                    <p className="text-slate-700 font-sans leading-relaxed font-medium">{selectedSpecVehicle.detailedSpecs.bestFor}</p>
                  </div>
                )}
              </motion.div>

              {/* Features */}
              {selectedSpecVehicle.features && selectedSpecVehicle.features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                  className="bg-[#0f172a] text-white rounded-3xl p-8 border border-slate-800 shadow-xl space-y-5"
                >
                  <div>
                    <span className="text-blue-400 text-[10px] uppercase font-mono font-bold tracking-widest block mb-1">SECURITY &amp; RUNTIME SPECS</span>
                    <h3 className="text-base font-black tracking-tight text-slate-100">Custom Upcountry Setup</h3>
                  </div>
                  <ul className="space-y-3">
                    {selectedSpecVehicle.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed font-medium">
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

  // ── Fleet Listing View ───────────────────────────────────────────────────────
  return (
    <div className="w-full bg-slate-50 min-h-screen py-12 px-4 md:px-6 font-sans">
      <div className="max-w-[96%] xl:max-w-[98%] 2xl:max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono bg-blue-50 border border-blue-100 px-3 py-1 rounded">Sierra Leone Ready Fleet</span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tight mt-3">Our Premium 4WD Fleet</h1>
          <p className="mt-2 text-sm text-slate-600">
            Uncompromising mechanical safety and peak structural capability. Fully customized with heavy-duty suspension and extra-clearance setups for regional terrain demands.
          </p>
        </div>

        {/* Maintenance Notice */}
        <div className="bg-[#0f172a] text-white rounded-2xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto mb-12 border border-slate-800 flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-blue-600/10 p-4 rounded-full text-blue-400 shrink-0 border border-blue-500/20 animate-pulse">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200 tracking-tight">Rigorous Preventative Maintenance Active</h3>
            <p className="text-xs md:text-sm text-slate-200 mt-2 leading-relaxed">
              Every driver shift and logistics deployment begins with a meticulous mechanical scan. Under direct oversight by our workshop director on Freetown Road, we inspect suspension pressure, tire tread depth, battery output, and fluids, ensuring absolute upcountry runtime and zero breakdowns.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[10px] text-slate-200 font-mono font-semibold">
              <span className="flex items-center gap-1"><CircleCheck size={12} className="text-emerald-400" /> Full Diagnostic Computer Scans</span>
              <span className="flex items-center gap-1"><CircleCheck size={12} className="text-emerald-400" /> Dynamic Brake Thermal Analysis</span>
              <span className="flex items-center gap-1"><CircleCheck size={12} className="text-emerald-400" /> Complete OEM Spares Registry</span>
            </div>
          </div>
        </div>

        {/* Filter + View Toggle Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {vehicleTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-blue-600 text-white shadow-sm border border-blue-600'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {type === 'All' ? 'All Vehicles' : `${type}s`}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <List size={14} />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Grid</span>
            </button>
          </div>
        </div>

        {/* Vehicle Count */}
        <p className="text-xs text-slate-500 font-mono mb-6">
          Showing <span className="text-slate-800 font-bold">{filteredVehicles.length}</span> vehicle{filteredVehicles.length !== 1 ? 's' : ''}
          {filterType !== 'All' && <span> in <span className="text-blue-600">{filterType}</span></span>}
        </p>

        {/* ── LIST VIEW ─────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {filteredVehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setSelectedSpecVehicle(vehicle)}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row items-stretch">
                    {/* Image */}
                    <div className="sm:w-56 lg:w-64 shrink-0 relative overflow-hidden bg-slate-100 min-h-[160px] sm:min-h-0">
                      {vehicle.image ? (
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 absolute inset-0">
                          <span className="text-3xl font-black text-slate-300">{vehicle.name.slice(0, 2)}</span>
                        </div>
                      )}
                      <span className="absolute top-3 left-3 bg-[#0f172a] text-blue-400 text-[10px] uppercase font-mono font-bold px-2 py-1 rounded border border-slate-800">
                        {vehicle.type}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">Vetted Ready</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-950 tracking-tight leading-tight truncate">{vehicle.name}</h3>
                        {vehicle.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{vehicle.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                            <Fuel size={12} className="text-blue-500" /> {vehicle.fuel}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                            <Users size={12} className="text-blue-500" /> {vehicle.seats} Seats
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                            <Gauge size={12} className="text-blue-500" /> {vehicle.transmission}
                          </span>
                          {vehicle.engine && (
                            <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                              <Zap size={12} className="text-blue-500" /> {vehicle.engine}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price + Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                        {vehicle.pricePerDay > 0 && (
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-mono uppercase">Est. Daily Rate</p>
                            <p className="text-xl font-black text-slate-950">${vehicle.pricePerDay}<span className="text-xs text-slate-400 font-normal">/day</span></p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleInquire(vehicle.id); }}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] tracking-wider uppercase transition-all shadow-sm cursor-pointer"
                          >
                            Inquire
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedSpecVehicle(vehicle); }}
                            className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
                            title="View Details"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* ── GRID VIEW ──────────────────────────────────────────────────── */
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredVehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setSelectedSpecVehicle(vehicle)}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    {vehicle.image ? (
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <span className="text-4xl font-black text-slate-300">{vehicle.name.slice(0, 2)}</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-[#0f172a] text-blue-400 text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded shadow-sm border border-slate-800">
                      {vehicle.type}
                    </span>
                    {vehicle.pricePerDay > 0 && (
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-black px-2.5 py-1 rounded-lg shadow-sm border border-slate-100">
                        ${vehicle.pricePerDay}<span className="text-[9px] text-slate-400 font-normal">/day</span>
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest w-fit mb-2">Vetted Ready</span>
                    <h3 className="text-base font-black text-slate-950 tracking-tight leading-tight">{vehicle.name}</h3>
                    {vehicle.description && (
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed flex-1">{vehicle.description}</p>
                    )}

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Fuel size={11} className="text-blue-400" /> {vehicle.fuel}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Users size={11} className="text-blue-400" /> {vehicle.seats}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Gauge size={11} className="text-blue-400" /> {vehicle.transmission?.slice(0, 4)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleInquire(vehicle.id); }}
                        className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] tracking-wider uppercase transition-all cursor-pointer text-center"
                      >
                        Inquire
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedSpecVehicle(vehicle); }}
                        className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-[11px] uppercase border border-slate-200 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Info size={11} />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-24 text-slate-400">
            <LayoutGrid size={40} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold text-slate-500">No vehicles found</p>
            <p className="text-sm mt-1">Try selecting a different category</p>
          </div>
        )}

      </div>
    </div>
  );
};
