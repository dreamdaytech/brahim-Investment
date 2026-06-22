import React from 'react';
import { VALUES } from '../data';
import { Target, Award, ShieldClose, ShieldAlert, Star, Compass, UserCheck, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';

export const AboutSection: React.FC = () => {
  return (
    <div className="w-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 font-mono bg-indigo-50 border border-indigo-100 px-3 py-1 rounded">THE INSTITUTION</span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mt-3">Honesty &amp; Trust In Every Mile</h1>
          <p className="mt-2 text-sm text-slate-550 leading-relaxed">
            Registered and headquartered on Wilkinson Road, Freetown. Supporting international diplomatic corps, non-profit institutions, and high-level corporate missions for over a decade.
          </p>
        </div>

        {/* Narrative Split Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20 max-w-6xl mx-auto">
          <div className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Our Legacy of Reliable Transit</h2>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
              Brahim Investment Group (BIG Group) was established to resolve the severe logistical challenges faced by international agencies operating in Sierra Leone. While others offer vehicles, we deliver complete operational security.
            </p>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
              Over the years, our programmatic mechanical safety procedures, vertical cost honesty, and dedicated driver wellness program have set a benchmark. We maintain full ownership of all fleet assets, ensuring that we never lease sub-standard vehicles from secondary contractors.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-150">
              <div className="space-y-1">
                <span className="text-indigo-650 font-mono font-bold text-xs uppercase block">HEADQUARTERS</span>
                <span className="text-xs text-slate-800 font-semibold block">Wilkinson Road, Freetown</span>
              </div>
              <div className="space-y-1">
                <span className="text-indigo-650 font-mono font-bold text-xs uppercase block">PRIMARY FOCUS</span>
                <span className="text-xs text-slate-800 font-semibold block">Vetted 4WD Field Operations</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJAJuwLKqmbCse-Nr7f2kMge-783BnAN83YrbCbBXXFQrYAmiS8gNRJE6LO38MhZ4HT7FLSAvK4p1lFYDTP8R7h01aKz2OMLo5TPSAWjtAGFHniLvoUXT8H-65iXd0WnnFFC9NBcRpAYn8OfD5ZiK6EDeQjRiE0OeYq7NEz3v9TyfDQLWYfnzw5bnBblcr2aAfRVqDMj2jMQAGU0wHTnKL4gua7OZoKq9J9OpAHaCf5BexXZQyIcKXTi3kpYvw-Z8HsP8-BEj8Xzw" 
              alt="BIG Group corporate headquarters white SUV fleet" 
              className="w-full h-auto object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* The Foundation of Our Service (Bento of Core Values) */}
        <section className="bg-[#0f172a] text-slate-350 py-16 px-6 md:px-12 rounded-3xl mb-20 max-w-6xl mx-auto shadow-sm border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-indigo-400 text-xs font-mono font-bold tracking-widest uppercase bg-white/5 border border-white/10 px-2.5 py-1 rounded">ADMINISTRATIVE CODES</span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-3">The Foundation of Our Service</h2>
            <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed">
              These simple guidelines govern every driver we hire, every filter we cycle, and every dynamic quote proposal we submit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((val, idx) => (
              <div 
                key={idx}
                className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-indigo-400 font-mono font-bold text-xs">0{idx+1}.</span>
                  <h4 className="font-bold text-base tracking-tight text-white">{val.title}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{val.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Leadership Excellence Card Spotlight - Emmanuel A.H Kpakama */}
        <section className="max-w-4xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 font-mono">OPERATIONAL LEADERSHIP</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">Leadership Excellence</h2>
            <p className="text-xs text-slate-500 mt-1">Direct managerial accountability ensures your mission has support at the highest level.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Biography Image */}
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-sm border-2 border-slate-200 shrink-0 relative bg-slate-50">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDD0rRkKRJq6SJSWHt5e2RTejG8waUb1dMXWYvbUZ0qfKw92gYlTZTIFp4PiwiCU1fMON0sb5tt8WZo4InDfo8nxr8vhz0SrUUqlwGo56Ng1XLHv0wEXtsSrSLXIKcEn_cD65CEPs792IXXlQ2mSdJ7E-fPd5XvF9RSqje2fBfS9iIYJGmKbBeDapJF6gn5C8xrJH_qQtk4dzX-2K8xhDZvnLj5HKjqU8xHP5-jO-ANuEATjn-7IDKC-PNIj34irvRQrzQEJHeP8O4" 
                alt="Emmanuel A.H Kpakama - Head of Administration & Logistics Operations" 
                className="w-full h-full object-cover scale-[1.01]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md py-1 rounded text-center border border-white/5">
                <span className="text-[9px] text-[#818cf8] font-mono font-bold uppercase">Workshop Oversight Director</span>
              </div>
            </div>

            {/* Profile Bio Description */}
            <div className="space-y-4">
              <div>
                <span className="text-indigo-600 text-[10px] font-mono font-bold uppercase tracking-wider block mb-0.5 font-semibold">HEAD OF DEPLOYMENT OPERATIONS</span>
                <h3 className="text-xl md:text-2xl font-black text-[#0f172a] tracking-tight">Emmanuel A.H Kpakama</h3>
                <p className="text-xs font-semibold text-slate-500">Head of Administration &amp; Logistics Operations, BIG Group</p>
              </div>

              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                With over 12 coordination years resolving complex NGO logistics and high-end executive transport fleets across the Mano River Union, Emmanuel drives the operational excellence program at BIG Group. His absolute commitment remains directed at flawless diagnostic mechanical security, compliance with strict UN carrier criteria, and instant administrative responsiveness.
              </p>

              <div className="flex flex-wrap gap-2 pt-2 text-[10px] text-slate-500 font-mono">
                <span className="bg-slate-50 text-slate-650 px-2.5 py-1 rounded-full border border-slate-200">Defensive-Driving Assessor</span>
                <span className="bg-slate-50 text-slate-650 px-2.5 py-1 rounded-full border border-slate-200">Missions Liaison Lead</span>
                <span className="bg-slate-50 text-slate-650 px-2.5 py-1 rounded-full border border-slate-200">12+ Yrs Vetted Experience</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
