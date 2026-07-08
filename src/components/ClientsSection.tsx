import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, RefreshCw, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ClientItem } from '../types';

interface ClientsSectionProps {
  clients: ClientItem[];
}

export const ClientsSection: React.FC<ClientsSectionProps> = ({ clients }) => {
  const [filter, setFilter] = useState<'All' | 'Ongoing' | 'Completed'>('All');

  // Helper to generate initials
  const getInitials = (name: string) => {
    // Remove characters that might act as parens or extra symbols for nice initials
    const cleanName = name.replace(/[^a-zA-Z\s]/g, '');
    const tokens = cleanName.trim().split(/\s+/);
    if (tokens.length >= 2) {
      return (tokens[0][0] + tokens[1][0]).toUpperCase();
    }
    return tokens[0].substring(0, 2).toUpperCase();
  };

  // Helper to generate a background gradient class based on index
  const getAvatarGradient = (idx: number) => {
    const gradients = [
      'from-indigo-500 to-purple-500',
      'from-blue-500 to-cyan-500',
      'from-emerald-400 to-teal-500',
      'from-rose-400 to-red-500',
      'from-amber-400 to-orange-500',
      'from-violet-500 to-fuchsia-500',
    ];
    return gradients[idx % gradients.length];
  };

  const filteredClients = useMemo(() => {
    const publishedClients = clients.filter(c => !c.isDraft);
    if (filter === 'All') return publishedClients;
    return publishedClients.filter(client => {
      const status = client.status || 'Ongoing';
      if (filter === 'Completed') return status === 'Completed' || status === 'Inactive';
      if (filter === 'Ongoing') return status === 'Ongoing' || status === 'Active' || (status !== 'Completed' && status !== 'Inactive' && status !== 'Pending');
      return true;
    });
  }, [filter, clients]);

  return (
    <div className="w-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Use header button for back if accessed as subpage, otherwise just regular header */}
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 font-mono bg-indigo-50 border border-indigo-100 px-3 py-1 rounded">RECOGNIZED LOGISTICS PARTNERS</span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tight mt-4">Proven Operational Record</h1>
            <p className="mt-4 text-sm md:text-base text-slate-600 leading-relaxed">
              We exclusively support organizations requiring uncompromising fleet standards, including high-availability diplomatic missions, international health programs, and corporate deployments across rigorous terrain.
            </p>
          </div>

          {/* Filter Toggles */}
          <div className="flex bg-slate-200/50 p-1 rounded-xl shrink-0 self-start md:self-end">
            {(['All', 'Ongoing', 'Completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  filter === status
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, idx) => {
            const status = client.status || 'Ongoing';
            const isCompleted = status === 'Completed' || status === 'Inactive';
            const isPending = status === 'Pending';
            const isOngoing = !isCompleted && !isPending;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    {client.logoUrl ? (
                      <img
                        src={client.logoUrl}
                        alt={client.name}
                        className="w-14 h-14 rounded-2xl object-contain bg-white border border-slate-200 shadow-sm shrink-0 group-hover:scale-105 transition-transform p-1"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 bg-gradient-to-br ${getAvatarGradient(idx)} font-mono font-black text-lg tracking-tighter group-hover:scale-105 transition-transform`}>
                        {getInitials(client.name)}
                      </div>
                    )}
                    <h3 className="text-lg font-black text-slate-950 tracking-tight leading-tight flex-1">{client.name}</h3>
                  </div>
                  
                  <p className="text-xs text-slate-600 font-medium leading-relaxed border-l-2 border-indigo-100 pl-3">
                    {client.service}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase ${
                    isCompleted
                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                      : isPending
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={12} /> : isPending ? <RefreshCw size={12} /> : <RefreshCw size={12} className="animate-[spin_4s_linear_infinite]" />}
                    <span>{isCompleted ? 'Completed' : isPending ? 'Pending' : 'Ongoing'}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Security Trust Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-[#0f172a] rounded-3xl p-8 border border-slate-800 shadow-xl text-center md:text-left flex flex-col md:flex-row items-center gap-8 justify-between"
        >
          <div className="max-w-xl">
            <span className="text-indigo-400 text-[10px] uppercase font-mono font-bold tracking-widest block mb-2">VETTED EXCELLENCE</span>
            <h3 className="text-2xl font-black tracking-tight text-white">Trust In Official Deployments</h3>
            <p className="text-xs md:text-sm text-slate-500 mt-3 leading-relaxed">
              B.I.G Group's continuous operational record highlights our capacity for long-term fleet stability, proactive mechanical resolution, and seamless compliance with international non-profit security demands.
            </p>
          </div>
          <div className="shrink-0 flex gap-4">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
              <ShieldCheck size={28} />
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
