import React, { useState } from 'react';
import { Shield, Fuel, Navigation, AlertTriangle, PenTool, CheckCircle2, TrendingUp, TrendingDown, Clock, Car, Trophy, AlertCircle } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from 'recharts';

interface DriverMetrics {
  id: string;
  name: string;
  assignedVehicle: string;
  imgUrl: string;
  tripsCompleted: number;
  distanceTraveledKm: number;
  fuelConsumedLiters: number;
  fuelEfficiency: number; // km/liter
  fuelCostTotal: number;
  incidents: number;
  maintenanceAlerts: number;
  speedingEvents: number;
  harshBraking: number;
  idlingTimeHours: number;
  complianceScore: number; // 0-100
  performanceScore: number; // 0-100
  status: 'Active' | 'Warning' | 'Suspended';
}

const mockDrivers: DriverMetrics[] = [
  {
    id: 'd1', name: 'Abdul Rahman', assignedVehicle: 'Land Cruiser Prado (AEC-142)', imgUrl: 'https://i.pravatar.cc/150?u=abdul',
    tripsCompleted: 42, distanceTraveledKm: 3450, fuelConsumedLiters: 310, fuelEfficiency: 11.1, fuelCostTotal: 465,
    incidents: 0, maintenanceAlerts: 1, speedingEvents: 2, harshBraking: 1, idlingTimeHours: 4.5,
    complianceScore: 98, performanceScore: 96, status: 'Active'
  },
  {
    id: 'd2', name: 'Alhaji Bah', assignedVehicle: 'Toyota 4Runner (AKX-099)', imgUrl: 'https://i.pravatar.cc/150?u=alhaji',
    tripsCompleted: 38, distanceTraveledKm: 2800, fuelConsumedLiters: 275, fuelEfficiency: 10.1, fuelCostTotal: 412,
    incidents: 1, maintenanceAlerts: 0, speedingEvents: 5, harshBraking: 3, idlingTimeHours: 6.2,
    complianceScore: 85, performanceScore: 88, status: 'Warning'
  },
  {
    id: 'd3', name: 'Ibrahim Sesay', assignedVehicle: 'Hilux V8 (BCP-401)', imgUrl: 'https://i.pravatar.cc/150?u=ibrahim',
    tripsCompleted: 45, distanceTraveledKm: 4100, fuelConsumedLiters: 380, fuelEfficiency: 10.7, fuelCostTotal: 570,
    incidents: 0, maintenanceAlerts: 2, speedingEvents: 1, harshBraking: 2, idlingTimeHours: 5.1,
    complianceScore: 95, performanceScore: 94, status: 'Active'
  },
  {
    id: 'd4', name: 'Mohamed Kamara', assignedVehicle: 'Nissan Patrol (XZ-110)', imgUrl: 'https://i.pravatar.cc/150?u=mohamed',
    tripsCompleted: 20, distanceTraveledKm: 1800, fuelConsumedLiters: 195, fuelEfficiency: 9.2, fuelCostTotal: 292,
    incidents: 2, maintenanceAlerts: 1, speedingEvents: 8, harshBraking: 6, idlingTimeHours: 12.0,
    complianceScore: 65, performanceScore: 71, status: 'Warning'
  },
  {
    id: 'd5', name: 'Samuel Koroma', assignedVehicle: 'Land Cruiser V8 (DDC-992)', imgUrl: 'https://i.pravatar.cc/150?u=samuel',
    tripsCompleted: 50, distanceTraveledKm: 4800, fuelConsumedLiters: 400, fuelEfficiency: 12.0, fuelCostTotal: 600,
    incidents: 0, maintenanceAlerts: 0, speedingEvents: 0, harshBraking: 0, idlingTimeHours: 2.1,
    complianceScore: 100, performanceScore: 99, status: 'Active'
  }
];

const fuelConsumptionData = [
  { name: 'Mon', liters: 120, avgEfficiency: 10.5 },
  { name: 'Tue', liters: 135, avgEfficiency: 10.3 },
  { name: 'Wed', liters: 110, avgEfficiency: 11.0 },
  { name: 'Thu', liters: 145, avgEfficiency: 9.8 },
  { name: 'Fri', liters: 160, avgEfficiency: 10.1 },
  { name: 'Sat', liters: 90, avgEfficiency: 11.2 },
  { name: 'Sun', liters: 75, avgEfficiency: 11.5 },
];

