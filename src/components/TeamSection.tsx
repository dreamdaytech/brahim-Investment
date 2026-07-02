import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldCheck, Wrench, MessageSquare, MapPin, Phone, Mail, Globe, Briefcase, X } from 'lucide-react';
import { ActiveTab } from '../types';

interface TeamSectionProps {
  setActiveTab: (tab: ActiveTab) => void;
}


const TEAM_MEMBERS = [
  {
    name: 'Emmanuel A.H Kpakama',
    role: 'Head of Admin and Logistics',
    dedicatedRole: 'Primary point of contact for Helen Keller Intl – receives orders, manages scheduling, resolves issues',
    languages: 'English and local languages',
    phone: '+23234692208 / +23275868682',
    email: 'Bigroupsl2010@gmail.com',
    bio: 'Results-driven Fleet Management Administrator with over 10 years of comprehensive experience directing large-scale fleet operations, fuel management, procurement, and administrative functions across the logistics and construction sectors. Adept at building and implementing fleet management systems, controlling operational costs, ensuring vehicle compliance, and leading cross-functional teams. Combines strong analytical capability with hands-on operational expertise to drive efficiency, reduce downtime, and align fleet performance with strategic organisational goals. Recognised for exceptional leadership, meticulous attention to detail, and a consistent track record of delivering measurable improvements in fleet utilisation and cost reduction.',
    skills: ['Defensive-Driving Assessor', 'Missions Liaison Lead', '10+ Yrs Experience'],
    icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDD0rRkKRJq6SJSWHt5e2RTejG8waUb1dMXWYvbUZ0qfKw92gYlTZTIFp4PiwiCU1fMON0sb5tt8WZo4InDfo8nxr8vhz0SrUUqlwGo56Ng1XLHv0wEXtsSrSLXIKcEn_cD65CEPs792IXXlQ2mSdJ7E-fPd5XvF9RSqje2fBfS9iIYJGmKbBeDapJF6gn5C8xrJH_qQtk4dzX-2K8xhDZvnLj5HKjqU8xHP5-jO-ANuEATjn-7IDKC-PNIj34irvRQrzQEJHeP8O4'
  },
  {
    name: 'Mamadu Sara Bah',
    role: 'Head of Finance, Accounting and Compliance',
    bio: 'Oversees financial operations, compliance reporting for international partnerships, and strict auditing protocols across all logistics deployments.',
    skills: ['Corporate Auditing', 'International Compliance', 'Financial Operations'],
    icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
    image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=400&auto=format&fit=crop'
  },
  {
    name: 'Fatima Jaward Jalloh',
    role: 'Finance and Fuel Controller',
    bio: 'Manages fuel distribution networks, expense tracking, and cost optimizations for deep-upcountry deployments and fleet operations.',
    skills: ['Resource Optimization', 'Fuel Audit Protocols', 'Cost Tracking'],
    icon: <MessageSquare className="w-5 h-5 text-indigo-600" />,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop'
  },
  {
    name: 'Philip Hebron',
    role: 'Fleet and Facility Coordinator',
    bio: 'Oversees daily fleet movements, dispatch schedules, and the maintenance of operational facilities for real-time responsiveness.',
    skills: ['Dispatch Logistics', 'Facility Administration', 'Asset Allocation'],
    icon: <MapPin className="w-5 h-5 text-indigo-600" />,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
  },
  {
    name: 'Hawa Bangura',
    role: 'Procurement, Finance and Logistics Assistant',
    bio: 'Supports cross-functional coordination, acquiring vital deployment materials safely, and ensuring smooth billing pipelines.',
    skills: ['Procurement Pipeline', 'Invoice Processing', 'Supply Chain Liaison'],
    icon: <MessageSquare className="w-5 h-5 text-indigo-600" />,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop'
  },
  {
    name: 'Bailor Barrie',
    role: 'Maintenance Supervisor',
    bio: 'Specialized in mechanical safety protocols and deep diagnostic vetting before heavy-duty upcountry deployments.',
    skills: ['Advanced Diagnostics', 'Preventative Care', 'Rapid Recovery'],
    icon: <Wrench className="w-5 h-5 text-indigo-600" />,
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=400&auto=format&fit=crop'
  },
  {
    name: 'Abdul Mustapha',
    role: 'Maintenance Supervisor',
    bio: 'Conducts strict point-by-point inspections after every deployment to ensure 0% tolerance for failure on our SUV fleets.',
    skills: ['Heavy Machinery Recovery', 'Engine Systems', 'Field Support'],
    icon: <Wrench className="w-5 h-5 text-indigo-600" />,
    image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=400&auto=format&fit=crop'
  },
  {
    name: 'Osman Kamara (OTK)',
    role: 'Monitoring and Evaluation Supervisor',
    bio: 'Responsible for long-term fleet tracking, driver KPI auditing, and ensuring rigorous mechanical compliance standards are met.',
    skills: ['Performance Auditing', 'GPS Analytics', 'Compliance Metrics'],
    icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
    image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=400&auto=format&fit=crop'
  }
];

