import React, { useState, useEffect } from 'react';
import {
  Car, Users, FileText, AlertTriangle, CheckCircle2,
  Fuel, Navigation, Wrench, Award, Activity, ShieldAlert,
  ArrowUpRight, TrendingUp, Clock, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

interface OverviewData {
  totalVehicles: number;
  availableVehicles: number;
  inMaintenanceVehicles: number;
  decommissionedVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  warningDrivers: number;
  suspendedDrivers: number;
  totalTripLogs: number;
  totalDistance: number;
  totalFuelConsumed: number;
  totalIncidents: number;
  activeDispatches: number;
  maintenanceRecords: number;
  avgFuelEfficiency: number;
  tripTrend: { date: string; trips: number; distance: number; fuel: number }[];
  topDrivers: { name: string; img: string; score: number }[];
  recentAlerts: { type: string; message: string; severity: 'high' | 'medium' | 'low' }[];
}

const EMPTY: OverviewData = {
  totalVehicles: 0, availableVehicles: 0, inMaintenanceVehicles: 0, decommissionedVehicles: 0,
  totalDrivers: 0, activeDrivers: 0, warningDrivers: 0, suspendedDrivers: 0,
  totalTripLogs: 0, totalDistance: 0, totalFuelConsumed: 0, totalIncidents: 0,
  activeDispatches: 0, maintenanceRecords: 0, avgFuelEfficiency: 0,
  tripTrend: [], topDrivers: [], recentAlerts: []
};

// ── Mini stat card ────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor: string;
}> = ({ label, value, sub, icon, iconBg, valueColor }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest truncate">{label}</p>
      <p className={`text-3xl font-black mt-1 ${valueColor}`}>{value}</p>
      <p className="text-xs text-slate-600 mt-0.5 truncate">{sub}</p>
    </div>
    <div className={`p-3 rounded-xl border shrink-0 ml-3 ${iconBg}`}>
      {icon}
    </div>
  </div>
);

// ── Utilisation bar ───────────────────────────────────────────────────────────
const UtilBar: React.FC<{ label: string; value: number; sub: string; color: string; barClass: string }> = ({ label, value, sub, color, barClass }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
    <p className="text-xs font-mono font-bold text-slate-500 uppercase mb-3">{label}</p>
    <div className="flex items-end gap-3">
      <span className={`text-4xl font-black ${color}`}>{value}%</span>
      <span className="text-sm text-slate-600 mb-1">{sub}</span>
    </div>
    <div className="mt-3 h-3 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${barClass}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  </div>
);

