import React, { startTransition } from 'react';
import { ActiveTab, Vehicle } from '../types';
import { VEHICLES, CORE_SERVICES, PARTNER_LOGOS } from '../data';
import { Shield, ShieldCheck, CheckCircle2, Truck, Users, Settings, Wrench, ArrowRight, Star, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeSectionProps {
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedVehicleId: (id: string) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ setActiveTab, setSelectedVehicleId }) => {
  const handleQuickBook = (vehicleId: string) => {
    startTransition(() => {
      setSelectedVehicleId(vehicleId);
      setActiveTab('contact');
    });
  };

  const serviceIconMap = (iconName: string) => {
    switch (iconName) {
      case 'Car': return <Truck className="text-indigo-600 w-8 h-8" />;
      case 'ShieldAlert': return <Users className="text-indigo-600 w-8 h-8" />;
      case 'Wrench': return <Wrench className="text-indigo-600 w-8 h-8" />;
      default: return <Shield className="text-indigo-600 w-8 h-8" />;
    }
  };

  return (
    <div className="w-full bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
      {/* 1. HERO SECTION WITH OFFROAD LAND CRUISER */}
      <section className="relative h-[620px] w-full flex items-center justify-center overflow-hidden">
        {/* Background Image with darken filters */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-[1.01]" 
          style={{ 
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCp-r63C6asQd2h41qWZMk-QJPqmib0ya2KLH8fAYBRGMRsqT9seldJn-3BeFu75Sj5zIGHN78fJaaUnmni3NTvVY2_T4NzrkIy5ONFbUJfQCmxEgSByq175skbr_3QOmyZjNmHUQfaFmc3xnb-DHEBjp7oKEANRKJ_dKhyFph4aIB-CGbT5Mq3oC71Y1NIyZuiATnZ2cgiG7mIIbVAZ254acSBzX4GohyuDxu6iFF-VW-vvO1F_7xA67UQ3cWqaGP54JpdaXdz0Ng')` 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/80 to-transparent"></div>
        </div>

        {/* Content Box */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-white flex flex-col items-start">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50 text-xs text-indigo-400 mb-6 shadow-sm"
          >
            <ShieldCheck size={14} className="animate-pulse" />
            <span className="font-semibold tracking-wide uppercase font-mono text-[10px]">Guaranteed 24/7 Deployment Coverage</span>
          </motion.div>

          <span className="text-sm uppercase tracking-widest text-[#818cf8] font-bold font-mono mb-2">SIERRA LEONE'S PREMIER OPERATOR</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-3xl">
            Premium Car Rental &amp; Driver Services
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Engineered for diplomats, global NGOs, banks, and senior executives. We operate the most rigorously maintained 4WD fleet in Freetown with absolute administrative integrity.
          </p>

          {/* Quick CTA Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('contact')}
              className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:shadow-md hover:bg-indigo-700 transition-all text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Book Your Vehicle</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className="px-8 py-4 bg-transparent text-white border-2 border-slate-400 font-semibold rounded-lg hover:bg-white/10 transition-all text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore SUV Fleet</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. PARTNERS LOGO BAND */}
      <section className="bg-white py-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold font-mono">Trusted by International Partners</p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4 items-center justify-center opacity-90 font-serif">
            {PARTNER_LOGOS.map((partner, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center min-w-[140px] text-center"
              >
                <span className="font-extrabold text-[#0f172a] text-sm tracking-tight">{partner.name}</span>
                <span className="text-[9px] font-bold text-indigo-600 font-mono uppercase mt-0.5">{partner.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICES BENTO GRID */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 font-mono bg-indigo-50 border border-indigo-100 text-indigo px-3 py-1 rounded">Comprehensive Fleet Logistics</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0f172a] mt-4">
            Uncompromising Transportation Solutions
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-500">
            From single executive airport transfers to massive institutional multi-vehicle development deployments, BIG Group guarantees absolute fleet readiness.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CORE_SERVICES.map((service, idx) => (
            <div 
              key={service.id}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="bg-indigo-50/85 p-4 rounded-xl w-fit mb-6 border border-indigo-100/50">
                  {serviceIconMap(service.iconName)}
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] tracking-tight">{service.title}</h3>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">{service.description}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wide block mb-3">Highlights Include:</span>
                <ul className="space-y-2">
                  {service.highlights.map((h, hIdx) => (
                    <li key={hIdx} className="flex items-center text-xs text-slate-600 font-sans gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHY CHOOSE US BLUE METALLIC BANNER */}
      <section className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white py-20 px-8 rounded-t-3xl md:rounded-t-[40px]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-indigo-400 text-xs font-semibold tracking-widest uppercase font-mono px-2.5 py-1 bg-white/5 border border-white/10 rounded">PREVENTATIVE SHIELD</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-4">
              Honesty of Safe Travel &amp; Deep Local Expertise.
            </h2>
            <p className="text-slate-300 mt-4 leading-relaxed text-sm md:text-base">
              The terrain in Sierra Leone requires absolute vehicular readiness. We do not compromise on tire tread depths, technical brake scanning, suspension durability upgrades, or administrative clarity. We are fully registered and completely clear of any bureaucratic issues.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-1 bg-indigo-600 text-white rounded-full mt-1">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Full Fuel Tank Transparency</p>
                  <p className="text-xs text-slate-400 mt-1">No hidden fuel processing charges. Straightforward operational billings and clear mileage audits.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-1 bg-indigo-600 text-white rounded-full mt-1">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Dedicated Technical Compound</p>
                  <p className="text-xs text-slate-400 mt-1">We maintain our private service station on Freetown Road with certified mechanics to service and diagnostic scan vehicles.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk4Sy77sM_D51guPMkYxasFWbrfxVLb_Z9YrOeLBsMlbWv_OTouvHBm4yEzjostnK1FyIX8Mbai9GGCDM9KzQB1JT0H3mMrW9XRxRmo39JACgJ0jNGWsg7FTZLaxyKOfKFfBqfZP8cVzcqRigeSu4qXrQcPohxGFwTIJ8e3Wyr67m-gwNTFA_JUUWILtokkq6YVPL81x1gQLPwywsvnu-x_gBkuTY_PC63rqUyWpTk4K8dP3HPagtSlBIFetzC6oz-yXyRn4fKxj8" 
              alt="BIG Group corporate fleet lineup" 
              className="w-full h-auto object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-slate-705/40 text-center">
              <p className="text-xs font-mono font-bold text-indigo-400">OUR PREMIUM OFF-ROAD TRANSIT LINE-UP</p>
              <p className="text-[10px] text-slate-300 mt-1">Configured for continuous deployments across Sierra Leone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED FLEET SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#5c68ea] font-mono">SELECTED MODELS PREVIEW</span>
            <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mt-2">Our Premium Ready 4WD Fleet</h2>
          </div>
          <button 
            onClick={() => setActiveTab('fleet')}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-all flex items-center gap-1 mt-4 md:mt-0 cursor-pointer hover:underline"
          >
            <span>View Full Rent Options</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {VEHICLES.slice(0, 3).map((vehicle) => (
            <div 
              key={vehicle.id} 
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Vehicle photo */}
                <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                  <img 
                    src={vehicle.imageUrl || (vehicle as any).image} 
                    alt={vehicle.name}
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-4 right-4 bg-slate-900 border border-slate-750 text-slate-100 text-[10px] uppercase font-mono font-semibold px-2.5 py-1 rounded shadow-sm">
                    {vehicle.type}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-indigo-600 font-mono font-bold">{vehicle.engine}</span>
                    <div className="flex items-center text-indigo-500 gap-0.5">
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#0f172a] tracking-tight">{vehicle.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{vehicle.description}</p>

                  <div className="grid grid-cols-2 gap-3 mt-4 bg-slate-50 p-3 rounded-lg text-xs text-slate-600 border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-mono">DRIVETRAIN</span>
                      <span className="font-semibold text-slate-800">Heavy Range 4x4</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-mono">SEATING</span>
                      <span className="font-semibold text-slate-800">{vehicle.seats} Full Seats</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handleQuickBook(vehicle.id)}
                  className="w-full py-3 bg-[#0f172a] text-white font-semibold rounded-lg hover:bg-indigo-600 hover:text-white transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Inquire / Request Quote</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. IMMERSIVE STATS / EXCELLENCE BLOCK */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl md:text-5xl font-black text-slate-900">100%</p>
            <p className="text-xs uppercase font-mono font-semibold text-slate-400 mt-2 tracking-wider">Mission Success Rate</p>
          </div>
          <div>
            <p className="text-3xl md:text-5xl font-black text-slate-900">24hr</p>
            <p className="text-xs uppercase font-mono font-semibold text-slate-400 mt-2 tracking-wider">Dynamic Dispatch Desk</p>
          </div>
          <div>
            <p className="text-3xl md:text-5xl font-black text-slate-900">Vetted</p>
            <p className="text-xs uppercase font-mono font-semibold text-slate-400 mt-2 tracking-wider">Professional Chauffeurs</p>
          </div>
          <div>
            <p className="text-3xl md:text-5xl font-black text-slate-900">Zero</p>
            <p className="text-xs uppercase font-mono font-semibold text-slate-400 mt-2 tracking-wider">Administrative Friction</p>
          </div>
        </div>
      </section>

      {/* 7. FINAL IMMEDIATE ACTION CALLOUT */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto bg-[#0f172a] text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          {/* Subtle decoration bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <span className="text-xs font-bold font-mono uppercase text-indigo-400 tracking-wider">Secure Sierra Leone operations Today</span>
              <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight mt-2">
                Need a formal multi-vehicle institutional quote?
              </h3>
              <p className="text-xs md:text-sm text-slate-300 mt-3 leading-relaxed">
                Contact our senior administration. We rapidly generate compliant, itemized logistic proposals complete with driver certifications, preventative scan clearances, and transparent terms.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('contact')}
              className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all text-xs tracking-wider uppercase shrink-0 cursor-pointer"
            >
              Request Custom Quote Proposal
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