export const TeamSection: React.FC<TeamSectionProps> = ({ setActiveTab }) => {
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Helper to truncate text
  const truncateBio = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans min-h-screen relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="mb-12">
          <button
            onClick={() => setActiveTab('about')}
            className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to About Us
          </button>

          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 font-mono bg-indigo-50 border border-indigo-100 px-3 py-1 rounded">THE PEOPLE BEHIND THE FLEET</span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mt-4">Our Operational Team</h1>
            <p className="mt-4 text-sm md:text-base text-slate-500 leading-relaxed">
              Logistics is more than vehicles—it is about the experienced, vetted professionals ensuring your mission remains completely secure, responsive, and seamless from departure to return.
            </p>
          </div>
        </div>

        {/* Team Grid */}
        <div className="space-y-8">
          {TEAM_MEMBERS.map((member, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              key={idx}
              className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center"
            >
              {/* Profile Image */}
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden shrink-0 border-2 border-slate-100 bg-slate-50 relative">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
                  {member.icon}
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{member.name}</h3>
                  <p className="text-sm font-semibold text-indigo-600 mt-1">{member.role}</p>
                </div>
                
                <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                  {truncateBio(member.bio, 120)}
                </p>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2 pt-2">
                    {member.skills.slice(0, 2).map((skill: string, sIdx: number) => (
                      <span 
                        key={sIdx}
                        className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg border border-slate-200 text-xs font-mono font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 2 && (
                      <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg border border-slate-200 text-xs font-mono font-medium">
                        +{member.skills.length - 2} more
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <button 
                      onClick={() => setSelectedMember(member)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      View Full Details &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal for Member Details */}
        <AnimatePresence>
          {selectedMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto w-full h-full">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setSelectedMember(null)}
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10 font-sans border border-slate-200"
              >
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer z-20"
                >
                  <X size={20} />
                </button>

                <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8">
                  {/* Modal Image */}
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden shrink-0 border-2 border-slate-100 bg-slate-50 relative mt-2 md:mt-0">
                    <img 
                      src={selectedMember.image} 
                      alt={selectedMember.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
                      {selectedMember.icon}
                    </div>
                  </div>

                  {/* Modal Details */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{selectedMember.name}</h2>
                      <p className="text-base font-semibold text-indigo-600 mt-1">{selectedMember.role}</p>
                      {selectedMember.dedicatedRole && (
                        <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                          <Briefcase size={18} className="shrink-0 mt-0.5 text-indigo-500" />
                          <p className="text-sm font-medium text-slate-700 leading-relaxed">
                            {selectedMember.dedicatedRole}
                          </p>
                        </div>
                      )}
                    </div>

                    <p className="text-slate-600 leading-relaxed text-[15px] md:text-base">
                      {selectedMember.bio}
                    </p>

                    {(selectedMember.phone || selectedMember.email || selectedMember.languages) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5">
                        {selectedMember.phone && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</span>
                            <div className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                              <Phone size={16} className="text-slate-400 shrink-0 mt-0.5" />
                              <span className="break-words">{selectedMember.phone}</span>
                            </div>
                          </div>
                        )}
                        {selectedMember.email && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</span>
                            <div className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                              <Mail size={16} className="text-slate-400 shrink-0 mt-0.5" />
                              <span className="break-all">{selectedMember.email}</span>
                            </div>
                          </div>
                        )}
                        {selectedMember.languages && (
                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Languages</span>
                            <div className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                              <Globe size={16} className="text-slate-400 shrink-0 mt-0.5" />
                              <span>{selectedMember.languages}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Core Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.skills.map((skill: string, sIdx: number) => (
                          <span 
                            key={sIdx}
                            className="bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