// ── Alert row ────────────────────────────────────────────────────────────────
const AlertRow: React.FC<{ type: string; message: string; severity: 'high' | 'medium' | 'low' }> = ({ type, message, severity }) => {
  const colors = {
    high: { wrap: 'bg-red-50 border-red-100', label: 'text-red-600', icon: 'text-red-500' },
    medium: { wrap: 'bg-amber-50 border-amber-100', label: 'text-amber-600', icon: 'text-amber-500' },
    low: { wrap: 'bg-emerald-50 border-emerald-100', label: 'text-emerald-600', icon: 'text-emerald-500' },
  }[severity];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${colors.wrap}`}>
      <div className={`mt-0.5 shrink-0 ${colors.icon}`}>
        {severity === 'low' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
      </div>
      <div className="flex-1">
        <p className={`font-bold uppercase text-[9px] font-mono ${colors.label}`}>{type}</p>
        <p className="text-slate-700 leading-snug mt-0.5">{message}</p>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const DashboardOverview: React.FC = () => {
  const [data, setData] = useState<OverviewData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        // Dynamically import supabase to avoid top-level module crash
        const { supabase } = await import('../lib/supabase');

        // Run each query independently so a single table error never blocks the rest
        const safeQuery = async (fn: () => PromiseLike<any>) => {
          try { return await fn(); } catch { return { data: null, error: null }; }
        };

        const [vehiclesRes, driversRes, logsRes, maintenanceRes] = await Promise.all([
          safeQuery(() => supabase.from('vehicles').select('id, status').then(r => r)),
          safeQuery(() => supabase.from('drivers').select('id, name, img_url, status').then(r => r)),
          safeQuery(() => supabase.from('trip_logs').select('id, date, distance_traveled_km, fuel_consumed_liters, incidents').then(r => r)),
          safeQuery(() => supabase.from('maintenance_records').select('id, status').then(r => r)),
        ]);

        if (cancelled) return;

        // Scores are optional — fail silently
        let scores: any[] = [];
        try {
          const scoresRes = await supabase.rpc('get_driver_scores');
          scores = scoresRes.data ?? [];
        } catch { /* ignore — RPC may not exist yet */ }

        // Active dispatches — optional table
        let activeDispatches = 0;
        try {
          const { data: dData } = await supabase.from('active_dispatches').select('id');
          activeDispatches = dData?.length ?? 0;
        } catch { /* ignore */ }

        const vehicles   = vehiclesRes.data ?? [];
        const drivers    = driversRes.data ?? [];
        const logs       = logsRes.data ?? [];
        const maintenance = maintenanceRes.data ?? [];

        // ── Stats
        const availableVehicles     = vehicles.filter((v: any) => v.status === 'Available').length;
        const inMaintenanceVehicles  = vehicles.filter((v: any) => v.status === 'Maintenance').length;
        const decommissionedVehicles = vehicles.filter((v: any) => v.status === 'Decommissioned').length;
        const activeDrivers   = drivers.filter((d: any) => d.status === 'Active').length;
        const warningDrivers  = drivers.filter((d: any) => d.status === 'Warning').length;
        const suspendedDrivers = drivers.filter((d: any) => d.status === 'Suspended').length;

        const totalDistance  = logs.reduce((s: number, l: any) => s + Number(l.distance_traveled_km ?? 0), 0);
        const totalFuel      = logs.reduce((s: number, l: any) => s + Number(l.fuel_consumed_liters ?? 0), 0);
        const totalIncidents = logs.reduce((s: number, l: any) => s + Number(l.incidents ?? 0), 0);
        const avgEfficiency  = totalFuel > 0 ? totalDistance / totalFuel : 0;

        // ── Weekly trend (last 28 days)
        const now = new Date();
        const tripTrend = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((label, i) => {
          const wStart = new Date(now); wStart.setDate(now.getDate() - (28 - i * 7));
          const wEnd   = new Date(wStart); wEnd.setDate(wStart.getDate() + 7);
          const ws = wStart.toISOString().split('T')[0];
          const we = wEnd.toISOString().split('T')[0];
          const wl = (logs as any[]).filter(l => l.date >= ws && l.date < we);
          return {
            date: label,
            trips: wl.length,
            distance: Math.round(wl.reduce((s: number, l: any) => s + Number(l.distance_traveled_km ?? 0), 0)),
            fuel: Math.round(wl.reduce((s: number, l: any) => s + Number(l.fuel_consumed_liters ?? 0), 0)),
          };
        });

        // ── Top drivers
        const topDrivers = [...scores]
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 5)
          .map((s: any) => {
            const d = drivers.find((dr: any) => dr.id === s.driver_id);
            return { name: d?.name ?? 'Unknown', img: d?.img_url ?? '', score: Number(s.score) };
          });

        // ── Alerts
        const recentAlerts: OverviewData['recentAlerts'] = [];
        if (suspendedDrivers > 0) recentAlerts.push({ type: 'Drivers', message: `${suspendedDrivers} driver(s) suspended`, severity: 'high' });
        if (inMaintenanceVehicles > 0) recentAlerts.push({ type: 'Fleet', message: `${inMaintenanceVehicles} vehicle(s) in maintenance`, severity: 'medium' });
        if (totalIncidents > 0) recentAlerts.push({ type: 'Safety', message: `${totalIncidents} incident(s) logged this period`, severity: totalIncidents > 3 ? 'high' : 'medium' });
        if (avgEfficiency > 0 && avgEfficiency < 8) recentAlerts.push({ type: 'Fuel', message: 'Below-average fleet fuel efficiency detected', severity: 'low' });
        if (recentAlerts.length === 0) recentAlerts.push({ type: 'System', message: 'All systems operating normally', severity: 'low' });

        setData({
          totalVehicles: vehicles.length,
          availableVehicles, inMaintenanceVehicles, decommissionedVehicles,
          totalDrivers: drivers.length,
          activeDrivers, warningDrivers, suspendedDrivers,
          totalTripLogs: logs.length,
          totalDistance: Math.round(totalDistance),
          totalFuelConsumed: Math.round(totalFuel),
          totalIncidents,
          activeDispatches,
          maintenanceRecords: maintenance.length,
          avgFuelEfficiency: parseFloat(avgEfficiency.toFixed(1)),
          tripTrend, topDrivers, recentAlerts,
        });
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? 'Failed to load overview data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, []);


  // ── Skeleton shimmer helper
  const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.4s_infinite] rounded-xl ${className}`} />
  );

  // ── Skeleton loading state — mirrors the real layout so there's no blank flash
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <Shimmer className="h-7 w-56" />
            <Shimmer className="h-4 w-80" />
          </div>
          <Shimmer className="h-8 w-44 rounded-xl" />
        </div>

        {/* Row 1 KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Shimmer className="h-3 w-20" />
                <Shimmer className="h-8 w-16" />
                <Shimmer className="h-3 w-24" />
              </div>
              <Shimmer className="w-12 h-12 rounded-xl shrink-0 ml-3" />
            </div>
          ))}
        </div>

        {/* Row 2 KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Shimmer className="h-3 w-20" />
                <Shimmer className="h-8 w-16" />
                <Shimmer className="h-3 w-24" />
              </div>
              <Shimmer className="w-12 h-12 rounded-xl shrink-0 ml-3" />
            </div>
          ))}
        </div>

        {/* Utilisation bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <Shimmer className="h-3 w-32" />
              <Shimmer className="h-10 w-24" />
              <Shimmer className="h-3 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="space-y-1">
              <Shimmer className="h-5 w-48" />
              <Shimmer className="h-3 w-64" />
            </div>
            <Shimmer className="h-48 w-full rounded-xl" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="space-y-1">
              <Shimmer className="h-5 w-32" />
              <Shimmer className="h-3 w-48" />
            </div>
            <Shimmer className="h-40 w-full rounded-xl" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Shimmer key={i} className="h-4 w-full" />)}
            </div>
          </div>
        </div>

        {/* Fuel chart + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <Shimmer className="h-5 w-48" />
            <Shimmer className="h-44 w-full rounded-xl" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <Shimmer className="h-5 w-32" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Shimmer key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          </div>
        </div>

        {/* Driver status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col items-center gap-3">
              <Shimmer className="w-12 h-12 rounded-full" />
              <Shimmer className="h-8 w-12" />
              <Shimmer className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <AlertTriangle size={32} className="text-red-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Could not load overview</p>
          <p className="text-xs text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  const fleetUtilRate = data.totalVehicles > 0 ? Math.round((data.availableVehicles / data.totalVehicles) * 100) : 0;
  const driverReadyRate = data.totalDrivers > 0 ? Math.round((data.activeDrivers / data.totalDrivers) * 100) : 0;

  const vehiclePieData = [
    { name: 'Available', value: data.availableVehicles, color: '#10b981' },
    { name: 'Maintenance', value: data.inMaintenanceVehicles, color: '#f59e0b' },
    { name: 'Decommissioned', value: data.decommissionedVehicles, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Platform Overview</h2>
          <p className="text-slate-600 text-sm mt-0.5">Live analytics across fleet, drivers &amp; operations · BIG Group SL</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          LIVE · {new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      </div>

      {/* ── Row 1 KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Fleet" value={data.totalVehicles} sub={`${data.availableVehicles} available`} icon={<Car size={20} className="text-indigo-600" />} iconBg="bg-indigo-50 border-indigo-100" valueColor="text-indigo-600" />
        <KpiCard label="Active Drivers" value={data.activeDrivers} sub={`of ${data.totalDrivers} total`} icon={<Users size={20} className="text-emerald-600" />} iconBg="bg-emerald-50 border-emerald-100" valueColor="text-emerald-600" />
        <KpiCard label="Total Distance" value={`${data.totalDistance.toLocaleString()} km`} sub="all recorded trips" icon={<Navigation size={20} className="text-blue-600" />} iconBg="bg-blue-50 border-blue-100" valueColor="text-blue-600" />
        <KpiCard label="Avg Fuel Eff." value={`${data.avgFuelEfficiency} km/L`} sub="fleet average" icon={<Fuel size={20} className="text-amber-600" />} iconBg="bg-amber-50 border-amber-100" valueColor="text-amber-600" />
      </div>

      {/* ── Row 2 KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Trip Logs" value={data.totalTripLogs} sub="total recorded" icon={<FileText size={20} className="text-slate-700" />} iconBg="bg-slate-50 border-slate-200" valueColor="text-slate-950" />
        <KpiCard label="Fuel Consumed" value={`${data.totalFuelConsumed.toLocaleString()} L`} sub="all trips total" icon={<TrendingUp size={20} className="text-violet-600" />} iconBg="bg-violet-50 border-violet-100" valueColor="text-violet-600" />
        <KpiCard label="In Maintenance" value={data.inMaintenanceVehicles} sub="vehicles grounded" icon={<Wrench size={20} className="text-orange-500" />} iconBg="bg-orange-50 border-orange-100" valueColor="text-orange-500" />
        <KpiCard label="Incidents" value={data.totalIncidents} sub="logged this period" icon={<AlertTriangle size={20} className={data.totalIncidents > 0 ? "text-red-600" : "text-slate-500"} />} iconBg={data.totalIncidents > 0 ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-200"} valueColor={data.totalIncidents > 0 ? "text-red-600" : "text-slate-500"} />
      </div>

      {/* ── Utilisation Bars ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UtilBar label="Fleet Availability Rate" value={fleetUtilRate} sub={`${data.availableVehicles} of ${data.totalVehicles} vehicles available`} color="text-indigo-600" barClass="bg-gradient-to-r from-indigo-500 to-violet-500" />
        <UtilBar label="Driver Readiness Rate" value={driverReadyRate} sub={`${data.activeDrivers} active of ${data.totalDrivers} total`} color="text-emerald-600" barClass="bg-gradient-to-r from-emerald-400 to-teal-500" />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Trip Activity Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-950">Trip Activity — Last 28 Days</h3>
              <p className="text-xs text-slate-500 mt-0.5">Weekly trips &amp; distance breakdown</p>
            </div>
            <BarChart2 size={18} className="text-slate-400" />
          </div>
          {data.tripTrend.some(t => t.trips > 0 || t.distance > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.tripTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Area type="monotone" dataKey="trips" stroke="#6366f1" fill="#eef2ff" strokeWidth={2} name="Trips" />
                <Area type="monotone" dataKey="distance" stroke="#10b981" fill="#ecfdf5" strokeWidth={2} name="Distance (km)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Clock size={24} className="text-slate-400" />
              <p className="text-sm">No trip data in the last 28 days</p>
            </div>
          )}
        </div>

        {/* Fleet Status Donut */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-950">Fleet Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Current vehicle distribution</p>
            </div>
            <Car size={18} className="text-slate-400" />
          </div>
          {vehiclePieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={vehiclePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {vehiclePieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-2">
                {vehiclePieData.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-slate-700">{s.name}</span>
                    </div>
                    <span className="font-bold text-slate-950">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-500 text-sm">No fleet data</div>
          )}
        </div>
      </div>

      {/* ── Fuel vs Distance + Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-950">Fuel vs Distance by Week</h3>
              <p className="text-xs text-slate-500 mt-0.5">Consumption vs mileage correlation</p>
            </div>
            <Fuel size={18} className="text-slate-400" />
          </div>
          {data.tripTrend.some(t => t.fuel > 0 || t.distance > 0) ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.tripTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="fuel" fill="#f59e0b" name="Fuel (L)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="distance" fill="#6366f1" name="Distance (km)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-500 text-sm">No fuel or distance data yet</div>
          )}
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-950">System Alerts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Active notices &amp; flags</p>
            </div>
            <ShieldAlert size={18} className="text-slate-400" />
          </div>
          <div className="space-y-2">
            {data.recentAlerts.map((alert, i) => (
              <AlertRow key={i} type={alert.type} message={alert.message} severity={alert.severity} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Driver Status Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3">
            <Users size={20} className="text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-indigo-600">{data.activeDrivers}</p>
          <p className="text-xs font-bold text-slate-600 uppercase font-mono mt-1">Active Drivers</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-3">
            <Activity size={20} className="text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-500">{data.warningDrivers}</p>
          <p className="text-xs font-bold text-slate-600 uppercase font-mono mt-1">On Warning</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <p className="text-3xl font-black text-red-500">{data.suspendedDrivers}</p>
          <p className="text-xs font-bold text-slate-600 uppercase font-mono mt-1">Suspended</p>
        </div>
      </div>

      {/* ── Top Drivers ── */}
      {data.topDrivers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-950">Top Performing Drivers</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ranked by automated scoring engine</p>
            </div>
            <Award size={18} className="text-amber-400" />
          </div>
          <div className="space-y-3">
            {data.topDrivers.map((d, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className={`text-sm font-black w-6 text-center ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-500' : i === 2 ? 'text-orange-400' : 'text-slate-400'}`}>
                  #{i + 1}
                </span>
                {d.img ? (
                  <img src={d.img} alt={d.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Users size={14} className="text-indigo-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{d.name}</p>
                  <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${d.score >= 80 ? 'bg-emerald-500' : d.score >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(d.score, 100)}%` }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-black px-2.5 py-0.5 rounded-lg shrink-0 ${d.score >= 90 ? 'bg-emerald-50 text-emerald-700' : d.score >= 70 ? 'bg-blue-50 text-blue-700' : d.score >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                  {d.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
