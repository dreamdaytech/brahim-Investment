import React, { useState } from 'react';

import { Phone, Mail, MapPin, Menu, X, Shield, Lock, User, LogOut, LayoutDashboard } from 'lucide-react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';

interface HeaderProps {
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    import('../lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setAdminUser(session?.user || null);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setAdminUser(session?.user || null);
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  const navItems: { id: string; label: string; path: string; submenu?: {label: string, path: string}[] }[] = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'fleet', label: 'Our Fleet', path: '/fleet' },
    { id: 'services', label: 'Services', path: '/services' },
    { id: 'about', label: 'About Us', path: '/about', submenu: [{label: 'Our Team', path: '/team'}] },
    { id: 'clients', label: 'Partners', path: '/clients' },
    { id: 'contact', label: 'Book Now', path: '/contact' }
  ];

  return (
    <header className="w-full bg-[#0f172a] text-white shadow-sm z-50 sticky top-0 border-b border-slate-800">
      {/* Top Banner Contact Info */}
      <div className="hidden md:flex w-full bg-[#090d16] text-xs py-2 px-6 border-b border-slate-800 justify-between items-center text-slate-100 font-sans">
        <div className="flex items-center space-x-6">
          <span className="flex items-center space-x-1">
            <Phone size={13} className="text-blue-500" />
            <span>+232 79 121 013 / +232 30 133 574</span>
          </span>
          <span className="flex items-center space-x-1">
            <Mail size={13} className="text-blue-500" />
            <span>bossbahonly@gmail.com</span>
          </span>
          <span className="flex items-center space-x-1">
            <MapPin size={13} className="text-blue-500" />
            <span>11 Freetown Road, Wilberforce, Freetown</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-emerald-950/40 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono font-semibold tracking-wider flex items-center gap-1 border border-emerald-800/30">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            FLEET STATUS: DEPLOYABLE
          </span>

          {adminUser ? (
            <div className="relative flex items-center h-full">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-xs text-slate-100 hover:text-emerald-400 transition-colors duration-200 cursor-pointer border-l border-slate-800 pl-4 h-full"
              >
                {adminUser.user_metadata?.avatar_url ? (
                  <img src={adminUser.user_metadata.avatar_url} alt="Admin" className="w-5 h-5 rounded-full object-cover border border-emerald-500/30" />
                ) : (
                  <Shield size={12} className="text-emerald-500" />
                )}
                <span className="text-emerald-400">{adminUser.user_metadata?.full_name || adminUser.email}</span>
              </button>
              
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                  <div className="absolute right-0 top-8 w-48 bg-[#0f172a] border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden text-left">
                    <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                      <p className="text-sm font-semibold text-white truncate">{adminUser.user_metadata?.full_name || 'Administrator'}</p>
                      <p className="text-[10px] text-slate-100 truncate mt-0.5">{adminUser.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button 
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate('/admin');
                          setTimeout(() => window.dispatchEvent(new CustomEvent('open-admin-overview')), 50);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-white hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <LayoutDashboard size={14} /> Dashboard
                      </button>
                      <button 
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate('/admin');
                          setTimeout(() => window.dispatchEvent(new CustomEvent('open-admin-profile')), 50);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-white hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <User size={14} /> Profile & Settings
                      </button>
                      <button 
                        onClick={() => {
                          setDropdownOpen(false);
                          import('../lib/supabase').then(({ supabase }) => supabase.auth.signOut());
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg flex items-center gap-2 mt-0.5 cursor-pointer transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button 
              onClick={() => navigate('/admin')}
              className="flex items-center space-x-1 text-xs text-slate-100 hover:text-blue-400 transition-colors duration-200 cursor-pointer border-l border-slate-800 pl-4 h-full"
            >
              <Lock size={12} />
              <span>Admin Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* LOGO */}
        <Link 
          to="/" 
          className="flex items-center space-x-3 cursor-pointer select-none group"
        >
          <div className="bg-blue-600 p-2 rounded flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black tracking-wider text-white">B.I.G</span>
              <span className="text-xs font-semibold text-blue-400">GROUP</span>
            </div>
            <p className="text-[10px] tracking-widest text-slate-600 font-mono -mt-1">BRAHIM INVESTMENT GROUP</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1 lg:space-x-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.id === 'about' && location.pathname === '/team');
              return item.submenu ? (
                <div key={item.id} className="relative group">
                  <NavLink
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer flex items-center ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                        : 'text-white hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                    <svg className="w-4 h-4 ml-1 -mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </NavLink>
                  <div className="absolute left-0 mt-1 w-48 bg-[#0f172a] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-slate-700 py-2">
                    {item.submenu.map((sub, i) => (
                      <NavLink
                        key={i}
                        to={sub.path}
                        className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ) : (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                      : 'text-white hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
          })}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            onClick={() => navigate('/admin')}
            className="p-1.5 text-slate-100 hover:text-blue-400 transition-colors"
            title="Admin Logs"
          >
            <Lock size={18} />
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-slate-100 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#131a2c] border-t border-slate-800 px-4 pt-2 pb-6 space-y-2 shadow-2xl animate-fade-in">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.id === 'about' && location.pathname === '/team');
              return (
                <div key={item.id} className="flex flex-col">
                  <NavLink
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full text-left px-4 py-3 rounded-md text-base font-semibold block transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white font-bold' 
                        : 'text-white hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </NavLink>
                  {item.submenu && (
                    <div className="pl-6 pt-1 flex flex-col space-y-1 border-l-2 border-slate-800 ml-6 mt-1 mb-2">
                      {item.submenu.map((sub, i) => (
                        <NavLink
                          key={i}
                          to={sub.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                        >
                          - {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
          })}
          
          <div className="pt-4 border-t border-slate-850 mt-4 text-xs text-slate-100 space-y-2">
            <p className="flex items-center gap-2"><Phone size={12} className="text-blue-400" /> +232 79 121 013 / +232 30 133 574</p>
            <p className="flex items-center gap-2"><Mail size={12} className="text-blue-400" /> bossbahonly@gmail.com</p>
            <p className="flex items-center gap-2"><MapPin size={12} className="text-blue-400" /> 11 Freetown Road, Wilberforce, Freetown</p>
          </div>
        </div>
      )}
    </header>
  );
};
