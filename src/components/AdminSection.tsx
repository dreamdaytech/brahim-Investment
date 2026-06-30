import React, { useState, useMemo } from 'react';
import { Inquiry } from '../types';
import { VEHICLES } from '../data';
import { Lock, FileText, CheckCircle, XCircle, Search, Sparkles, Filter, Database, TrendingUp, AlertCircle, ShieldEllipsis, ShieldCheck, LayoutDashboard, Users, Activity, CreditCard, LogOut, Menu, X, ChevronRight, BarChart3, PenTool, Trash2, Plus, User, Phone, Mail, MapPin, ArrowUpDown, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PerformanceSection } from './PerformanceSection';
import { CorporateBilling } from './CorporateBilling';
import { DashboardOverview } from './DashboardOverview';

interface AdminSectionProps {
  inquiries: Inquiry[];
  onUpdateStatus: (id: string, status: Inquiry['status']) => void;
  onDeleteInquiry: (id: string) => void;
  clients: any[];
  onAddClient: (client: any) => void;
  onUpdateClient: (id: string, client: any) => void;
  onDeleteClient: (id: string) => void;
}

export const AdminSection: React.FC<AdminSectionProps> = ({ inquiries, onUpdateStatus, onDeleteInquiry, clients, onAddClient, onUpdateClient, onDeleteClient }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  // Filtering & Searches States
  const [adminTab, setAdminTab] = useState<'overview' | 'reservations' | 'clients' | 'performance' | 'billing'>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  // #20 Global search state
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [showGlobalResults, setShowGlobalResults] = useState(false);

  React.useEffect(() => {
    import('../lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAuthenticated(!!session);
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    const { supabase } = await import('../lib/supabase');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
    }
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    const { supabase } = await import('../lib/supabase');
    await supabase.auth.signOut();
  };

  const filteredInquiries = inquiries.filter(item => {
    const matchesSearch = 
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.preferredVehicle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' ? true : item.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate quick admin totals
  const totalInquiries = inquiries.length;
  const approvedInquiries = inquiries.filter(i => i.status === 'Approved').length;
  const pendingInquiries = inquiries.filter(i => i.status === 'Pending').length;
  const totalReservedUnits = inquiries.reduce((acc, current) => acc + (current.status === 'Approved' ? current.vehiclesNeeded : 0), 0);

  // #20 Global search across inquiries
  const globalResults = globalSearch.trim().length > 1 ? inquiries.filter(i =>
    i.fullName.toLowerCase().includes(globalSearch.toLowerCase()) ||
    i.organization.toLowerCase().includes(globalSearch.toLowerCase()) ||
    i.preferredVehicle.toLowerCase().includes(globalSearch.toLowerCase()) ||
    i.email?.toLowerCase().includes(globalSearch.toLowerCase()) ||
    i.phone?.toLowerCase().includes(globalSearch.toLowerCase())
  ).slice(0, 8) : [];

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center space-y-4">
            <span className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Checking Security Clearance...</p>
          </div>
        </div>
      ) : !isAuthenticated ? (
        // LOCK SCREEN SIGN-IN GATES
        <div className="max-w-md mx-auto mt-20 mb-32 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center relative overflow-hidden">
          {/* Accent border */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>

          <div className="w-16 h-16 bg-[#0f172a] text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-sm">
            <Lock size={28} />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#855300] bg-amber-50 px-2 py-0.5 rounded uppercase">
              BIG GROUP SECURE PORT
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Staff Access Requested</h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              You are accessing the confidential dispatch log registry. Please sign in with your administrative credentials.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="mt-8 space-y-4">
            <div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin Email Address"
                className="w-full p-4 border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded-xl text-sm font-medium"
              />
            </div>
            <div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-4 border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded-xl text-sm font-medium"
              />
            </div>

            {authError && (
              <p className="text-[11px] text-red-650 font-medium font-sans flex items-center justify-center gap-1.5 bg-red-50 p-2 rounded-lg">
                <AlertCircle size={13} />
                <span>{authError}</span>
              </p>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer flex justify-center items-center gap-2"
            >
              {isLoading ? 'Authenticating...' : 'Authorize Administrative Access'}
            </button>
          </form>
        </div>
      ) : (
        // MAIN ACTIVE ADMIN DASHBOARD WITH SIDEBAR
        <div className="flex min-h-screen bg-[#f8fafc] overflow-x-hidden" style={{ marginTop: '-40px' }}>

          {/* ===== SIDEBAR ===== */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-64 min-h-screen bg-[#0f172a] text-white flex flex-col fixed left-0 top-0 z-40 shadow-2xl overflow-y-auto"
              >
                {/* Sidebar Brand */}
                <div className="px-6 py-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                      <ShieldCheck size={18} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">BIG Group</p>
                      <p className="text-sm font-black text-white leading-tight">Ops Registry</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Secure Channel SL-5</span>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                  <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3 mb-3">Overview</p>
                  {[
                    { id: 'overview', label: 'Dashboard', icon: BarChart3, badge: null },
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = adminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setAdminTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'text-slate-400 hover:text-white hover:bg-white/8'
                        }`}
                      >
                        <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {isActive && <ChevronRight size={14} className="text-indigo-300" />}
                      </button>
                    );
                  })}

                  <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3 mt-5 mb-3">Operations</p>
                  {[
                    { id: 'reservations', label: 'Reservations', icon: LayoutDashboard, badge: pendingInquiries > 0 ? pendingInquiries : null },
                    { id: 'clients', label: 'Partners & Clients', icon: Users, badge: null },
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = adminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setAdminTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'text-slate-400 hover:text-white hover:bg-white/8'
                        }`}
                      >
                        <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full leading-none">{item.badge}</span>
                        )}
                        {isActive && <ChevronRight size={14} className="text-indigo-300" />}
                      </button>
                    );
                  })}

                  <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3 mt-5 mb-3">Fleet Intelligence</p>
                  {[
                    { id: 'performance', label: 'Performance & Telemetry', icon: Activity, badge: null },
                    { id: 'billing', label: 'Billing & CRM', icon: CreditCard, badge: null },
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = adminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setAdminTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'text-slate-400 hover:text-white hover:bg-white/8'
                        }`}
                      >
                        <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {isActive && <ChevronRight size={14} className="text-indigo-300" />}
                      </button>
                    );
                  })}
                </nav>

                {/* Sign Out Area */}
                <div className="px-4 py-4 border-t border-white/10">
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center border border-indigo-400/40">
                      <ShieldCheck size={14} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">Administrator</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">BIG Group Ops</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-rose-400 hover:bg-rose-500/10 rounded-xl text-sm font-semibold transition-all border border-rose-500/20 hover:border-rose-500/40"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* ===== MAIN CONTENT ===== */}
          <div className={`flex flex-col min-h-screen transition-[margin] duration-300 ease-in-out overflow-x-hidden ${sidebarOpen ? 'ml-64' : 'ml-0'} w-full`}>

            {/* Top Bar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
                <div>
                  <h1 className="text-lg font-black text-slate-900">
                    {adminTab === 'overview' && 'Dashboard Overview'}
                    {adminTab === 'reservations' && 'Dispatch Reservations'}
                    {adminTab === 'clients' && 'Partners & Clients'}
                    {adminTab === 'performance' && 'Performance & Telemetry'}
                    {adminTab === 'billing' && 'Billing & CRM'}
                  </h1>
                  <p className="text-xs text-slate-500 font-mono">11 Freetown Road, Wilberforce • Live Channel SL-5</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* #20 Global Search */}
                <div className="relative hidden md:block">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search reservations..."
                    value={globalSearch}
                    onChange={e => { setGlobalSearch(e.target.value); setShowGlobalResults(true); }}
                    onBlur={() => setTimeout(() => setShowGlobalResults(false), 200)}
                    onFocus={() => setShowGlobalResults(true)}
                    className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 w-56 transition-all focus:w-72"
                  />
                  {showGlobalResults && globalResults.length > 0 && (
                    <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                      {globalResults.map(r => (
                        <button key={r.id} onMouseDown={() => { setAdminTab('reservations'); setSearchTerm(r.fullName); setGlobalSearch(''); }}
                          className="w-full px-4 py-3 text-left hover:bg-indigo-50 border-b border-slate-100 last:border-0">
                          <div className="font-bold text-sm text-slate-900">{r.fullName}</div>
                          <div className="text-xs text-slate-500">{r.organization} • {r.status} • {r.preferredVehicle}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="hidden sm:flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  SECURE LIVE
                </span>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 p-6 md:p-8 space-y-6">

              {/* Tab Content */}
              {adminTab === 'overview' ? (
                <DashboardOverview />
              ) : adminTab === 'reservations' ? (
            <>
              {/* Filters & Searches Control Block */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                
                {/* Search Input bar */}
                <div className="relative w-full md:w-96">
                  <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by client, organization, preferred vehicle..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-gray-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-sm"
                  />
                </div>

                {/* Filter class buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 uppercase font-mono font-bold flex items-center gap-1">
                    <Filter size={12} /> Status:
                  </span>
                  {['All', 'Pending', 'Approved', 'Declined'].map((sts) => (
                    <button
                      key={sts}
                      onClick={() => setFilterStatus(sts)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterStatus === sts 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {sts}
                    </button>
                  ))}
                </div>

              </div>

              {/* Log Table Registry list */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h3 className="font-extrabold tracking-tight text-slate-955">Logged Inquiries Queue ({filteredInquiries.length})</h3>
                  <span className="text-[10px] text-slate-400 font-mono uppercase bg-white px-2.5 py-1 rounded border border-slate-200">DATABASE SYNC: ONLINE</span>
                </div>

                {filteredInquiries.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="text-slate-300 w-12 h-12 rounded-full flex items-center justify-center mx-auto bg-slate-50 border border-slate-200">
                      <Database size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700">No matching inquiries found</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Adjust search keys or submit a new quote via the Booking form.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredInquiries.map((item) => (
                      <div key={item.id} className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                        
                        {/* Left block Info description */}
                        <div className="space-y-3 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200">
                              {item.id}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">Submitted: {item.createdAt}</span>
                            
                            {/* Status chip */}
                            {item.status === 'Approved' && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                                <ShieldCheck size={11} className="text-emerald-500 animate-pulse" /> Approved
                              </span>
                            )}
                            {item.status === 'Pending' && (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                                Pending Screening
                              </span>
                            )}
                            {item.status === 'Declined' && (
                              <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                                Rejected
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
                            <div>
                              <p className="text-gray-400 font-mono text-[9px] uppercase">Client / Organization Contact</p>
                              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{item.fullName}</p>
                              <p className="text-gray-500 font-semibold">{item.organization}</p>
                              <p className="text-gray-500 font-mono text-[11px] mt-0.5">{item.email} &bull; {item.phone}</p>
                            </div>
                            
                            <div>
                              <p className="text-gray-400 font-mono text-[9px] uppercase">Renting Spec Logistics</p>
                              <p className="font-bold text-gray-800 text-sm mt-0.5">{item.preferredVehicle} ({item.vehiclesNeeded} Unit)</p>
                              <p className="text-gray-600 font-medium">Service Class: {item.serviceType}</p>
                              <p className="text-gray-400 font-mono text-[10px] mt-0.5">Route Range: {item.startDate} &rarr; {item.endDate}</p>
                              <p className="text-gray-400 font-mono text-[10px]">Pickup: {item.pickupLocation}</p>
                            </div>
                          </div>

                          {item.specialRequirementsDet && (
                            <div className="bg-slate-50 p-3 rounded-lg text-xs text-gray-600 border border-slate-200 font-sans leading-normal">
                              <strong>Vetting Checklist Remarks:</strong> {item.specialRequirementsDet}
                            </div>
                          )}
                        </div>

                        {/* Operational Action buttons */}
                        <div className="flex sm:flex-row gap-2 w-full lg:w-auto self-end lg:self-center shrink-0">
                          {item.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => onUpdateStatus(item.id, 'Approved')}
                                className="flex-1 lg:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase rounded-lg transition-colors cursor-pointer text-center"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => onUpdateStatus(item.id, 'Declined')}
                                className="flex-1 lg:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] uppercase rounded-lg transition-colors cursor-pointer text-center"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {/* #2 Approved → shortcut to open Dispatch tab */}
                          {item.status === 'Approved' && (
                            <button
                              onClick={() => {
                                // Store pending dispatch pre-fill hint
                                sessionStorage.setItem('pendingDispatchHint', JSON.stringify({
                                  clientName: item.fullName,
                                  organization: item.organization,
                                  startDate: item.startDate,
                                  endDate: item.endDate,
                                }));
                                setAdminTab('performance');
                                // Navigate to dispatch tab inside PerformanceSection
                                setTimeout(() => sessionStorage.setItem('adminActiveTab', 'dispatch'), 100);
                              }}
                              className="flex-1 lg:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] uppercase rounded-lg transition-colors cursor-pointer text-center flex items-center gap-1.5 justify-center"
                            >
                              <ChevronRight size={13} /> Log Dispatch
                            </button>
                          )}

                          {item.status !== 'Pending' && (
                            <button
                              onClick={() => onUpdateStatus(item.id, 'Pending')}
                              className="flex-1 lg:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] uppercase rounded-lg transition-colors cursor-pointer text-center border border-slate-200"
                            >
                              Reset
                            </button>
                          )}

                          <button
                            onClick={() => onDeleteInquiry(item.id)}
                            className="px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-center"
                            title="Delete permanently"
                          >
                            Delete
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : adminTab === 'clients' ? (
            <ClientsAdminView clients={clients} onAddClient={onAddClient} onUpdateClient={onUpdateClient} onDeleteClient={onDeleteClient} />
          ) : adminTab === 'performance' ? (
            <PerformanceSection clients={clients} />
          ) : adminTab === 'billing' ? (
            <CorporateBilling />
          ) : null}

            </main>
          </div>
        </div>
      )}

    </div>
  );
};

const ClientsAdminView: React.FC<{ clients: any[], onAddClient: (c: any) => void, onUpdateClient: (id: string, c: any) => void, onDeleteClient: (id: string) => void }> = ({ clients, onAddClient, onUpdateClient, onDeleteClient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Ongoing' | 'Completed' | 'Pending'>('All');
  const [filterPartner, setFilterPartner] = useState<'All' | 'Partner' | 'Non-Partner'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'contractEnd' | 'added'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const ongoingContracts = clients.filter(s => s.status === 'Ongoing' || (s.status !== 'Completed' && s.contractEndDate && s.contractEndDate >= new Date().toISOString().split('T')[0])).length;

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = [...clients];
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.shortCode?.toLowerCase().includes(q) ||
        c.contactPerson?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.contractRef?.toLowerCase().includes(q)
      );
    }
    // Filter status
    if (filterStatus !== 'All') {
      list = list.filter(c => {
        const s = c.status || 'Ongoing';
        if (filterStatus === 'Ongoing') return s === 'Ongoing' || s === 'Active';
        if (filterStatus === 'Completed') return s === 'Completed' || s === 'Inactive';
        return s === 'Pending';
      });
    }
    // Filter partner type
    if (filterPartner === 'Partner') list = list.filter(c => c.isPartner !== false);
    if (filterPartner === 'Non-Partner') list = list.filter(c => c.isPartner === false);
    // Sort
    list.sort((a, b) => {
      let va: string = '', vb: string = '';
      if (sortBy === 'name') { va = a.name || ''; vb = b.name || ''; }
      else if (sortBy === 'status') { va = a.status || ''; vb = b.status || ''; }
      else if (sortBy === 'contractEnd') { va = a.contractEndDate || '9999'; vb = b.contractEndDate || '9999'; }
      else if (sortBy === 'added') { va = a.createdAt || ''; vb = b.createdAt || ''; }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [clients, search, filterStatus, filterPartner, sortBy, sortDir]);

  const SortBtn = ({ col, label }: { col: typeof sortBy; label: string }) => (
    <button
      onClick={() => toggleSort(col)}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === col ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
    >
      {label}
      <ArrowUpDown size={11} className={sortBy === col ? 'text-indigo-200' : 'text-slate-400'} />
      {sortBy === col && <span className="text-[10px] font-mono">{sortDir === 'asc' ? '↑' : '↓'}</span>}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Partners & Clients', value: clients.length, color: 'indigo' },
          { label: 'Partner Projects', value: clients.filter(s => s.isPartner !== false).length, color: 'emerald' },
          { label: 'Non-Partner', value: clients.filter(s => s.isPartner === false).length, color: 'amber' },
          { label: 'Ongoing Projects', value: ongoingContracts, color: 'blue' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-white p-4 rounded-2xl border border-slate-200 shadow-sm`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <h3 className={`text-2xl font-black text-${color}-600 mt-1`}>{value}</h3>
          </div>
        ))}
      </div>

      {/* Search + Filters + Sort toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        {/* Row 1: Search + Add */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, contact, email, city, contract ref…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => { setEditingClient({}); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shrink-0 shadow-sm"
          >
            <Plus size={15} /> Add Project
          </button>
        </div>

        {/* Row 2: Filter chips */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={13} className="text-slate-400" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
          </div>
          {(['All', 'Ongoing', 'Pending', 'Completed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === s
                ? s === 'Ongoing' ? 'bg-emerald-600 text-white'
                  : s === 'Completed' ? 'bg-slate-500 text-white'
                  : s === 'Pending' ? 'bg-amber-500 text-white'
                  : 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {s === 'All' ? 'All Statuses' : s === 'Ongoing' ? '🟢 Ongoing' : s === 'Completed' ? '⚪ Completed' : '🟡 Pending'}
            </button>
          ))}

          <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-slate-400" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</span>
          </div>
          {(['All', 'Partner', 'Non-Partner'] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilterPartner(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterPartner === p
                ? p === 'Partner' ? 'bg-emerald-600 text-white'
                  : p === 'Non-Partner' ? 'bg-red-500 text-white'
                  : 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {p === 'All' ? 'All Types' : p === 'Partner' ? '✓ Partner' : '✗ Non-Partner'}
            </button>
          ))}
        </div>

        {/* Row 3: Sort controls + results count */}
        <div className="flex flex-wrap gap-2 items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <ArrowUpDown size={13} className="text-slate-400" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sort by</span>
            <SortBtn col="name" label="Name" />
            <SortBtn col="status" label="Status" />
            <SortBtn col="contractEnd" label="Contract End" />
            <SortBtn col="added" label="Date Added" />
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {filtered.length} of {clients.length} shown
          </span>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Search size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-bold text-sm">No results found</p>
          <p className="text-xs mt-1">Try adjusting your search or filters</p>
          <button onClick={() => { setSearch(''); setFilterStatus('All'); setFilterPartner('All'); }} className="mt-4 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(supplier => {
            const isExpiringSoon = supplier.contractEndDate && supplier.contractEndDate <= new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const isExpired = supplier.contractEndDate && supplier.contractEndDate < new Date().toISOString().split('T')[0];
            const isPartner = supplier.isPartner !== false;
            const engagementStatus = supplier.status === 'Completed' || supplier.status === 'Inactive' ? 'Completed' : supplier.status === 'Pending' ? 'Pending' : 'Ongoing';

            return (
              <div key={supplier.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all ${isExpired ? 'border-red-200' : isExpiringSoon ? 'border-amber-200' : 'border-slate-200'}`}>
                <div className={`px-5 py-4 flex items-center justify-between ${isPartner ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isPartner ? 'bg-indigo-600 text-white' : 'bg-slate-400 text-white'}`}>
                      {supplier.shortCode || supplier.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">{supplier.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPartner ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {isPartner ? '✓ Partner Project' : '✗ Non-Partner'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingClient(supplier); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><PenTool size={13} /></button>
                    <button onClick={() => { if (window.confirm(`Delete "${supplier.name}" permanently?`)) onDeleteClient(supplier.id); }} className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-2.5 text-xs">
                  {supplier.contactPerson && <div className="flex items-center gap-2 text-slate-600"><User size={11} className="text-slate-400 shrink-0" />{supplier.contactPerson}</div>}
                  {supplier.phone && <div className="flex items-center gap-2 text-slate-600"><Phone size={11} className="text-slate-400 shrink-0" />{supplier.phone}</div>}
                  {supplier.email && <div className="flex items-center gap-2 text-slate-600"><Mail size={11} className="text-slate-400 shrink-0" />{supplier.email}</div>}
                  {supplier.headOfficeAddress && <div className="flex items-center gap-2 text-slate-600"><MapPin size={11} className="text-slate-400 shrink-0" />{supplier.headOfficeAddress}{supplier.city ? `, ${supplier.city}` : ''}</div>}
                  {supplier.accountNumber && <div className="flex items-center gap-2 text-slate-600"><CreditCard size={11} className="text-slate-400 shrink-0" /><span className="font-mono">{supplier.accountNumber}</span></div>}
                  {supplier.contractRef && (
                    <div className="flex items-center gap-2">
                      <FileText size={11} className="text-slate-400 shrink-0" />
                      <span className="text-slate-600 font-mono">{supplier.contractRef}</span>
                      {supplier.contractEndDate && (
                        <span className={`ml-auto px-1.5 py-0.5 rounded font-bold text-[10px] ${isExpired ? 'bg-red-100 text-red-700' : isExpiringSoon ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {isExpired ? 'EXPIRED' : isExpiringSoon ? 'Expiring soon' : `Until ${supplier.contractEndDate}`}
                        </span>
                      )}
                    </div>
                  )}
                  {supplier.creditLimit && (
                    <div className="flex items-center gap-2 text-slate-600"><Activity size={11} className="text-slate-400 shrink-0" />Credit Limit: <span className="font-bold">Le {supplier.creditLimit.toLocaleString()}</span></div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      engagementStatus === 'Ongoing' ? 'bg-emerald-100 text-emerald-700' :
                      engagementStatus === 'Completed' ? 'bg-slate-100 text-slate-500' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {engagementStatus === 'Ongoing' ? '🟢 Ongoing' : engagementStatus === 'Completed' ? '⚪ Completed' : '🟡 Pending'}
                    </span>
                  </div>
                </div>
                {supplier.notes && (
                  <div className="px-5 py-3 border-t border-slate-100 text-[11px] text-slate-500 italic">{supplier.notes}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-lg font-black text-white">{editingClient?.id ? 'Edit Partner / Project' : 'Add Partner / Project'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingClient(null); }} className="text-indigo-200 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const g = (k: string) => (fd.get(k) as string) || undefined;
              const saved: any = {
                id: editingClient?.id || `client-${Date.now()}`,
                name: g('name') || '',
                shortCode: g('shortCode'),
                isPartner: fd.get('isPartner') === 'true',
                contactPerson: g('contactPerson'),
                phone: g('phone'),
                email: g('email'),
                website: g('website'),
                headOfficeAddress: g('headOfficeAddress'),
                city: g('city'),
                country: g('country'),
                accountNumber: g('accountNumber'),
                contractRef: g('contractRef'),
                contractStartDate: g('contractStartDate'),
                contractEndDate: g('contractEndDate'),
                creditLimit: fd.get('creditLimit') ? Number(fd.get('creditLimit')) : undefined,
                notes: g('notes'),
                status: fd.get('status') as string,
                createdAt: editingClient?.createdAt || new Date().toISOString(),
              };
              if (editingClient?.id) {
                onUpdateClient(saved.id, saved);
              } else {
                onAddClient(saved);
              }
              setIsModalOpen(false);
              setEditingClient(null);
            }} className="p-6 space-y-5">
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Project Name *</label>
                    <input name="name" required defaultValue={editingClient?.name} placeholder="e.g. NP" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Short Code</label>
                    <input name="shortCode" defaultValue={editingClient?.shortCode} placeholder="e.g. NP" maxLength={5} className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Partner Status *</label>
                    <select name="isPartner" defaultValue={editingClient?.isPartner !== undefined ? String(editingClient.isPartner) : 'true'} className="w-full p-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none">
                      <option value="true">✅ Partner Project (Approved)</option>
                      <option value="false">✗ Non-Partner / Ad-hoc</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Engagement Status *</label>
                    <select name="status" defaultValue={editingClient?.status || 'Ongoing'} className="w-full p-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none">
                      <option value="Ongoing">🟢 Ongoing</option>
                      <option value="Pending">🟡 Pending</option>
                      <option value="Completed">⚪ Completed</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Contact Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Contact Person</label>
                    <input name="contactPerson" defaultValue={editingClient?.contactPerson} placeholder="e.g. Alhaji Koroma" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Phone</label>
                    <input name="phone" defaultValue={editingClient?.phone} placeholder="+232 78 000 000" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
                    <input name="email" type="email" defaultValue={editingClient?.email} placeholder="accounts@supplier.com" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Website</label>
                    <input name="website" defaultValue={editingClient?.website} placeholder="https://" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Address</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Head Office Address</label>
                    <input name="headOfficeAddress" defaultValue={editingClient?.headOfficeAddress} placeholder="Street address" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">City</label>
                    <input name="city" defaultValue={editingClient?.city} placeholder="Freetown" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Country</label>
                    <input name="country" defaultValue={editingClient?.country || 'Sierra Leone'} className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Contract & Account</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Account Number</label>
                    <input name="accountNumber" defaultValue={editingClient?.accountNumber} placeholder="e.g. NP-BIG-001" className="w-full p-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Contract Reference</label>
                    <input name="contractRef" defaultValue={editingClient?.contractRef} placeholder="e.g. SLA/2024/NP/001" className="w-full p-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Contract Start</label>
                    <input name="contractStartDate" type="date" defaultValue={editingClient?.contractStartDate} className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Contract End</label>
                    <input name="contractEndDate" type="date" defaultValue={editingClient?.contractEndDate} className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Credit Limit (Le)</label>
                    <input name="creditLimit" type="number" defaultValue={editingClient?.creditLimit} placeholder="e.g. 50000000" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Notes / Remarks</label>
                <textarea name="notes" rows={3} defaultValue={editingClient?.notes} placeholder="Additional information..." className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingClient(null); }} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-sm">{editingClient?.id ? 'Save Changes' : 'Add Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
