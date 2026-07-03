import React from 'react';
import { ActiveTab } from '../types';
import { Shield, Phone, Mail, MapPin, ArrowUpRight, Calendar, Clock, Award } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#0f172a] text-slate-400 border-t border-slate-800">
      {/* Top Value Accents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start space-x-4">
          <div className="p-2.5 bg-slate-800 rounded-lg text-indigo-400 border border-slate-700">
            <Clock size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-200">24/7 Deployment Standard</h4>
            <p className="text-xs text-slate-500 mt-1">Emergency dispatch desk and fast replacement cars ready in Freetown and upcountry centers.</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="p-2.5 bg-slate-800 rounded-lg text-indigo-400 border border-slate-700">
            <Shield size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-200">Strict preventative routine</h4>
            <p className="text-xs text-slate-500 mt-1">Every car is fully diagnostic scanned and mechanically re-checked prior to every single client deployment.</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="p-2.5 bg-slate-800 rounded-lg text-indigo-400 border border-slate-700">
            <Award size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-200">Sierra Leone’s Prestigious Choice</h4>
            <p className="text-xs text-slate-500 mt-1">First-choice operator for visiting high-profile diplomats, multinational banks, corporate heads of mission, and global NGOs.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-1.5 rounded text-white font-black">
              <Shield size={18} />
            </div>
            <div>
              <span className="text-lg font-black tracking-wide">B.I.G</span>
              <span className="text-xs font-semibold text-indigo-400 ml-1">GROUP</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            Sierra Leone's premiere vehicle leasing and driver management institution. Providing unparalleled 4WD power and high-class corporate logistics under strict accountability codes.
          </p>
          <div className="flex items-center space-x-2 pt-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] tracking-wider font-mono text-emerald-400 uppercase font-semibold">Pre-authorized UN Vendor ID #39112</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400 border-l-2 border-indigo-500 pl-2 mb-4">Core Fleet</h3>
          <ul className="space-y-2 text-xs text-slate-500 font-sans">
            <li>
              <button onClick={() => setActiveTab('fleet')} className="hover:text-white hover:underline transition-all flex items-center gap-1 cursor-pointer">
                Toyota Land Cruiser Prado <ArrowUpRight size={10} className="opacity-60" />
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('fleet')} className="hover:text-white hover:underline transition-all flex items-center gap-1 cursor-pointer">
                Toyota Land Cruiser V8 <ArrowUpRight size={10} className="opacity-60" />
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('fleet')} className="hover:text-white hover:underline transition-all flex items-center gap-1 cursor-pointer">
                Toyota 4Runner SR5 <ArrowUpRight size={10} className="opacity-60" />
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('fleet')} className="hover:text-white hover:underline transition-all flex items-center gap-1 cursor-pointer">
                Toyota Hilux Double Cabin <ArrowUpRight size={10} className="opacity-60" />
              </button>
            </li>
          </ul>
        </div>

        {/* Services Navigation */}
        <div>
          <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400 border-l-2 border-indigo-500 pl-2 mb-4">Logistics Services</h3>
          <ul className="space-y-2 text-xs text-slate-500 font-sans">
            <li>
              <button onClick={() => setActiveTab('services')} className="hover:text-white hover:underline transition-all cursor-pointer">
                Long-term Corporate Fleet Leasing
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('services')} className="hover:text-white hover:underline transition-all cursor-pointer">
                Armed/Vetted Executive Escort & Driver Hire
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('services')} className="hover:text-white hover:underline transition-all cursor-pointer">
                Provincial Offroad Deployment Logistics
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('services')} className="hover:text-white hover:underline transition-all cursor-pointer">
                Diagnostic & Scheduled Mechanical Support
              </button>
            </li>
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h3 className="font-semibold text-xs tracking-wider uppercase text-slate-400 border-l-2 border-indigo-500 pl-2 mb-4">Contact Points</h3>
          <ul className="space-y-3 text-xs text-slate-500 font-sans">
            <li className="flex items-start space-x-2">
              <MapPin size={14} className="text-indigo-400 mt-0.5 shrink-0" />
              <span>11 Freetown Road, Wilberforce, Freetown</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone size={14} className="text-indigo-400 shrink-0" />
              <span>+232 79 121 013 / +232 30 133 574</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail size={14} className="text-indigo-400 shrink-0" />
              <span>bossbahonly@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Extreme Bottom Bar */}
      <div className="bg-[#090d16] py-4 text-center text-[10px] text-slate-600 font-sans border-t border-slate-950 px-4">
        <p className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Brahim Investment Group (B.I.G Group SRL). All Rights Reserved.</span>
          <span className="flex items-center gap-3">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Rental</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 cursor-pointer">Maintenance Guarantee Policy</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 cursor-pointer">Missions Safety Code</span>
          </span>
        </p>
      </div>
    </footer>
  );
};
