import React, { useState, useMemo } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, PenTool, Search } from 'lucide-react';
import { Driver } from './PerformanceSection';

interface Props {
  drivers: Driver[];
  driverScores: any[];
  onClose: () => void;
  onUpdateStatus: (driverId: string, newStatus: string, reason: string) => Promise<void>;
  onEditProfile: (driver: Driver) => void;
}

export const DriverAuditModal: React.FC<Props> = ({
  drivers,
  driverScores,
  onClose,
  onUpdateStatus,
  onEditProfile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ driverId: string; driverName: string; newStatus: string } | null>(null);
  
  // Calculate compliance for each driver
  const auditedDrivers = useMemo(() => {
    const now = new Date();
    return drivers.map(d => {
      const scoreData = driverScores.find(ds => ds.driver.id === d.id);
      const isExpired = new Date(d.licenseExpiry) < now;
      const score = scoreData ? scoreData.score : null;
      
      const issues: string[] = [];
      if (isExpired) issues.push('License Expired');
      if (score !== null && score < 40 && scoreData.trips > 0) issues.push(`Critically Low Score (${score}/100)`);
      if (score !== null && score >= 40 && score < 60 && scoreData.trips > 0) issues.push(`Warning Score (${score}/100)`);
      
      const isCompliant = issues.length === 0;

      return {
        ...d,
        issues,
        isCompliant,
        score
      };
    }).sort((a, b) => {
      // Sort non-compliant first, then by name
      if (a.isCompliant === b.isCompliant) return a.name.localeCompare(b.name);
      return a.isCompliant ? 1 : -1;
    });
  }, [drivers, driverScores]);

  const filteredDrivers = auditedDrivers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (driverId: string, driverName: string, newStatus: string) => {
    setConfirmAction({ driverId, driverName, newStatus });
  };

  const confirmStatusChange = async () => {
    if (!confirmAction) return;
    const { driverId, newStatus } = confirmAction;
    
    setUpdatingId(driverId);
    setConfirmAction(null);
    
    let reason = `Status updated via Compliance Audit to ${newStatus}`;
    if (newStatus === 'Suspended') reason = 'Suspended during Compliance Audit';
    if (newStatus === 'Warning') reason = 'Flagged during Compliance Audit';
    
    await onUpdateStatus(driverId, newStatus, reason);
    setUpdatingId(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="text-indigo-600" size={24} />
              Driver Compliance Audit
            </h2>
            <p className="text-sm text-slate-500 mt-1">Review compliance issues and update driver statuses.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search drivers by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Body / List */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No drivers found matching your search.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDrivers.map(driver => (
                <div key={driver.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  
                  {/* Driver Info */}
                  <div className="flex items-center gap-4 w-1/3">
                    <img src={driver.imgUrl} alt={driver.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
                    <div>
                      <h3 className="font-bold text-slate-900">{driver.name}</h3>
                      <p className="text-xs text-slate-500">License: {driver.licenseNumber || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Compliance Status & Issues */}
                  <div className="flex-1 px-4">
                    {driver.isCompliant ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <CheckCircle2 size={12} /> Compliant
                      </span>
                    ) : (
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-1">
                          <AlertTriangle size={12} /> Non-Compliant
                        </span>
                        {driver.issues.map((issue, idx) => (
                          <p key={idx} className="text-xs text-red-600 font-medium">• {issue}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 shrink-0">
                    
                    {/* Quick Status Update */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">Status:</span>
                      <select
                        value={driver.status}
                        onChange={(e) => handleStatusChange(driver.id, driver.name, e.target.value)}
                        disabled={updatingId === driver.id}
                        className={`text-sm font-bold rounded-lg border-slate-200 focus:ring-0 cursor-pointer ${
                          driver.status === 'Active' ? 'text-emerald-700 bg-emerald-50' :
                          driver.status === 'Warning' ? 'text-amber-700 bg-amber-50' :
                          driver.status === 'Suspended' ? 'text-red-700 bg-red-50' :
                          'text-slate-700 bg-slate-50'
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Warning">Warning</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Contract Cancelled">Contract Cancelled</option>
                        <option value="Left Company">Left Company</option>
                      </select>
                    </div>

                    <div className="w-px h-8 bg-slate-200 mx-2"></div>

                    {/* Edit Profile */}
                    <button
                      onClick={() => {
                        onClose();
                        onEditProfile(driver as Driver);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 rounded-lg text-sm font-bold transition-colors"
                    >
                      <PenTool size={14} /> Edit Profile
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>

      {/* Custom Confirmation Popup */}
      {confirmAction && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up border border-slate-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Change Driver Status</h3>
              <p className="text-slate-500 text-sm">
                Are you sure you want to change <span className="font-bold text-slate-700">{confirmAction.driverName}</span>'s status to <span className="font-bold text-slate-700">{confirmAction.newStatus}</span>?
              </p>
            </div>
            <div className="flex bg-slate-50 p-4 gap-3 border-t border-slate-100">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors text-sm shadow-sm"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
