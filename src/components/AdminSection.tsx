import React, { useState, useMemo } from 'react';
import { Inquiry } from '../types';
import { Lock, FileText, CheckCircle, XCircle, Search, Sparkles, Filter, Database, TrendingUp, AlertCircle, ShieldEllipsis, ShieldCheck, LayoutDashboard, Users, Activity, CreditCard, LogOut, Menu, X, ChevronRight, ChevronLeft, BarChart3, PenTool, Trash2, Plus, User, Phone, Mail, MapPin, ArrowUpDown, SlidersHorizontal, ChevronDown, Navigation, Fuel, Car, Settings, MoreVertical, Eye, Camera, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PerformanceSection } from './PerformanceSection';
import { CorporateBilling } from './CorporateBilling';
import { AdminProfile } from './AdminProfile';
import { DashboardOverview } from './DashboardOverview';
import { AccessControlView } from './AccessControlView';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminSectionProps {
  // SECURITY: inquiries and clients are now fetched internally behind authentication
  // Only team member management is passed from App (used by public /team page too)
  teamMembers?: any[];
  onAddTeamMember?: (member: any) => void;
  onUpdateTeamMember?: (id: string, member: any) => void;
  onDeleteTeamMember?: (id: string) => void;
}

export const AdminSection: React.FC<AdminSectionProps> = ({ teamMembers = [], onAddTeamMember, onUpdateTeamMember, onDeleteTeamMember }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // SECURITY: Admin-only data fetched here, behind authentication
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [adminTeamMembers, setAdminTeamMembers] = useState<any[]>([]);
  
  // Filtering & Searches States
  const [adminTab, setAdminTab] = useState<'overview' | 'reservations' | 'clients' | 'performance' | 'dispatch_management' | 'drivers' | 'vehicles' | 'fuel' | 'billing' | 'profile' | 'access'>('overview');
  const [userRole, setUserRole] = useState<string>('super_admin');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  // #20 Global search state
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [showGlobalResults, setShowGlobalResults] = useState(false);

    React.useEffect(() => {
    import('../lib/supabase').then(({ supabase }) => {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: roleData } = await supabase.from('user_roles').select('role, is_active').eq('id', session.user.id).single();
          if (roleData) {
            if (!roleData.is_active) {
              await supabase.auth.signOut();
              setAuthError('Your account has been suspended. Please contact your administrator.');
              setIsAuthenticated(false);
            } else {
              setUserRole(roleData.role);
              setIsAuthenticated(true);
            }
          } else {
            // No role row found — deny access completely (security hardening)
            await supabase.auth.signOut();
            setAuthError('Access denied. Your account has not been provisioned with platform access. Please contact the administrator.');
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      };
      
      checkAuth();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        checkAuth();
      });

      return () => subscription.unsubscribe();
    });

    const handleOpenProfile = () => setAdminTab('profile');
    const handleOpenOverview = () => setAdminTab('overview');
    window.addEventListener('open-admin-profile', handleOpenProfile);
    window.addEventListener('open-admin-overview', handleOpenOverview);
    return () => {
      window.removeEventListener('open-admin-profile', handleOpenProfile);
      window.removeEventListener('open-admin-overview', handleOpenOverview);
    };
  }, []);

  // Fetch admin-only data after authentication (CRIT-1 fix)
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const mapInquiryFromDB = (dbItem) => ({
      id: dbItem.id,
      fullName: dbItem.fullname || dbItem.fullName,
      organization: dbItem.organization,
      email: dbItem.email,
      phone: dbItem.phone,
      serviceType: dbItem.servicetype || dbItem.serviceType,
      startDate: dbItem.startdate || dbItem.startDate,
      endDate: dbItem.enddate || dbItem.endDate,
      preferredVehicle: dbItem.preferredvehicle || dbItem.preferredVehicle,
      vehiclesNeeded: dbItem.vehiclesneeded || dbItem.vehiclesNeeded,
      pickupLocation: dbItem.pickuplocation || dbItem.pickupLocation,
      dropoffLocation: dbItem.dropofflocation || dbItem.dropoffLocation,
      specialRequirementsDet: dbItem.specialrequirementsdet || dbItem.specialRequirementsDet,
      status: dbItem.status,
      createdAt: dbItem.createdat || dbItem.createdAt
    });

    const mapClientFromDB = (dbItem: any) => ({
      id: dbItem.id,
      name: dbItem.name,
      service: dbItem.service,
      logoUrl: dbItem.logo_url || dbItem.logoUrl || dbItem.logourl,
      shortCode: dbItem.short_code || dbItem.shortCode,
      isPartner: dbItem.is_partner !== undefined ? dbItem.is_partner : dbItem.isPartner,
      contactPerson: dbItem.contact_person || dbItem.contactPerson,
      phone: dbItem.phone,
      email: dbItem.email,
      website: dbItem.website,
      headOfficeAddress: dbItem.head_office_address || dbItem.headOfficeAddress,
      city: dbItem.city,
      country: dbItem.country,
      accountNumber: dbItem.account_number || dbItem.accountNumber,
      contractRef: dbItem.contract_ref || dbItem.contractRef,
      contractStartDate: dbItem.contract_start_date || dbItem.contractStartDate,
      contractEndDate: dbItem.contract_end_date || dbItem.contractEndDate,
      creditLimit: dbItem.credit_limit || dbItem.creditLimit,
      notes: dbItem.notes,
      status: dbItem.status,
      createdAt: dbItem.created_at || dbItem.createdAt
    });

    const mapTeamFromDB = (m: any) => ({
      id: m.id, name: m.name, role: m.role, bio: m.bio,
      dedicatedRole: m.dedicated_role, languages: m.languages,
      phone: m.phone, email: m.email,
      skills: m.skills || [],
      imageUrl: m.image_url, displayOrder: m.display_order, isActive: m.is_active
    });

    const fetchAdminData = async () => {
      const { data: inqData } = await supabase.from('inquiries').select('*');
      if (inqData) setInquiries(inqData.map(mapInquiryFromDB));
      const { data: clientsData } = await supabase.from('clients').select('*');
      if (clientsData) setClients(clientsData.map(mapClientFromDB));
      const { data: teamData } = await supabase.from('team_members').select('*').order('display_order', { ascending: true });
      if (teamData) setAdminTeamMembers(teamData.map(mapTeamFromDB));
    };
    fetchAdminData();

    const inqCh = supabase.channel('admin:inq').on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, async () => {
      const { data } = await supabase.from('inquiries').select('*');
      if (data) setInquiries(data.map(mapInquiryFromDB));
    }).subscribe();
    const cliCh = supabase.channel('admin:cli').on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, async () => {
      const { data } = await supabase.from('clients').select('*');
      if (data) setClients(data.map(mapClientFromDB));
    }).subscribe();
    const teamCh = supabase.channel('admin:team').on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, async () => {
      const { data } = await supabase.from('team_members').select('*').order('display_order', { ascending: true });
      if (data) setAdminTeamMembers(data.map(mapTeamFromDB));
    }).subscribe();
    return () => { supabase.removeChannel(inqCh); supabase.removeChannel(cliCh); supabase.removeChannel(teamCh); };
  }, [isAuthenticated]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    const { supabase: sb } = await import('../lib/supabase');
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    const { supabase: sb } = await import('../lib/supabase');
    await sb.auth.signOut();
    // CRIT-2: Clear all sensitive cached data from localStorage on sign-out
    localStorage.removeItem('big_group_inquiries_cache');
    localStorage.removeItem('big_group_clients_cache');
    localStorage.removeItem('big_group_team_cache');
    setInquiries([]);
    setClients([]);
  };

  const onUpdateStatus = async (id: string, status: any) => { await supabase.from('inquiries').update({ status }).eq('id', id); };
  const onDeleteInquiry = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this inquiry?"))
      await supabase.from('inquiries').delete().eq('id', id);
  };
  const onAddClient = async (newClient: any) => { 
    const { error } = await supabase.from('clients').insert([newClient]); 
    if (error) { console.error('Add Client Error:', error); throw error; }
  };
  const onUpdateClient = async (id: string, updateData: any) => { 
    const { error } = await supabase.from('clients').update(updateData).eq('id', id); 
    if (error) { console.error('Update Client Error:', error); throw error; }
  };
  const onDeleteClient = async (id: string) => { 
    const { error } = await supabase.from('clients').delete().eq('id', id); 
    if (error) { console.error('Delete Client Error:', error); throw error; }
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
    <div className="w-full bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-950">
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center space-y-4">
            <span className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></span>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Checking Security Clearance...</p>
          </div>
        </div>
      ) : !isAuthenticated ? (
        // LOCK SCREEN SIGN-IN GATES
        <div className="max-w-md mx-auto mt-20 mb-32 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center relative overflow-hidden">
          {/* Accent border */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>

          <div className="w-16 h-16 bg-[#0f172a] text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-sm">
            <Lock size={28} />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#855300] bg-amber-50 px-2 py-0.5 rounded uppercase">
              BIG SECURE PORT
            </span>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-1">Staff Access Requested</h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
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
                className="w-full p-4 border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none rounded-xl text-sm font-medium"
              />
            </div>
            <div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-4 border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none rounded-xl text-sm font-medium"
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
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer flex justify-center items-center gap-2"
            >
              {isLoading ? 'Authenticating...' : 'Authorize Administrative Access'}
            </button>
          </form>
        </div>
      ) : (
        // MAIN ACTIVE ADMIN DASHBOARD WITH SIDEBAR
        <div className="flex min-h-screen bg-[#f8fafc] overflow-x-hidden" style={{ marginTop: '-40px' }}>

          {/* ===== SIDEBAR ===== */}
          <aside
            className={`h-screen bg-[#0f172a] text-white flex flex-col fixed left-0 top-0 z-40 shadow-2xl overflow-x-hidden transition-[width] duration-300 ease-in-out ${
              sidebarOpen ? 'w-64' : 'w-[72px]'
            }`}
          >
            {/* Sidebar Brand */}
            <div className={`border-b border-white/10 transition-all duration-300 ${sidebarOpen ? 'px-6 py-6' : 'px-3 py-5'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="text-blue-400" />
                </div>
                {sidebarOpen && (
                  <div className="overflow-hidden">
                    <p className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest whitespace-nowrap">BIG</p>
                    <p className="text-sm font-black text-white leading-tight whitespace-nowrap">Ops Registry</p>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider whitespace-nowrap">Secure Channel SL-5</span>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <nav className={`flex-1 overflow-y-auto py-4 space-y-1 transition-all duration-300 ${sidebarOpen ? 'px-3' : 'px-2'} custom-scrollbar`}>
              {sidebarOpen && <p className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest px-3 mb-3">Overview</p>}
              {[
                { id: 'overview', label: 'Dashboard', icon: BarChart3, badge: null },
              ].filter((item: any) => !item.roles || item.roles.includes(userRole)).map(item => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    title={!sidebarOpen ? item.label : undefined}
                    onClick={() => setAdminTab(item.id as any)}
                    className={`w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all group ${
                      sidebarOpen ? 'px-3 py-2.5' : 'p-2.5 justify-center'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-500 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    <Icon size={16} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    {sidebarOpen && <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>}
                    {sidebarOpen && isActive && <ChevronRight size={14} className="text-blue-300" />}
                  </button>
                );
              })}

              {sidebarOpen
                ? <p className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest px-3 mt-5 mb-3">Operations</p>
                : <div className="h-px bg-white/10 my-3 mx-1" />
              }
              {[
                { id: 'clients', label: 'Partners & Clients', icon: Users, badge: null, roles: ['super_admin', 'admin', 'fleet_manager'] },
                { id: 'team', label: 'Operational Team', icon: Users, badge: null, roles: ['super_admin', 'admin', 'fleet_manager'] },
              ].filter((item: any) => !item.roles || item.roles.includes(userRole)).map(item => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    title={!sidebarOpen ? item.label : undefined}
                    onClick={() => setAdminTab(item.id as any)}
                    className={`w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all group relative ${
                      sidebarOpen ? 'px-3 py-2.5' : 'p-2.5 justify-center'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-500 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    <Icon size={16} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    {sidebarOpen && <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>}
                    {sidebarOpen && isActive && <ChevronRight size={14} className="text-blue-300" />}
                  </button>
                );
              })}

              {sidebarOpen
                ? <p className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest px-3 mt-5 mb-3">Fleet Intelligence</p>
                : <div className="h-px bg-white/10 my-3 mx-1" />
              }
              {[
                { id: 'reservations', label: 'Reservations', icon: LayoutDashboard, badge: pendingInquiries > 0 ? pendingInquiries : null, roles: ['super_admin', 'admin', 'fleet_manager', 'finance'] },
                { id: 'performance', label: 'Management', icon: Activity, badge: null, roles: ['super_admin', 'admin', 'fleet_manager', 'finance', 'maintenance_logs'] },
                { id: 'dispatch_management', label: 'Dispatch', icon: Navigation, badge: null, roles: ['super_admin', 'admin', 'fleet_manager'] },
                { id: 'drivers', label: 'Drivers', icon: User, badge: null, roles: ['super_admin', 'admin', 'fleet_manager'] },
                { id: 'vehicles', label: 'Vehicles', icon: Car, badge: null, roles: ['super_admin', 'admin', 'fleet_manager', 'maintenance_logs'] },
                { id: 'fuel', label: 'Fuel', icon: Fuel, badge: null, roles: ['super_admin', 'admin', 'fleet_manager'] },
                { id: 'billing', label: 'Billing & CRM', icon: CreditCard, badge: null, roles: ['super_admin', 'admin', 'finance'] },
              ].filter((item: any) => !item.roles || item.roles.includes(userRole)).map(item => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    title={!sidebarOpen ? item.label : undefined}
                    onClick={() => setAdminTab(item.id as any)}
                    className={`w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all group relative ${
                      sidebarOpen ? 'px-3 py-2.5' : 'p-2.5 justify-center'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-500 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    <Icon size={16} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    {sidebarOpen && <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>}
                    {sidebarOpen && item.badge && (
                      <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full leading-none">{item.badge}</span>
                    )}
                    {!sidebarOpen && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
                    )}
                    {sidebarOpen && isActive && <ChevronRight size={14} className="text-blue-300" />}
                  </button>
                );
              })}

              {sidebarOpen
                ? <p className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-widest px-3 mt-5 mb-3">Admin Controls</p>
                : <div className="h-px bg-white/10 my-3 mx-1" />
              }
              {[
                { id: 'profile', label: 'Profile & Security', icon: Settings, badge: null, roles: ['super_admin', 'admin', 'fleet_manager', 'finance', 'maintenance_logs'] },
                { id: 'access', label: 'Access Control', icon: ShieldCheck, badge: null, roles: ['super_admin'] }
              ].filter((item: any) => !item.roles || item.roles.includes(userRole)).map(item => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    title={!sidebarOpen ? item.label : undefined}
                    onClick={() => setAdminTab(item.id as any)}
                    className={`w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all group relative ${
                      sidebarOpen ? 'px-3 py-2.5' : 'p-2.5 justify-center'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-500 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    <Icon size={16} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    {sidebarOpen && <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>}
                    {sidebarOpen && isActive && <ChevronRight size={14} className="text-blue-300" />}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Actions Area */}
            <div className={`border-t border-white/10 transition-all duration-300 ${sidebarOpen ? 'px-4 py-4' : 'px-2 py-3'}`}>
              
              {/* Collapse / Expand Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`w-full flex items-center gap-2 mt-2 text-slate-600 hover:text-slate-400 hover:bg-white/8 rounded-xl text-xs font-semibold transition-all ${
                  sidebarOpen ? 'px-3 py-2 justify-start' : 'p-2.5 justify-center'
                }`}
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? (
                  <><ChevronLeft size={15} /><span>Collapse</span></>
                ) : (
                  <ChevronRight size={15} />
                )}
              </button>
            </div>
          </aside>

          {/* ===== MAIN CONTENT ===== */}
          <div className={`flex flex-col min-h-screen transition-[margin] duration-300 ease-in-out overflow-x-hidden ${sidebarOpen ? 'ml-64' : 'ml-[72px]'} w-full`}>

            {/* Top Bar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                  title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
                </button>
                <div>
                  <h1 className="text-lg font-black text-slate-950">
                    {adminTab === 'overview' && 'Dashboard Overview'}
                    {adminTab === 'reservations' && 'Dispatch Reservations'}
                    {adminTab === 'clients' && 'Partners & Clients'}
                    {adminTab === 'team' && 'Operational Team'}
                    {adminTab === 'performance' && 'Management'}
                    {adminTab === 'billing' && 'Billing & CRM'}
                  </h1>
                  <p className="text-xs text-slate-600 font-mono">3 Massalay Drive Juba Formerly Johnny Paul Drive • Live Channel SL-5</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* #20 Global Search */}
                <div className="relative hidden md:block">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search reservations..."
                    value={globalSearch}
                    onChange={e => { setGlobalSearch(e.target.value); setShowGlobalResults(true); }}
                    onBlur={() => setTimeout(() => setShowGlobalResults(false), 200)}
                    onFocus={() => setShowGlobalResults(true)}
                    className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 w-56 transition-all focus:w-72"
                  />
                  {showGlobalResults && globalResults.length > 0 && (
                    <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                      {globalResults.map(r => (
                        <button key={r.id} onMouseDown={() => { setAdminTab('reservations'); setSearchTerm(r.fullName); setGlobalSearch(''); }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-slate-100 last:border-0">
                          <div className="font-bold text-sm text-slate-950">{r.fullName}</div>
                          <div className="text-xs text-slate-600">{r.organization} • {r.status} • {r.preferredVehicle}</div>
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
                  <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by client, organization, preferred vehicle..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
                  />
                </div>

                {/* Filter class buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 uppercase font-mono font-bold flex items-center gap-1">
                    <Filter size={12} /> Status:
                  </span>
                  {['All', 'Pending', 'Approved', 'Declined'].map((sts) => (
                    <button
                      key={sts}
                      onClick={() => setFilterStatus(sts)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterStatus === sts 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
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
                  <h3 className="font-extrabold tracking-tight text-slate-950">Logged Inquiries Queue ({filteredInquiries.length})</h3>
                  <span className="text-[10px] text-slate-500 font-mono uppercase bg-white px-2.5 py-1 rounded border border-slate-200">DATABASE SYNC: ONLINE</span>
                </div>

                {filteredInquiries.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="text-slate-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto bg-slate-50 border border-slate-200">
                      <Database size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700">No matching inquiries found</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">Adjust search keys or submit a new quote via the Booking form.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredInquiries.map((item) => (
                      <div key={item.id} className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                        
                        {/* Left block Info description */}
                        <div className="space-y-3 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded border border-slate-200">
                              {item.id}
                            </span>
                            <span className="text-xs text-slate-600 font-medium">Submitted: {item.createdAt}</span>
                            
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm mt-2">
                            <div>
                              <p className="text-slate-600 font-bold text-[11px] uppercase tracking-wider">Client / Organization Contact</p>
                              <p className="font-black text-slate-950 text-base mt-1">{item.fullName}</p>
                              <p className="text-slate-700 font-bold">{item.organization}</p>
                              <p className="text-slate-700 font-medium text-xs mt-1">{item.email} &bull; {item.phone}</p>
                            </div>
                            
                            <div>
                              <p className="text-slate-600 font-bold text-[11px] uppercase tracking-wider">Renting Spec Logistics</p>
                              <p className="font-black text-slate-950 text-base mt-1">{item.preferredVehicle} ({item.vehiclesNeeded} Unit)</p>
                              <p className="text-slate-700 font-bold">Service Class: {item.serviceType}</p>
                              <p className="text-slate-700 font-medium text-xs mt-1">Route Range: {item.startDate} &rarr; {item.endDate}</p>
                              <p className="text-slate-700 font-medium text-xs">Pickup: {item.pickupLocation}</p>
                            </div>
                          </div>

                          {item.specialRequirementsDet && (
                            <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 border border-slate-200 font-sans leading-relaxed mt-2">
                              <strong className="text-slate-950 block mb-1">Vetting Checklist Remarks:</strong> {item.specialRequirementsDet}
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
                              className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase rounded-lg transition-colors cursor-pointer text-center flex items-center gap-1.5 justify-center"
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
                            onClick={() => {
                              if (window.confirm('Delete this inquiry permanently?')) onDeleteInquiry(item.id);
                            }}
                            className="px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-center"
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
          ) : adminTab === 'team' ? (
            <TeamAdminView
              teamMembers={adminTeamMembers}
              onAdd={onAddTeamMember || (() => {})}
              onUpdate={onUpdateTeamMember || (() => {})}
              onDelete={onDeleteTeamMember || (() => {})}
            />
          ) : adminTab === 'performance' ? (
            <PerformanceSection clients={clients} userRole={userRole} defaultTab={userRole === 'maintenance_logs' ? 'maintenance' : undefined} />
          ) : adminTab === 'dispatch_management' ? (
            <PerformanceSection clients={clients} userRole={userRole} defaultTab="dispatch" />
          ) : adminTab === 'drivers' ? (
            <PerformanceSection clients={clients} userRole={userRole} defaultTab="drivers" />
          ) : adminTab === 'vehicles' ? (
            <PerformanceSection clients={clients} userRole={userRole} defaultTab="vehicles" />
          ) : adminTab === 'fuel' ? (
            <PerformanceSection clients={clients} userRole={userRole} defaultTab="fuel" />
          ) : adminTab === 'billing' ? (
            <CorporateBilling />
          ) : adminTab === 'access' ? (
            <AccessControlView currentUserRole={userRole} />
          ) : adminTab === 'profile' ? (
            <div className="p-4 sm:p-6 lg:p-8">
              <AdminProfile currentUserRole={userRole} />
            </div>
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
  const [isViewing, setIsViewing] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [clientToDelete, setClientToDelete] = useState<any | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editingClient) {
      setLogoPreview(editingClient.logoUrl || '');
      setLogoFile(null);
    }
  }, [editingClient]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Ongoing' | 'Completed' | 'Pending'>('All');
  const [filterPartner, setFilterPartner] = useState<'All' | 'Partner' | 'Non-Partner'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'contractEnd' | 'added'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === col ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
    >
      {label}
      <ArrowUpDown size={11} className={sortBy === col ? 'text-blue-200' : 'text-slate-500'} />
      {sortBy === col && <span className="text-[10px] font-mono">{sortDir === 'asc' ? '↑' : '↓'}</span>}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Partners & Clients', value: clients.length, color: 'blue' },
          { label: 'Partner Projects', value: clients.filter(s => s.isPartner !== false).length, color: 'emerald' },
          { label: 'Non-Partner', value: clients.filter(s => s.isPartner === false).length, color: 'amber' },
          { label: 'Ongoing Projects', value: ongoingContracts, color: 'blue' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-white p-4 rounded-2xl border border-slate-200 shadow-sm`}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
            <h3 className={`text-2xl font-black text-${color}-600 mt-1`}>{value}</h3>
          </div>
        ))}
      </div>

      {/* Search + Filters + Sort toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        {/* Row 1: Search + Add */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, contact, email, city, contract ref…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                const headers = ['Name', 'Short Code', 'Partner Status', 'Contact Person', 'Phone', 'Email', 'City', 'Contract Start', 'Contract End', 'Status'];
                const rows = filtered.map(c => [
                  c.name, c.shortCode || '-', c.isPartner ? 'Partner' : 'Non-Partner', c.contactPerson || '-', c.phone || '-', c.email || '-', c.city || '-', c.contractStartDate || '-', c.contractEndDate || '-', c.status || 'Ongoing'
                ]);
                const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url;
                a.download = `partners-clients-${new Date().toISOString().split('T')[0]}.csv`;
                a.click(); URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors shadow-sm"
              title="Export to CSV"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            <button
              onClick={() => {
                const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
                const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                doc.setFontSize(16); doc.setTextColor(30, 30, 90);
                doc.text(`BIG - Partners & Clients`, 14, 16);
                doc.setFontSize(9); doc.setTextColor(100, 100, 120);
                doc.text(`Generated on: ${today}`, 14, 22);

                const headers = ['Name', 'Short Code', 'Type', 'Contact', 'Phone', 'Email', 'City', 'Start', 'End', 'Status'];
                const rows = filtered.map(c => [
                  c.name, c.shortCode || '-', c.isPartner ? 'Partner' : 'Non-Partner', c.contactPerson || '-', c.phone || '-', c.email || '-', c.city || '-', c.contractStartDate || '-', c.contractEndDate || '-', c.status || 'Ongoing'
                ]);

                autoTable(doc, {
                  head: [headers],
                  body: rows,
                  startY: 28,
                  styles: { fontSize: 8, cellPadding: 2 },
                  headStyles: { fillColor: [79, 70, 229], textColor: 255 },
                  alternateRowStyles: { fillColor: [248, 250, 252] },
                });

                doc.save(`partners-clients-${new Date().toISOString().split('T')[0]}.pdf`);
              }}
              className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors shadow-sm"
              title="Export to PDF"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </button>
            <button
              onClick={() => { setIsViewing(false); setEditingClient({}); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
            >
              <Plus size={15} /> Add Project
            </button>
          </div>
        </div>

        {/* Row 2: Filter chips */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={13} className="text-slate-500" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
          </div>
          {(['All', 'Ongoing', 'Pending', 'Completed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === s
                ? s === 'Ongoing' ? 'bg-emerald-600 text-white'
                  : s === 'Completed' ? 'bg-slate-500 text-white'
                  : s === 'Pending' ? 'bg-amber-500 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {s === 'All' ? 'All Statuses' : s === 'Ongoing' ? '🟢 Ongoing' : s === 'Completed' ? '⚪ Completed' : '🟡 Pending'}
            </button>
          ))}

          <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-slate-500" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</span>
          </div>
          {(['All', 'Partner', 'Non-Partner'] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilterPartner(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterPartner === p
                ? p === 'Partner' ? 'bg-emerald-600 text-white'
                  : p === 'Non-Partner' ? 'bg-red-500 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {p === 'All' ? 'All Types' : p === 'Partner' ? '✓ Partner' : '✗ Non-Partner'}
            </button>
          ))}
        </div>

        {/* Row 3: Sort controls + results count */}
        <div className="flex flex-wrap gap-2 items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <ArrowUpDown size={13} className="text-slate-500" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sort by</span>
            <SortBtn col="name" label="Name" />
            <SortBtn col="status" label="Status" />
            <SortBtn col="contractEnd" label="Contract End" />
            <SortBtn col="added" label="Date Added" />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filtered.length} of {clients.length} shown
          </span>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Search size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-bold text-sm">No results found</p>
          <p className="text-xs mt-1">Try adjusting your search or filters</p>
          <button onClick={() => { setSearch(''); setFilterStatus('All'); setFilterPartner('All'); }} className="mt-4 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(supplier => {
            const isExpiringSoon = supplier.contractEndDate && supplier.contractEndDate <= new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const isExpired = supplier.contractEndDate && supplier.contractEndDate < new Date().toISOString().split('T')[0];
            const isPartner = supplier.isPartner !== false;
            const engagementStatus = supplier.status === 'Completed' || supplier.status === 'Inactive' ? 'Completed' : supplier.status === 'Pending' ? 'Pending' : 'Ongoing';

            return (
              <div key={supplier.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${isExpired ? 'border-red-200' : isExpiringSoon ? 'border-amber-200' : 'border-slate-200'}`}>
                <div className={`px-5 py-4 flex items-center justify-between rounded-t-2xl ${isPartner ? 'bg-blue-50' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    {supplier.logoUrl ? (
                      <img src={supplier.logoUrl} alt={supplier.name} className="w-10 h-10 rounded-xl object-cover bg-white border border-slate-200" />
                    ) : (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isPartner ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'}`}>
                        {supplier.shortCode || supplier.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-black text-slate-950">{supplier.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPartner ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {isPartner ? '✓ Partner Project' : '✗ Non-Partner'}
                      </span>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center pr-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === supplier.id ? null : supplier.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === supplier.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}></div>
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 py-1.5 z-50 overflow-hidden">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setEditingClient(supplier); setIsViewing(true); setIsModalOpen(true); }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Eye size={13} /> View
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setEditingClient(supplier); setIsViewing(false); setIsModalOpen(true); }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <PenTool size={13} /> Edit
                          </button>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation();
                              setOpenMenuId(null);
                              setClientToDelete(supplier);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="px-5 py-4 space-y-2.5 text-xs">
                  {supplier.contactPerson && <div className="flex items-center gap-2 text-slate-700"><User size={11} className="text-slate-500 shrink-0" />{supplier.contactPerson}</div>}
                  {supplier.phone && <div className="flex items-center gap-2 text-slate-700"><Phone size={11} className="text-slate-500 shrink-0" />{supplier.phone}</div>}
                  {supplier.email && <div className="flex items-center gap-2 text-slate-700"><Mail size={11} className="text-slate-500 shrink-0" />{supplier.email}</div>}
                  {supplier.headOfficeAddress && <div className="flex items-center gap-2 text-slate-700"><MapPin size={11} className="text-slate-500 shrink-0" />{supplier.headOfficeAddress}{supplier.city ? `, ${supplier.city}` : ''}</div>}
                  {supplier.accountNumber && <div className="flex items-center gap-2 text-slate-700"><CreditCard size={11} className="text-slate-500 shrink-0" /><span className="font-mono">{supplier.accountNumber}</span></div>}
                  {supplier.contractRef && (
                    <div className="flex items-center gap-2">
                      <FileText size={11} className="text-slate-500 shrink-0" />
                      <span className="text-slate-700 font-mono">{supplier.contractRef}</span>
                      {supplier.contractEndDate && (
                        <span className={`ml-auto px-1.5 py-0.5 rounded font-bold text-[10px] ${isExpired ? 'bg-red-100 text-red-700' : isExpiringSoon ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {isExpired ? 'EXPIRED' : isExpiringSoon ? 'Expiring soon' : `Until ${supplier.contractEndDate}`}
                        </span>
                      )}
                    </div>
                  )}
                  {supplier.creditLimit && (
                    <div className="flex items-center gap-2 text-slate-700"><Activity size={11} className="text-slate-500 shrink-0" />Credit Limit: <span className="font-bold">Le {supplier.creditLimit.toLocaleString()}</span></div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      engagementStatus === 'Ongoing' ? 'bg-emerald-100 text-emerald-700' :
                      engagementStatus === 'Completed' ? 'bg-slate-100 text-slate-600' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {engagementStatus === 'Ongoing' ? '🟢 Ongoing' : engagementStatus === 'Completed' ? '⚪ Completed' : '🟡 Pending'}
                    </span>
                  </div>
                </div>
                {supplier.notes && (
                  <div className="px-5 py-3 border-t border-slate-100 text-[11px] text-slate-600 italic">{supplier.notes}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-blue-600 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-lg font-black text-white">{isViewing ? 'View Partner / Project' : editingClient?.id ? 'Edit Partner / Project' : 'Add Partner / Project'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingClient(null); }} className="text-blue-200 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={async e => {
              e.preventDefault();
              setIsSubmitting(true);
              const fd = new FormData(e.currentTarget);
              const g = (k: string) => (fd.get(k) as string) || undefined;
              
              // Start with the existing saved logo URL (not the blob preview)
              let finalLogoUrl: string | undefined = editingClient?.logoUrl || undefined;

              if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `client_logo_${Date.now()}.${fileExt}`;
                const filePath = `logos/${fileName}`;
                try {
                  const { error: uploadError } = await supabase.storage
                    .from('driver-assets')
                    .upload(filePath, logoFile, { upsert: true });
                  if (uploadError) {
                    console.error('Logo upload error:', uploadError);
                    alert(`Logo upload failed: ${uploadError.message}`);
                    setIsSubmitting(false);
                    return;
                  }
                  const { data } = supabase.storage.from('driver-assets').getPublicUrl(filePath);
                  finalLogoUrl = data.publicUrl;
                } catch (err: any) {
                  console.error('Logo upload exception:', err);
                  alert(`Logo upload failed: ${err.message}`);
                  setIsSubmitting(false);
                  return;
                }
              }

              const saved: any = {
                id: editingClient?.id || `client-${Date.now()}`,
                name: g('name') || '',
                service: g('service') || editingClient?.service || 'Logistics & Transport',
                logo_url: finalLogoUrl,
                short_code: g('shortCode'),
                is_partner: fd.get('isPartner') === 'true',
                contact_person: g('contactPerson'),
                phone: g('phone'),
                email: g('email'),
                website: g('website'),
                head_office_address: g('headOfficeAddress'),
                city: g('city'),
                country: g('country'),
                account_number: g('accountNumber'),
                contract_ref: g('contractRef'),
                contract_start_date: g('contractStartDate'),
                contract_end_date: g('contractEndDate'),
                credit_limit: fd.get('creditLimit') ? Number(fd.get('creditLimit')) : undefined,
                notes: g('notes'),
                status: fd.get('status') as string,
                created_at: editingClient?.createdAt || new Date().toISOString(),
              };
              try {
                if (editingClient?.id) {
                  await onUpdateClient(saved.id, saved);
                } else {
                  await onAddClient(saved);
                }
                setIsModalOpen(false);
                setEditingClient(null);
              } catch (err: any) {
                alert(`Error saving partner: ${err.message || 'Unknown error'}`);
              } finally {
                setIsSubmitting(false);
              }
            }}>
              <fieldset disabled={isViewing || isSubmitting} className="p-6 space-y-5 disabled:opacity-80">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden group">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera size={24} className="text-slate-500 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">Add Logo</span>
                      </>
                    )}
                    {!isViewing && (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                      >
                        <Camera size={20} className="text-white" />
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} disabled={isViewing} />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
                    <input name="name" required defaultValue={editingClient?.name} placeholder="e.g. NP" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Short Code</label>
                    <input name="shortCode" defaultValue={editingClient?.shortCode} placeholder="e.g. NP" maxLength={5} className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Partner Status *</label>
                    <select name="isPartner" defaultValue={editingClient?.isPartner !== undefined ? String(editingClient.isPartner) : 'true'} className="w-full p-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none">
                      <option value="true">✅ Partner Project (Approved)</option>
                      <option value="false">✗ Non-Partner / Ad-hoc</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Engagement Status *</label>
                    <select name="status" defaultValue={editingClient?.status || 'Ongoing'} className="w-full p-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none">
                      <option value="Ongoing">🟢 Ongoing</option>
                      <option value="Pending">🟡 Pending</option>
                      <option value="Completed">⚪ Completed</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Contact Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
                    <input name="contactPerson" defaultValue={editingClient?.contactPerson} placeholder="e.g. Alhaji Koroma" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                    <input name="phone" defaultValue={editingClient?.phone} placeholder="+232 78 000 000" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input name="email" type="email" defaultValue={editingClient?.email} placeholder="accounts@supplier.com" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Website</label>
                    <input name="website" defaultValue={editingClient?.website} placeholder="https://" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Address</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Head Office Address</label>
                    <input name="headOfficeAddress" defaultValue={editingClient?.headOfficeAddress} placeholder="Street address" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input name="city" defaultValue={editingClient?.city} placeholder="Freetown" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                    <input name="country" defaultValue={editingClient?.country || 'Sierra Leone'} className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Contract & Account</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                    <input name="accountNumber" defaultValue={editingClient?.accountNumber} placeholder="e.g. NP-BIG-001" className="w-full p-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contract Reference</label>
                    <input name="contractRef" defaultValue={editingClient?.contractRef} placeholder="e.g. SLA/2024/NP/001" className="w-full p-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contract Start</label>
                    <input name="contractStartDate" type="date" defaultValue={editingClient?.contractStartDate} className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contract End</label>
                    <input name="contractEndDate" type="date" defaultValue={editingClient?.contractEndDate} className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Credit Limit (Le)</label>
                    <input name="creditLimit" type="number" defaultValue={editingClient?.creditLimit} placeholder="e.g. 50000000" className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Remarks</label>
                <textarea name="notes" rows={3} defaultValue={editingClient?.notes} placeholder="Additional information..." className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none" />
              </div>
              </fieldset>
              <div className="flex gap-3 px-6 pb-6 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingClient(null); }} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">{isViewing ? 'Close' : 'Cancel'}</button>
                {!isViewing && (
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm disabled:opacity-70 flex items-center justify-center gap-2">
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : (editingClient?.id ? 'Save Changes' : 'Add Project')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {clientToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h3 className="text-lg font-black text-slate-950 mb-2">Delete Project?</h3>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete "{clientToDelete.name}" permanently? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setClientToDelete(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={() => { onDeleteClient(clientToDelete.id); setClientToDelete(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-sm">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Team Admin View ──────────────────────────────────────────────────────────
const TeamAdminView: React.FC<{
  teamMembers: any[];
  onAdd: (m: any) => void;
  onUpdate: (id: string, m: any) => void;
  onDelete: (id: string) => void;
}> = ({ teamMembers, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filtered = teamMembers.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.role?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing({ name:'', role:'', bio:'', dedicatedRole:'', languages:'', phone:'', email:'', skills:[], imageUrl:'', displayOrder: teamMembers.length + 1, isActive: true }); setPhotoPreview(''); setPhotoFile(null); setIsModalOpen(true); };
  const openEdit = (m: any) => { setEditing({ ...m }); setPhotoPreview(m.imageUrl || ''); setPhotoFile(null); setIsModalOpen(true); };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setPhotoFile(f);
      setPhotoPreview(URL.createObjectURL(f));
      setEditing((prev: any) => ({ ...prev, imageUrl: URL.createObjectURL(f) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name || !editing?.role) return;
    setIsSubmitting(true);
    try {
      let imageUrl = editing.imageUrl || '';
      // Upload photo to Supabase storage if a new file selected
      if (photoFile) {
        const { data: storageData, error: storageErr } = await supabase.storage
          .from('driver-assets')
          .upload(`team_photo_${Date.now()}_${photoFile.name.replace(/\s+/g, '_')}`, photoFile, { upsert: true });
        
        if (storageErr) {
          throw new Error(`Failed to upload photo: ${storageErr.message}`);
        }
        
        if (storageData) {
          const { data: urlData } = supabase.storage.from('driver-assets').getPublicUrl(storageData.path);
          imageUrl = urlData.publicUrl;
        }
      }
      const payload = { ...editing, imageUrl, skills: typeof editing.skills === 'string' ? editing.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : editing.skills || [] };
      if (editing.id) {
        await onUpdate(editing.id, payload);
      } else {
        await onAdd(payload);
      }
      setIsModalOpen(false);
      setEditing(null);
    } catch (err: any) {
      alert(`Error saving team member: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Team Members', value: teamMembers.length, color: 'blue' },
          { label: 'Active Members', value: teamMembers.filter(m => m.isActive !== false).length, color: 'emerald' },
          { label: 'With Photo', value: teamMembers.filter(m => m.imageUrl).length, color: 'blue' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
            <h3 className={`text-2xl font-black text-${color}-600 mt-1`}>{value}</h3>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or role…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shrink-0"
          >
            <Plus size={15} /> Add Member
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-semibold">No team members found</p>
            <p className="text-slate-400 text-sm mt-1">Add your first team member using the button above</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((member) => (
              <div key={member.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-50">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50">
                      <span className="text-xl font-black text-blue-600">{getInitial(member.name)}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{member.name}</p>
                  <p className="text-xs text-blue-600 font-semibold truncate">{member.role}</p>
                  {member.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.skills.slice(0, 3).map((s: string, i: number) => (
                        <span key={i} className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order badge */}
                <div className="text-xs font-bold text-slate-400 font-mono shrink-0">#{member.displayOrder}</div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(member)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <PenTool size={15} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(member)}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 z-10">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">{editing.id ? 'Edit Team Member' : 'Add Team Member'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Photo upload */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-36 h-36 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden cursor-pointer bg-slate-50 hover:border-blue-400 transition-colors flex items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Camera size={32} className="mx-auto text-slate-400" />
                      <p className="text-xs text-slate-400 mt-2 font-medium">Click to upload photo</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>

              {/* Name + Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input required type="text" value={editing.name || ''} onChange={e => setEditing((p: any) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="e.g. Emmanuel A.H Kpakama" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role / Title *</label>
                  <input required type="text" value={editing.role || ''} onChange={e => setEditing((p: any) => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="e.g. Head of Admin and Logistics" />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Biography</label>
                <textarea rows={4} value={editing.bio || ''} onChange={e => setEditing((p: any) => ({ ...p, bio: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none" placeholder="Professional background and experience…" />
              </div>

              {/* Dedicated Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dedicated Role / Mission Note</label>
                <input type="text" value={editing.dedicatedRole || ''} onChange={e => setEditing((p: any) => ({ ...p, dedicatedRole: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="e.g. Point of contact for Helen Keller Intl…" />
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input type="text" value={editing.phone || ''} onChange={e => setEditing((p: any) => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="+232…" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input type="email" value={editing.email || ''} onChange={e => setEditing((p: any) => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="team@biggroup.com" />
                </div>
              </div>

              {/* Languages + Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Languages</label>
                  <input type="text" value={editing.languages || ''} onChange={e => setEditing((p: any) => ({ ...p, languages: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="English, Krio…" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Order</label>
                  <input type="number" min={1} value={editing.displayOrder ?? 1} onChange={e => setEditing((p: any) => ({ ...p, displayOrder: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skills / Expertise (comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(editing.skills) ? editing.skills.join(', ') : editing.skills || ''}
                  onChange={e => setEditing((p: any) => ({ ...p, skills: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Fleet Management, Compliance, Leadership…"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : (editing.id ? 'Save Changes' : 'Add Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal — animated */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden z-10"
            >
              {/* Red top accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-600" />
              <div className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                    <Trash2 size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">Remove Team Member?</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      You are about to permanently remove{' '}
                      <span className="font-bold text-slate-800">{confirmDelete.name}</span>{' '}
                      from the operational team. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { onDelete(confirmDelete.id); setConfirmDelete(null); }}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Yes, Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
