import React, { useState } from 'react';
import { Inquiry } from '../types';
import { VEHICLES } from '../data';
import { Lock, FileText, CheckCircle, XCircle, Search, Sparkles, Filter, Database, TrendingUp, AlertCircle, ShieldEllipsis, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminSectionProps {
  inquiries: Inquiry[];
  onUpdateStatus: (id: string, status: Inquiry['status']) => void;
  onDeleteInquiry: (id: string) => void;
}

export const AdminSection: React.FC<AdminSectionProps> = ({ inquiries, onUpdateStatus, onDeleteInquiry }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');
  
  // Filtering & Searches States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock passcode for testing
    if (passcode === '1234' || passcode === '39112') {
      setIsAuthenticated(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid administrative access passcode. Use default: [ 1234 ] or VENDOR ID.');
    }
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

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      
      {!isAuthenticated ? (
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
              You are accessing the confidential dispatch log registry. Enter the authorized 4-digit code.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="mt-8 space-y-4">
            <div>
              <input 
                type="password" 
                maxLength={8}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Staff Passcode [1234]"
                className="w-full text-center p-4 border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:outline-none rounded-2xl text-md font-mono tracking-[0.4em] font-black focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {passcodeError && (
              <p className="text-[11px] text-red-650 font-medium font-sans flex items-center justify-center gap-1.5">
                <AlertCircle size={13} />
                <span>{passcodeError}</span>
              </p>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-500 text-left font-mono">
              💡 <strong>Default Sandbox credentials:</strong> Enter <strong>1234</strong> to immediately access, audit and manage user bookings!
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-705 text-white font-semibold rounded-2xl text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
            >
              Authorize Administrative Access
            </button>
          </form>
        </div>
      ) : (
        // MAIN ACTIVE ADMIN DISPATCH BOARD
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Admin Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-600">
                  SECURE LIVE DISPATCH CHANNEL SL-5
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">BIG Group Ops Registry</h1>
              <p className="text-xs text-gray-500 font-mono mt-0.5">Physical Hub: Wilkinson Road, Freetown</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-4 py-2 text-xs font-bold text-[#b91c1c] bg-red-50 hover:bg-red-100 rounded-lg uppercase border border-red-200/60 transition-colors cursor-pointer"
              >
                Sign Out / Lock Port
              </button>
            </div>
          </div>

          {/* Quick Dashboard Key stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">TOTAL LOGGED REQUESTS</span>
                <span className="text-3xl font-black text-slate-900 font-mono mt-0.5">{totalInquiries}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-200">
                <Database size={20} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">ACTIVE RESERVATIONS APPROVED</span>
                <span className="text-3xl font-black text-emerald-600 font-mono mt-0.5">{approvedInquiries}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                <CheckCircle size={20} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">UNITS OFFICIALLY RESERVED</span>
                <span className="text-3xl font-black text-indigo-600 font-mono mt-0.5">{totalReservedUnits} SUVs</span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-mono block text-[10px] uppercase">PENDING DEPLOYMENT SCREENINGS</span>
                <span className="text-3xl font-black text-rose-600 font-mono mt-0.5">{pendingInquiries}</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600 border border-rose-100">
                <ShieldEllipsis size={20} />
              </div>
            </div>
          </div>

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
                            Approve Dispatch
                          </button>
                          <button
                            onClick={() => onUpdateStatus(item.id, 'Declined')}
                            className="flex-1 lg:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] uppercase rounded-lg transition-colors cursor-pointer text-center"
                          >
                            Decline Unit
                          </button>
                        </>
                      )}

                      {item.status !== 'Pending' && (
                        <button
                          onClick={() => onUpdateStatus(item.id, 'Pending')}
                          className="flex-1 lg:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] uppercase rounded-lg transition-colors cursor-pointer text-center border border-slate-200"
                        >
                          Reset Pending
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

        </div>
      )}

    </div>
  );
};