export const PerformanceSection: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');
  
  const sortedDrivers = [...mockDrivers].sort((a, b) => b.performanceScore - a.performanceScore);
  const bestDriver = sortedDrivers[0];

  const totalFuel = mockDrivers.reduce((acc, d) => acc + d.fuelConsumedLiters, 0);
  const totalDistance = mockDrivers.reduce((acc, d) => acc + d.distanceTraveledKm, 0);
  const avgEfficiency = (totalDistance / totalFuel).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Fleet Telemetry & Human Performance</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time driver behavior monitoring, fuel efficiency variants, and compliance tracking.</p>
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          {['Daily', 'Weekly', 'Monthly'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf as any)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${timeframe === tf ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-mono font-semibold">Total Fuel Consumed</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{totalFuel.toLocaleString()} <span className="text-sm font-medium text-slate-500">Liters</span></h3>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg">
              <Fuel className="text-orange-500" size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
            <TrendingDown size={14} className="mr-1" />
            <span>4.2% lower than last {timeframe.toLowerCase()}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-mono font-semibold">Fleet Effiency Avg</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{avgEfficiency} <span className="text-sm font-medium text-slate-500">km/L</span></h3>
            </div>
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Navigation className="text-indigo-500" size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
            <TrendingUp size={14} className="mr-1" />
            <span>Improved by 0.8 km/L</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-mono font-semibold">Reported Incidents</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">3 <span className="text-sm font-medium text-slate-500">Flags</span></h3>
            </div>
            <div className="bg-red-50 p-2 rounded-lg">
              <AlertTriangle className="text-red-500" size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-red-600">
            <TrendingUp size={14} className="mr-1" />
            <span>2 unreviewed collision alerts</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-mono font-semibold">Compliance Rating</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">94<span className="text-sm font-medium text-slate-500">%</span></h3>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg">
              <CheckCircle2 className="text-emerald-500" size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
            <TrendingUp size={14} className="mr-1" />
            <span>On track with policy targets</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Charts & Graphs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-6">Fuel Consumption vs Efficiency Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fuelConsumptionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLiters" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="liters" name="Fuel (Liters)" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLiters)" />
                  <Area yAxisId="right" type="monotone" dataKey="avgEfficiency" name="Efficiency (km/L)" stroke="#10b981" strokeWidth={3} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-6">Driver Event Violations Overview</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedDrivers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="speedingEvents" name="Speeding" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="harshBraking" name="Harsh Braking" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="idlingTimeHours" name="Excessive Idling (hrs)" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Best Driver & Alerts */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-indigo-900 to-slate-900 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy size={120} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase font-mono">Driver of the {timeframe}</span>
              <div className="flex items-center gap-4 mt-4">
                <img src={bestDriver.imgUrl} alt={bestDriver.name} className="w-16 h-16 rounded-full border-2 border-indigo-400" />
                <div>
                  <h3 className="text-xl font-bold">{bestDriver.name}</h3>
                  <p className="text-indigo-200 text-xs flex items-center gap-1 mt-1"><Car size={12} /> {bestDriver.assignedVehicle}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-indigo-300 font-mono uppercase">Performance Score</p>
                  <p className="text-2xl font-black mt-1">{bestDriver.performanceScore}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-indigo-300 font-mono uppercase">Fuel Efficiency</p>
                  <p className="text-2xl font-black mt-1">{bestDriver.fuelEfficiency} <span className="text-xs font-normal">km/L</span></p>
                </div>
              </div>
              <p className="text-xs text-indigo-200 mt-4 leading-relaxed opacity-80">
                Awarded for maintaining 0 incidents, optimal shifting resulting in exceptional fuel economy, and 100% policy compliance.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800">System Anomalies & AI Insights</h3>
            </div>
            <div className="p-4 space-y-4 flex-grow">
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-red-800">Fuel Variance Alarm</span>
                  <span className="text-[9px] text-red-600 font-mono">2h ago</span>
                </div>
                <p className="text-xs text-red-700">Sudden drop of 15 liters detected during stationary idling on vehicle XZ-110 (Mohamed Kamara).</p>
              </div>
              
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-indigo-800">Maintenance Predictor</span>
                  <span className="text-[9px] text-indigo-600 font-mono">5h ago</span>
                </div>
                <p className="text-xs text-indigo-700">Vehicle AEC-142 engine metrics indicate standard efficiency drop. Scheduled air filter replacement recommended.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Performance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-sm font-bold text-slate-900">Human Performance & Telemetry Logs</h3>
          <button className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors">
            Export Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Driver & Vehicle</th>
                <th className="px-6 py-4 font-semibold">Trips</th>
                <th className="px-6 py-4 font-semibold">Distance</th>
                <th className="px-6 py-4 font-semibold">Fuel Economy</th>
                <th className="px-6 py-4 font-semibold">Est. Cost</th>
                <th className="px-6 py-4 font-semibold">Violations</th>
                <th className="px-6 py-4 font-semibold">Score</th>
                <th className="px-6 py-4 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={driver.imgUrl} alt={driver.name} className="w-9 h-9 rounded-full object-cover bg-slate-200" />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{driver.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Car size={10} /> {driver.assignedVehicle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{driver.tripsCompleted}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{driver.distanceTraveledKm} <span className="text-xs text-slate-400">km</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${driver.fuelEfficiency >= 10.5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {driver.fuelEfficiency}
                      </span>
                      <span className="text-xs text-slate-400">km/L</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">${driver.fuelCostTotal}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-[11px] text-slate-500">
                      {driver.speedingEvents > 0 && <span className="flex items-center gap-1"><AlertTriangle size={10} className="text-red-400"/> {driver.speedingEvents} Speeding</span>}
                      {driver.idlingTimeHours > 5 && <span className="flex items-center gap-1"><Clock size={10} className="text-amber-400"/> {driver.idlingTimeHours}h Idle</span>}
                      {driver.speedingEvents === 0 && driver.idlingTimeHours <= 5 && driver.incidents === 0 && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={10}/> Clean Record</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${driver.performanceScore >= 90 ? 'bg-emerald-500' : driver.performanceScore >= 80 ? 'bg-indigo-500' : 'bg-red-500'}`}
                          style={{ width: `${driver.performanceScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700 text-xs">{driver.performanceScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      driver.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      driver.status === 'Warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
