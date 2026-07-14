import React, { useState, useMemo } from 'react';
import { Shield, Fuel, Navigation, AlertTriangle, PenTool, CheckCircle2, TrendingUp, TrendingDown, Clock, Car, Trophy, AlertCircle, Search, ArrowUpDown, Plus, Calendar, FileText, User, ShieldAlert, Briefcase, Activity, ArrowLeft, Mail, Phone, MapPin, CreditCard, Users, Download, Upload, Trash2, X, ChevronDown, ChevronRight, ChevronUp, MoreVertical, Filter, Gift, Award, Eye, LayoutGrid, List, Pencil, ExternalLink, Loader2 } from 'lucide-react';
import Select from 'react-select';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import { mockAccounts } from './CorporateBilling';
import { supabase } from '../lib/supabase';
import { handleSupabaseSync } from '../lib/syncHelpers';
import { v4 as uuidv4 } from 'uuid';
import { DriverModal } from './DriverModal';
import { DriverAuditModal } from './DriverAuditModal';
import { DispatchDetailsView } from './DispatchDetailsView';
import { VehicleDetailsView } from './VehicleDetailsView';
import { VehicleModal } from './VehicleModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import { FuelCity, FuelStation } from '../types';
const SearchableSelect = ({ value, onChange, options, placeholder }: any) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClick = (e: any) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredOptions = options.filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase()));
  const selectedLabel = options.find((o: any) => o.value === value)?.label || placeholder;

  return (
    <div className="relative min-w-[140px]" ref={wrapperRef}>
      <button type="button" onClick={() => { setIsOpen(!isOpen); setSearch(''); }} className="w-full text-left bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 flex justify-between items-center">
        <span className="truncate pr-2">{selectedLabel}</span>
        <span className="text-slate-400 text-[10px]">▼</span>
      </button>
      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full min-w-[200px] max-w-[400px] left-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <input 
            type="text" 
            autoFocus 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search..." 
            className="w-full px-3 py-2 text-xs border-b border-slate-100 focus:outline-none bg-slate-50" 
          />
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? <div className="px-3 py-2 text-xs text-slate-400">No results</div> : null}
            {filteredOptions.map((o: any) => (
              <button 
                key={o.value} 
                type="button" 
                onClick={() => { onChange(o.value); setIsOpen(false); }} 
                className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 ${value === o.value ? 'font-bold bg-blue-50 text-blue-700' : 'text-slate-700'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const slDistricts = ['Western Area Urban', 'Western Area Rural', 'Bo', 'Bonthe', 'Moyamba', 'Pujehun', 'Kailahun', 'Kenema', 'Kono', 'Bombali', 'Falaba', 'Koinadugu', 'Tonkolili', 'Kambia', 'Karene', 'Port Loko'];
const slCities = ['Freetown', 'Waterloo', 'Bo', 'Kenema', 'Makeni', 'Koidu', 'Lunsar', 'Port Loko', 'Kabala', 'Segbwema', 'Kailahun', 'Magburaka'];
const partnerStations = [{ name: 'NP', isPartner: true }, { name: 'TotalEnergies', isPartner: true }, { name: 'Malado', isPartner: true }, { name: 'Other', isPartner: false }];
const supplierColors: Record<string, string> = { NP: 'bg-blue-500', Malado: 'bg-emerald-500', TotalEnergies: 'bg-amber-500', Other: 'bg-slate-400' };

export interface DriverDocument {
  id: string;
  driverId: string;
  docType: string;
  label: string;
  fileUrl: string;
  fileName?: string;
}

export interface DriverStatusLog {
  id: string;
  driverId: string;
  status: string;
  reason: string;
  recordedBy?: string;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  imgUrl: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  nationalId?: string;
  licenseNumber?: string;
  licenseType?: string;
  status: 'Active' | 'Warning' | 'Suspended' | 'Contract Cancelled' | 'Left Company';
  statusReason?: string;
  licenseExpiry: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  awards?: string[];
  documents?: DriverDocument[];
  statusLogs?: DriverStatusLog[];
  suspensionCount?: number;
}

export interface VehicleDocument {
  id?: string;
  vehicleId?: string;
  docType: string;
  label: string;
  fileUrl: string;
  uploadedAt?: string;
}

export interface Vehicle {
  id: string;
  makeModel: string;
  year: number;
  odometer: number;
  plateNumber: string;
  insuranceExpiry: string;
  condition: string;
  isCompanyRegistered: boolean;
  type: string;
  status: 'Available' | 'Maintenance' | 'Decommissioned';
  imageUrl?: string;
  galleryUrls?: string[];
  documents?: VehicleDocument[];
  // Public Fleet fields
  showOnFleet?: boolean;
  vehicleCategory?: string;
  description?: string;
  pricePerDay?: number;
  features?: string[];
  fuelType?: string;
  transmission?: string;
  seats?: number;
  engineLabel?: string;
}

export interface FuelSupplier {
  id: string;
  name: string;               // e.g. NP, Malado, TotalEnergies
  shortCode?: string;         // e.g. NP, MAL, TE
  isPartner: boolean;         // Is this an approved partner supplier?
  // Contact
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  // Address
  headOfficeAddress?: string;
  city?: string;
  country?: string;
  // Contract
  accountNumber?: string;
  contractRef?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  creditLimit?: number;
  // Meta
  notes?: string;
  createdAt?: string;
}

export interface FuelCollection {

  id: string;
  // Linkage (populated by allFuelCollections memo)
  tripLogId?: string;
  driverId?: string;
  vehicleId?: string;
  // Time
  date?: string;        // YYYY-MM-DD (set by memo from parent log)
  time?: string;        // HH:MM
  // Station & Supplier
  stationName: string;
  supplier?: string;    // 'NP' | 'Malado' | 'TotalEnergies' | 'Other'
  isPartnerStation?: boolean;
  // Location
  location: string;     // City
  district?: string;
  region?: string;
  // Quantities & Cost
  liters: number;
  costPerLiter: number;
  totalAmount?: number;
  // Payment
  fuelType?: 'Petrol' | 'Diesel' | 'Premium';
  paymentMethod?: 'Fuel Card' | 'Voucher' | 'Mobile Money' | 'Cash';
  receiptNumber?: string;
  // Non-partner justification
  nonPartnerReason?: string;
  // General
  remarks?: string;
}

export interface TripLeg {
  id: string;
  date?: string;            // YYYY-MM-DD (optional, defaults to trip log date)
  departurePoint: string;
  departureTime: string;    // HH:MM
  destinationPoint: string;
  arrivalTime: string;      // HH:MM
  odometerStart: number;
  odometerEnd: number;
  purposeOfTrip: string;
}

export interface Passenger {
  id: string;
  name: string;
}


export interface TripLog {
  id: string;
  date: string; // YYYY-MM-DD
  driverId: string;
  vehicleId: string;
  district?: string;
  distanceTraveledKm: number;
  fuelConsumedLiters: number;
  fuelIssuedLiters: number;
  fuelCostPerLiter: number;
  incidents: number;
  speedingEvents: number;
  harshBraking: number;
  idlingTimeHours: number;
  routeDeviations: number;
  policyViolations: number;
  maintenanceIssuesLogged: boolean;
  fuelCollections?: FuelCollection[];
  corporateAccountId?: string;
  notes?: string;
  /** ID of the ActiveDispatch that originated this trip */
  dispatchId?: string;
  /** ID of the MaintenanceRecord created as follow-up to this trip */
  maintenanceRecordId?: string;
  /** Multi-leg route detail */
  legs?: TripLeg[];
  /** Passenger manifest */
  passengers?: Passenger[];
  /** Project or program billing code */
  projectCode?: string;
  /** Admin approval workflow */
  approvalStatus?: 'Pending' | 'Approved' | 'Flagged';
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  approvalSignature?: string;
}

export interface CompletedDispatch {
  id: string;
  originalDispatchId: string;
  driverId: string;
  vehicleId: string;
  dispatchTime: string;
  odometerOut: number;
  fuelLevelOut: string;
  conditionOut: string;
  corporateAccountId?: string;
  projectId?: string;
  expectedReturnDate: string;
  completedAt: string;
  tripLogId?: string;
}

export interface ActiveDispatch {
  id: string;
  driverId: string;
  vehicleId: string;
  dispatchTime: string; // ISO
  odometerOut: number;
  fuelLevelOut: string; // e.g. Full, 3/4, 1/2, 1/4, Empty
  conditionOut: string;
  expectedReturnDate: string;
  corporateAccountId?: string;
  projectId?: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  driverId?: string;
  startDate: string; // YYYY-MM-DD
  expectedCompletionDate?: string;
  completionDate?: string;
  issuesFound: string;
  cost: number;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  mechanicOrShop?: string;
  mechanicContact?: string;
  mechanicAddress?: string;
}

const initialDrivers: Driver[] = [
  { id: 'd1', name: 'Abdul Rahman', imgUrl: 'https://i.pravatar.cc/150?u=abdul', status: 'Active', licenseExpiry: '2028-01-15', awards: ['Driver of the Month - May 2026'] },
  { id: 'd2', name: 'Alhaji Bah', imgUrl: 'https://i.pravatar.cc/150?u=alhaji', status: 'Warning', licenseExpiry: '2026-07-10', awards: [] },
  { id: 'd3', name: 'Ibrahim Sesay', imgUrl: 'https://i.pravatar.cc/150?u=ibrahim', status: 'Active', licenseExpiry: '2026-11-20', awards: [] },
  { id: 'd4', name: 'Mohamed Kamara', imgUrl: 'https://i.pravatar.cc/150?u=mohamed', status: 'Warning', licenseExpiry: '2026-06-28', awards: [] },
  { id: 'd5', name: 'Samuel Koroma', imgUrl: 'https://i.pravatar.cc/150?u=samuel', status: 'Active', licenseExpiry: '2027-04-05', awards: [] }
];

const initialVehicles: Vehicle[] = [
  { id: 'v1', makeModel: 'Toyota Land Cruiser Prado', year: 2015, odometer: 154017, plateNumber: 'AVU 206', insuranceExpiry: '2027-04-03', condition: 'Excellent', isCompanyRegistered: true, type: 'SUV', status: 'Available' },
  { id: 'v2', makeModel: 'Toyota Land Cruiser', year: 2019, odometer: 139151, plateNumber: 'ISB 100', insuranceExpiry: '2027-05-03', condition: 'Excellent', isCompanyRegistered: true, type: 'SUV', status: 'Available' },
  { id: 'v3', makeModel: 'Toyota 4Runner (Big Boy)', year: 2018, odometer: 107639, plateNumber: 'MYB 001', insuranceExpiry: '2026-11-03', condition: 'Excellent', isCompanyRegistered: true, type: 'SUV', status: 'Available' },
  { id: 'v4', makeModel: 'Toyota Land Cruiser Prado', year: 2017, odometer: 173488, plateNumber: 'AVO 730', insuranceExpiry: '2027-05-03', condition: 'Excellent', isCompanyRegistered: true, type: 'SUV', status: 'Available' },
  { id: 'v5', makeModel: 'Toyota Land Cruiser Prado', year: 2017, odometer: 143011, plateNumber: 'AWT 070', insuranceExpiry: '2026-08-02', condition: 'Excellent', isCompanyRegistered: true, type: 'SUV', status: 'Available' },
  { id: 'v6', makeModel: 'Toyota Land Cruiser Prado', year: 2016, odometer: 146416, plateNumber: 'AWO 668', insuranceExpiry: '2027-06-03', condition: 'Excellent', isCompanyRegistered: true, type: 'SUV', status: 'Available' },
  { id: 'v7', makeModel: 'Toyota 4Runner Sports Edition', year: 2015, odometer: 100125, plateNumber: 'AUD 118', insuranceExpiry: '2026-08-02', condition: 'Excellent', isCompanyRegistered: true, type: 'SUV', status: 'Available' },
  { id: 'v8', makeModel: 'Toyota 4Runner / RAV4', year: 2014, odometer: 125689, plateNumber: 'AXG 234', insuranceExpiry: '2026-11-02', condition: 'Excellent', isCompanyRegistered: true, type: 'SUV', status: 'Available' },
  { id: 'v9', makeModel: 'Toyota 4Runner Sports Edition', year: 2015, odometer: 179665, plateNumber: 'AUL 390', insuranceExpiry: '2026-10-02', condition: 'Excellent', isCompanyRegistered: true, type: 'SUV', status: 'Available' },
  { id: 'v10', makeModel: 'Toyota 4Runner Sports Edition', year: 2014, odometer: 163481, plateNumber: 'AWI 242', insuranceExpiry: '2027-04-02', condition: 'Excellent', isCompanyRegistered: true, type: 'SUV', status: 'Available' }
];

const initialFuelSuppliers: FuelSupplier[] = [
  {
    id: 'fs1', name: 'NP', shortCode: 'NP', isPartner: true,
    contactPerson: 'Alhaji Koroma', phone: '+232 78 000 001', email: 'accounts@np-sl.com',
    website: 'https://www.np-sl.com', headOfficeAddress: '15 Siaka Stevens Street',
    city: 'Freetown', country: 'Sierra Leone',
    accountNumber: 'NP-BIG-001', contractRef: 'SLA/2024/NP/001',
    contractStartDate: '2024-01-01', contractEndDate: '2026-12-31',
    creditLimit: 50000000, notes: 'Primary partner supplier. Credit terms: 30 days.', createdAt: '2024-01-01',
  },
  {
    id: 'fs2', name: 'Malado', shortCode: 'MAL', isPartner: true,
    contactPerson: 'Fatmata Bah', phone: '+232 76 000 002', email: 'fleet@malado-energy.com',
    headOfficeAddress: '42 Wilberforce Street', city: 'Freetown', country: 'Sierra Leone',
    accountNumber: 'MAL-BIG-007', contractRef: 'SLA/2024/MAL/007',
    contractStartDate: '2024-03-01', contractEndDate: '2027-02-28',
    creditLimit: 30000000, notes: 'Secondary partner. Available in Bo, Kenema, and Makeni.', createdAt: '2024-03-01',
  },
  {
    id: 'fs3', name: 'TotalEnergies', shortCode: 'TE', isPartner: true,
    contactPerson: 'Mohamed Sesay', phone: '+232 77 000 003', email: 'corporate@total.sl',
    website: 'https://www.totalenergies.sl', headOfficeAddress: 'Tower Hill',
    city: 'Freetown', country: 'Sierra Leone',
    accountNumber: 'TE-CORP-2024', contractRef: 'SLA/2024/TE/003',
    contractStartDate: '2024-06-01', contractEndDate: '2026-05-31',
    notes: 'Freetown stations only.', createdAt: '2024-06-01',
  },
  {
    id: 'fs4', name: 'Other', shortCode: 'OTH', isPartner: false,
    notes: 'Ad-hoc purchases from non-partner stations. Requires justification.', createdAt: '2024-01-01',
  },
];

const MOCK_SUPPLIERS = ['NP', 'NP', 'Malado', 'Malado', 'TotalEnergies', 'Other'];
const MOCK_CITIES = ['Freetown', 'Bo', 'Kenema', 'Makeni', 'Freetown', 'Freetown'];
const MOCK_DISTRICTS = ['Western Area Urban', 'Bo District', 'Kenema District', 'Bombali District', 'Western Area Urban', 'Western Area Rural'];
const MOCK_REGIONS = ['Western Area', 'Southern Province', 'Eastern Province', 'Northern Province', 'Western Area', 'Western Area'];
const MOCK_PAYMENT: Array<'Fuel Card' | 'Voucher' | 'Mobile Money' | 'Cash'> = ['Fuel Card', 'Fuel Card', 'Voucher', 'Mobile Money', 'Cash', 'Fuel Card'];
const MOCK_FUEL_TYPES: Array<'Petrol' | 'Diesel' | 'Premium'> = ['Petrol', 'Diesel', 'Petrol', 'Petrol', 'Diesel', 'Premium'];

const generateMockLogs = (): TripLog[] => {
  const logs: TripLog[] = [];
  const drivers = ['d1', 'd2', 'd3', 'd4', 'd5'];
  const vehicles = ['v1', 'v2', 'v3', 'v4', 'v5'];
  
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const shuffledDrivers = [...drivers].sort(() => 0.5 - Math.random()).slice(0, 4);
    const shuffledVehicles = [...vehicles].sort(() => 0.5 - Math.random());
    
    shuffledDrivers.forEach((driverId, idx) => {
      const vehicleId = shuffledVehicles[idx];
      const fuelConsumed = Math.floor(Math.random() * 30) + 20;
      const hasTheft = Math.random() > 0.95;
      const numStops = Math.random() > 0.6 ? 2 : 1; // 40% chance of multi-stop

      const fuelCollections: FuelCollection[] = Array.from({ length: numStops }, (_, si) => {
        const supplierIdx = Math.floor(Math.random() * MOCK_SUPPLIERS.length);
        const supplier = MOCK_SUPPLIERS[supplierIdx];
        const isPartner = supplier !== 'Other';
        const cityIdx = Math.floor(Math.random() * MOCK_CITIES.length);
        const payIdx = Math.floor(Math.random() * MOCK_PAYMENT.length);
        const stopLiters = si === 0 ? Math.floor(fuelConsumed * 0.6) : Math.ceil(fuelConsumed * 0.4);
        return {
          id: `fuel-${Date.now()}-${Math.random()}-${si}`,
          date: dateStr,
          time: `${8 + si * 3}:${si === 0 ? '30' : '00'}`,
          stationName: `${supplier} ${MOCK_CITIES[cityIdx]} Station`,
          supplier,
          isPartnerStation: isPartner,
          location: MOCK_CITIES[cityIdx],
          district: MOCK_DISTRICTS[cityIdx],
          region: MOCK_REGIONS[cityIdx],
          liters: hasTheft && si === 0 ? stopLiters + Math.floor(Math.random() * 10) + 5 : stopLiters,
          costPerLiter: 15.5,
          totalAmount: stopLiters * 15.5,
          fuelType: MOCK_FUEL_TYPES[Math.floor(Math.random() * MOCK_FUEL_TYPES.length)],
          paymentMethod: isPartner ? MOCK_PAYMENT[payIdx] : 'Mobile Money',
          receiptNumber: `REC-${Math.floor(Math.random() * 10000)}`,

          nonPartnerReason: !isPartner ? 'No partner station available in area' : undefined,
          remarks: si === 1 ? 'Stop during return journey' : undefined,
        };
      });
      
      logs.push({
        id: uuidv4(),
        date: dateStr,
        driverId,
        vehicleId,
        distanceTraveledKm: Math.floor(Math.random() * 150) + 50,
        fuelConsumedLiters: fuelConsumed,
        fuelIssuedLiters: hasTheft ? fuelConsumed + Math.floor(Math.random() * 10) + 5 : fuelConsumed,
        fuelCostPerLiter: 15.5,
        incidents: Math.random() > 0.95 ? 1 : 0,
        speedingEvents: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
        harshBraking: Math.random() > 0.8 ? 1 : 0,
        idlingTimeHours: Number((Math.random() * 2).toFixed(1)),
        routeDeviations: Math.random() > 0.9 ? 1 : 0,
        policyViolations: Math.random() > 0.95 ? 1 : 0,
        maintenanceIssuesLogged: Math.random() > 0.98,
        fuelCollections,
      });
    });
  }
  return logs;
};

export const initialLogs = generateMockLogs();


export const parseReceipt = (receipt?: string) => {
  if (!receipt) return { text: '', url: '' };
  const parts = receipt.split('|URL:');
  if (parts.length === 1 && receipt.startsWith('URL:')) return { text: '', url: receipt.replace('URL:', '') };
  return { text: parts[0] || '', url: parts.length > 1 ? parts.slice(1).join('|URL:') : '' };
};

export const PerformanceSection: React.FC<{ clients?: any[], defaultTab?: string, userRole?: string }> = ({ clients = [], defaultTab, userRole = 'super_admin' }) => {
  const [activeTab, _setActiveTab] = useState<'dashboard' | 'dispatch' | 'maintenance' | 'logs' | 'drivers' | 'driver_details' | 'vehicles' | 'leaderboard' | 'fuel'>(() => {
    // Maintenance Managers always land on the maintenance tab
    if (userRole === 'maintenance_logs') return 'maintenance';
    if (defaultTab) return defaultTab as any;
    const saved = sessionStorage.getItem('adminActiveTab');
    if (saved === 'scoring') return 'leaderboard';
    return (saved as any) || 'dashboard';
  });

  const setActiveTab = (tab: any) => {
    sessionStorage.setItem('adminActiveTab', tab);
    _setActiveTab(tab);
  };

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab as any);
    }
  }, [defaultTab]);
  
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);
  const [dispatchSubTab, setDispatchSubTab] = useState<'active' | 'completed' | 'logs'>('active');
  const [dispatchSearchQuery, setDispatchSearchQuery] = useState('');
  const [dispatchFilter, setDispatchFilter] = useState<'all' | 'overdue'>('all');
  const [dispatchFilterDriver, setDispatchFilterDriver] = useState('All');
  const [dispatchFilterVehicle, setDispatchFilterVehicle] = useState('All');
  const [dispatchDateFrom, setDispatchDateFrom] = useState('');
  const [dispatchDateTo, setDispatchDateTo] = useState('');
  const [dispatchSortConfig, setDispatchSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'dispatchTime', direction: 'desc' });
  const [dispatchFiltersOpen, setDispatchFiltersOpen] = useState(false);
  
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState('All');
  const [driverSortConfig, setDriverSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  // Document Dropdowns
  const [activeDocDropdown, setActiveDocDropdown] = useState<string | null>(null);
  const [headerDocDropdownOpen, setHeaderDocDropdownOpen] = useState(false);
  
  // Audit Modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const handleAuditStatusUpdate = async (driverId: string, newStatus: string, reason: string) => {
    const { error } = await supabase.from('drivers').update({ status: newStatus }).eq('id', driverId);
    if (error) {
      alert(`Error updating driver status: ${error.message}`);
      return;
    }
    
    // Create status log
    await supabase.from('driver_status_logs').insert({
      driver_id: driverId,
      status: newStatus,
      reason: reason
    });

    // Update local state
    setDrivers(prev => prev.map(d => 
      d.id === driverId 
        ? { ...d, status: newStatus, statusReason: reason } 
        : d
    ));
    
    // Refresh active logs if possible (just forcing a reload by calling loadInitialData would work but it might be heavy. local update is usually enough)
  };

  // Fuel Module Filters
  const [fuelSearchQuery, setFuelSearchQuery] = useState('');
  const [fuelSortBy, setFuelSortBy] = useState<'date_desc' | 'date_asc' | 'liters_desc' | 'liters_asc' | 'cost_desc' | 'cost_asc'>('date_desc');
  const [fuelDriverFilter, setFuelDriverFilter] = useState('all');
  const [fuelSupplierFilter, setFuelSupplierFilter] = useState('all');
  const [fuelPaymentFilter, setFuelPaymentFilter] = useState('all');
  const [fuelFuelTypeFilter, setFuelFuelTypeFilter] = useState('all');
  const [fuelViewMode, setFuelViewMode] = useState<'grid' | 'list'>('list');
  const [fuelPartnerFilter, setFuelPartnerFilter] = useState<string>('all');
  const [fuelCityFilter, setFuelCityFilter] = useState('all');
  const [fuelDateFrom, setFuelDateFrom] = useState('');
  const [fuelDateTo, setFuelDateTo] = useState('');
  const [fuelPage, setFuelPage] = useState(0);
  const [fuelFiltersOpen, setFuelFiltersOpen] = useState(false);
  const [fuelSubTab, setFuelSubTab] = useState<'overview' | 'fuel' | 'settings'>('overview');
  
  // Fuel Stations & Cities
  const [fuelCities, setFuelCities] = useState<FuelCity[]>([]);
  const [fuelStations, setFuelStations] = useState<FuelStation[]>([]);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<Partial<FuelCity>>({});
  const [editingStation, setEditingStation] = useState<Partial<FuelStation>>({});

  // Fuel Supplier CRUD
  const fuelSuppliers = React.useMemo<FuelSupplier[]>(() => {
    if (!clients || clients.length === 0) return initialFuelSuppliers;
    return clients.map(c => ({
      id: c.id,
      name: c.name,
      isPartner: true,
      status: c.status === 'Ongoing' ? 'Active' : ('Inactive' as 'Active' | 'Inactive'),
      shortCode: c.name.substring(0, 3).toUpperCase(),
    }));
  }, [clients]);
  const setFuelSuppliers = (action: any) => { alert("Projects are now managed directly from the 'Partners & Clients' tab. Any changes made there will reflect here automatically."); setIsFuelSupplierModalOpen(false); setEditingFuelSupplier(null); };
  const [isFuelSupplierModalOpen, setIsFuelSupplierModalOpen] = useState(false);
  const [editingFuelSupplier, setEditingFuelSupplier] = useState<Partial<FuelSupplier> | null>(null);
  
  const [drivers, _setDrivers] = useState<Driver[]>([]);
  const [vehicles, _setVehicles] = useState<Vehicle[]>([]);
  const [logs, _setLogs] = useState<TripLog[]>([]);
  const [activeDispatches, _setActiveDispatches] = useState<ActiveDispatch[]>([]);
  const [maintenanceRecords, _setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [serverDriverScores, setServerDriverScores] = useState<any[]>([]);
  const [awardModal, setAwardModal] = useState<{ driverId: string; driverName: string } | null>(null);
  const [awardType, setAwardType] = useState('Driver of the Month');
  const [awardNote, setAwardNote] = useState('');
  const [awardSaving, setAwardSaving] = useState(false);
  const [awardSuccess, setAwardSuccess] = useState(false);
  const [awardPeriod, setAwardPeriod] = useState<string>(() =>
    new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  );
  const [hofFilter, setHofFilter] = useState<string>('All Time');

  // Leaderboard Filters & Sorting
  const [leaderboardPeriodType, setLeaderboardPeriodType] = useState<'Rolling' | 'Month' | 'Year' | 'All Time'>('Rolling');
  const [leaderboardPeriodValue, setLeaderboardPeriodValue] = useState<string>('Monthly');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [leaderboardStatus, setLeaderboardStatus] = useState<'all' | 'eligible' | 'disqualified'>('all');
  const [leaderboardSortField, setLeaderboardSortField] = useState<'score' | 'trips' | 'distance' | 'efficiency' | 'incidents' | 'variance' | 'name'>('score');
  const [leaderboardSortDirection, setLeaderboardSortDirection] = useState<'asc' | 'desc'>('desc');

  const [allStatusLogs, setAllStatusLogs] = useState<DriverStatusLog[]>([]);

  // Initialize data from Supabase
  React.useEffect(() => {
    const fetchData = async () => {
      const [driversRes, vehiclesRes, dispatchesRes, maintenanceRes, tripLogsRes, scoresRes, statusLogsRes, completedDispRes, fuelCitiesRes, fuelStationsRes] = await Promise.all([
        supabase.from('drivers').select('*, driver_documents(*)'),
        supabase.from('vehicles').select('*'),
        supabase.from('active_dispatches').select('*'),
        supabase.from('maintenance_records').select('*'),
        supabase.from('trip_logs').select('*, fuel_collections(*)'),
        supabase.rpc('get_driver_scores'),
        supabase.from('driver_status_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('completed_dispatches').select('*').order('completed_at', { ascending: false }),
        supabase.from('fuel_cities').select('*').order('name'),
        supabase.from('fuel_stations').select('*').order('name')
      ]);

      setFuelCities(fuelCitiesRes.data || []);
      setFuelStations(fuelStationsRes.data || []);

      // Map status logs first so we can attach them to drivers
      const mappedStatusLogs: DriverStatusLog[] = (statusLogsRes.data || []).map((l: any) => ({
        id: l.id,
        driverId: l.driver_id,
        status: l.status,
        reason: l.reason,
        recordedBy: l.recorded_by,
        createdAt: l.created_at,
      }));
      setAllStatusLogs(mappedStatusLogs);

      if (driversRes.data) _setDrivers(driversRes.data.map(d => {
        const driverLogs = mappedStatusLogs.filter(l => l.driverId === d.id);
        const suspensionCount = driverLogs.filter(l => l.status === 'Suspended').length;
        return {
          id: d.id, name: d.name, imgUrl: d.img_url, status: d.status, licenseExpiry: d.license_expiry, awards: d.awards,
          phone: d.phone, email: d.email, address: d.address, dateOfBirth: d.date_of_birth, nationality: d.nationality,
          nationalId: d.national_id,
          licenseNumber: d.license_number,
          licenseType: d.license_type,
          statusReason: d.status_reason,
          nextOfKinName: d.next_of_kin_name, nextOfKinPhone: d.next_of_kin_phone, nextOfKinRelationship: d.next_of_kin_relationship,
          emergencyContactName: d.emergency_contact_name, emergencyContactPhone: d.emergency_contact_phone,
          statusLogs: driverLogs,
          suspensionCount,
          documents: Array.isArray(d.driver_documents)
            ? d.driver_documents.map((dd: any) => ({
                id: dd.id,
                driverId: dd.driver_id,
                docType: dd.doc_type,
                label: dd.label,
                fileUrl: dd.file_url,
                fileName: dd.file_name,
              }))
            : [],
        };
      }));

      if (vehiclesRes.data) _setVehicles(vehiclesRes.data.map(v => ({
        id: v.id, makeModel: v.make_model, year: v.year, odometer: v.odometer || 0, plateNumber: v.plate_number,
        insuranceExpiry: v.insurance_expiry, condition: v.condition, isCompanyRegistered: v.is_company_registered,
        type: v.type || 'SUV', status: v.status,   // #17 fix: was always hardcoded 'SUV'
        showOnFleet: v.show_on_fleet, vehicleCategory: v.vehicle_category, description: v.description,
        pricePerDay: v.price_per_day, features: v.features, fuelType: v.fuel_type, transmission: v.transmission,
        seats: v.seats, engineLabel: v.engine_label, imageUrl: v.image_url, galleryUrls: v.gallery_urls
      })));

      if (dispatchesRes.data) _setActiveDispatches(dispatchesRes.data.map(d => ({
        id: d.id, driverId: d.driver_id, vehicleId: d.vehicle_id, corporateAccountId: d.corporate_account_id, projectId: d.project_id,
        dispatchTime: d.dispatch_time, odometerOut: Number(d.odometer_out || 0), fuelLevelOut: d.fuel_level_out,
        conditionOut: d.condition_out, expectedReturnDate: d.expected_return_date
      })));

      if (maintenanceRes.data) _setMaintenanceRecords(maintenanceRes.data.map(m => ({
        id: m.id, vehicleId: m.vehicle_id, driverId: m.driver_id, startDate: m.start_date, expectedCompletionDate: m.expected_completion_date,
        completionDate: m.completion_date || undefined,
        issuesFound: m.issues_found, cost: Number(m.cost || 0), status: m.status, mechanicOrShop: m.mechanic_or_shop,
        mechanicContact: m.mechanic_contact, mechanicAddress: m.mechanic_address
      })));

      if (tripLogsRes.data) _setLogs(tripLogsRes.data.map(l => ({
        id: l.id, date: l.date, driverId: l.driver_id, vehicleId: l.vehicle_id, corporateAccountId: l.corporate_account_id, district: l.district,
        distanceTraveledKm: Number(l.distance_traveled_km || 0), fuelConsumedLiters: Number(l.fuel_consumed_liters || 0),
        incidents: l.incidents || 0, speedingEvents: l.speeding_events || 0, harshBraking: l.harsh_braking || 0, idlingTimeHours: Number(l.idling_time_hours || 0),
        routeDeviations: l.route_deviations || 0, policyViolations: l.policy_violations || 0,
        maintenanceIssuesLogged: !!l.maintenance_issues_logged,
        notes: l.notes || '',
        // #22 fix: map linked IDs so badges persist across page loads
        dispatchId: l.dispatch_id || undefined,
        maintenanceRecordId: l.maintenance_record_id || undefined,
        fuelCollections: Array.isArray(l.fuel_collections) ? l.fuel_collections.map((fc: any) => ({
           id: fc.id,
           stationName: fc.station_name,
           supplier: fc.supplier || undefined,
           isPartnerStation: fc.is_partner_station != null ? !!fc.is_partner_station : undefined,
           location: fc.location,
           district: fc.district || undefined,
           region: fc.region || undefined,
           liters: Number(fc.liters || 0),
           costPerLiter: Number(fc.cost_per_liter || 0),
           totalAmount: fc.total_amount ? Number(fc.total_amount) : undefined,
           fuelType: fc.fuel_type || undefined,
           paymentMethod: fc.payment_method || undefined,
           receiptNumber: fc.receipt_number || undefined,
           time: fc.time || undefined,
           nonPartnerReason: fc.non_partner_reason || undefined,
           remarks: fc.remarks || undefined,
        })) : [],
        legs: Array.isArray(l.legs) ? l.legs : typeof l.legs === 'string' ? JSON.parse(l.legs) : undefined,
        passengers: Array.isArray(l.passengers) ? l.passengers : typeof l.passengers === 'string' ? JSON.parse(l.passengers) : undefined,
        projectCode: l.project_code || undefined,
        approvalStatus: l.approval_status || undefined,
        approvedBy: l.approved_by || undefined,
        approvedAt: l.approved_at || undefined,
        approvalNotes: l.approval_notes ? l.approval_notes.split('||SIG||')[0] : undefined,
        approvalSignature: l.approval_notes && l.approval_notes.includes('||SIG||') ? l.approval_notes.split('||SIG||')[1] : undefined,
        fuelIssuedLiters: Number(l.fuel_issued_liters || 0), fuelCostPerLiter: Number(l.fuel_cost_per_liter || 0)
      })));

      // #21 fix: load completed dispatches archive from DB
      if (completedDispRes.data && !completedDispRes.error) {
        setCompletedDispatches(completedDispRes.data.map((cd: any) => ({
          id: cd.id,
          originalDispatchId: cd.original_dispatch_id,
          driverId: cd.driver_id,
          vehicleId: cd.vehicle_id,
          dispatchTime: cd.dispatch_time,
          odometerOut: Number(cd.odometer_out || 0),
          fuelLevelOut: cd.fuel_level_out || '',
          conditionOut: cd.condition_out || '',
          corporateAccountId: cd.corporate_account_id,
          projectId: cd.project_id,
          expectedReturnDate: cd.expected_return_date || '',
          completedAt: cd.completed_at,
          tripLogId: cd.trip_log_id,
        })));
      }

      if (scoresRes.data) {
        setServerDriverScores(scoresRes.data);
      }
    };
    fetchData();

    // ── Real-time subscriptions: all admin tables update instantly across all devices
    const realtimeTables = [
      'drivers',
      'vehicles',
      'trip_logs',
      'active_dispatches',
      'maintenance_records',
      'completed_dispatches',
      'driver_status_logs',
      'fuel_cities',
      'fuel_stations',
      'driver_documents',
    ];
    const realtimeChannels = realtimeTables.map(table =>
      supabase.channel(`perf:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          fetchData();
        })
        .subscribe()
    );

    return () => {
      realtimeChannels.forEach(ch => supabase.removeChannel(ch));
    };
  }, []);

  // Intercepting State Updates for Cloud Sync
  const setDrivers = (action: React.SetStateAction<Driver[]>) => {
    _setDrivers(prev => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      handleSupabaseSync('drivers', prev, next, d => ({
        id: d.id, name: d.name, img_url: d.imgUrl, status: d.status, status_reason: d.statusReason, license_expiry: d.licenseExpiry, awards: d.awards,
        phone: d.phone, email: d.email, address: d.address, date_of_birth: d.dateOfBirth || null, nationality: d.nationality,
        national_id: d.nationalId, license_number: d.licenseNumber, license_type: d.licenseType,
        next_of_kin_name: d.nextOfKinName, next_of_kin_phone: d.nextOfKinPhone, next_of_kin_relationship: d.nextOfKinRelationship,
        emergency_contact_name: d.emergencyContactName, emergency_contact_phone: d.emergencyContactPhone
      }));
      return next;
    });
  };

  const setVehicles = (action: React.SetStateAction<Vehicle[]>) => {
    _setVehicles(prev => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      handleSupabaseSync('vehicles', prev, next, v => ({
        id: v.id, make_model: v.makeModel, year: v.year, odometer: v.odometer, plate_number: v.plateNumber, status: v.status,
        insurance_expiry: v.insuranceExpiry, condition: v.condition, is_company_registered: v.isCompanyRegistered,
        show_on_fleet: v.showOnFleet, vehicle_category: v.vehicleCategory, description: v.description,
        price_per_day: v.pricePerDay, features: v.features, fuel_type: v.fuelType, transmission: v.transmission,
        seats: v.seats, engine_label: v.engineLabel, image_url: v.imageUrl, gallery_urls: v.galleryUrls, vehicle_type: v.type,
        spec_engine_size: v.specEngineSize, spec_drivetrain: v.specDrivetrain, spec_ground_clearance: v.specGroundClearance,
        spec_fuel_capacity: v.specFuelCapacity, spec_best_for: v.specBestFor
      }));
      return next;
    });
  };

  const setActiveDispatches = (action: React.SetStateAction<ActiveDispatch[]>) => {
    _setActiveDispatches(prev => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      handleSupabaseSync('active_dispatches', prev, next, d => ({
        id: d.id, driver_id: d.driverId, vehicle_id: d.vehicleId, corporate_account_id: d.corporateAccountId, project_id: d.projectId,
        dispatch_time: d.dispatchTime, odometer_out: d.odometerOut, fuel_level_out: d.fuelLevelOut,
        condition_out: d.conditionOut, expected_return_date: d.expectedReturnDate
      }));
      return next;
    });
  };

  const setMaintenanceRecords = (action: React.SetStateAction<MaintenanceRecord[]>) => {
    _setMaintenanceRecords(prev => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      handleSupabaseSync('maintenance_records', prev, next, m => ({
        id: m.id, vehicle_id: m.vehicleId, driver_id: m.driverId || null, start_date: m.startDate, expected_completion_date: m.expectedCompletionDate,
        completion_date: m.completionDate || null,
        issues_found: m.issuesFound, cost: m.cost, status: m.status, mechanic_or_shop: m.mechanicOrShop,
        mechanic_contact: m.mechanicContact, mechanic_address: m.mechanicAddress
      }));
      return next;
    });
  };

  const setLogs = (action: React.SetStateAction<TripLog[]>) => {
    _setLogs(prev => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      handleSupabaseSync('trip_logs', prev, next, l => ({
        id: l.id, date: l.date, driver_id: l.driverId, vehicle_id: l.vehicleId, corporate_account_id: l.corporateAccountId, district: l.district || null,
        distance_traveled_km: l.distanceTraveledKm, fuel_consumed_liters: l.fuelConsumedLiters, incidents: l.incidents,
        speeding_events: l.speedingEvents, harsh_braking: l.harshBraking, idling_time_hours: l.idlingTimeHours,
        route_deviations: l.routeDeviations, policy_violations: l.policyViolations, maintenance_issues_logged: l.maintenanceIssuesLogged,
        notes: l.notes, project_code: l.projectCode || null,
        approval_status: l.approvalStatus || 'Pending', approved_by: l.approvedBy || null,
        approved_at: l.approvedAt || null, 
        approval_notes: (l.approvalNotes || '') + (l.approvalSignature ? `||SIG||${l.approvalSignature}` : '') || null,
        legs: l.legs ? JSON.stringify(l.legs) : null,
        passengers: l.passengers ? JSON.stringify(l.passengers) : null,
        dispatch_id: l.dispatchId || null,
        fuel_issued_liters: l.fuelIssuedLiters || null,
        fuel_cost_per_liter: l.fuelCostPerLiter || null,
      }));
      return next;
    });
  };

  // ── Approval Action Handlers ──────────────────────────
  const [approvingLogId, setApprovingLogId] = useState<string | null>(null);
  const [flaggingLogId, setFlaggingLogId] = useState<string | null>(null);
  const [flagNoteInput, setFlagNoteInput] = useState('');
  // Approval Modal State
  const [approvalModalLogId, setApprovalModalLogId] = React.useState<string | null>(null);
  const [approvalApproverName, setApprovalApproverName] = React.useState('');
  const [approvalNoteInput, setApprovalNoteInput] = React.useState('');
  const [approvalSignatureData, setApprovalSignatureData] = React.useState<string | null>(null);
  const [approvalSignatureMode, setApprovalSignatureMode] = React.useState<'draw' | 'upload'>('draw');
  const approvalCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const approvalIsDrawingRef = React.useRef(false);
  const getApprovalCanvasPos = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };
  const startApprovalDraw = (e: any) => {
    e.preventDefault(); const canvas = approvalCanvasRef.current; if (!canvas) return;
    approvalIsDrawingRef.current = true;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const pos = getApprovalCanvasPos(e, canvas); ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
  };
  const continueApprovalDraw = (e: any) => {
    e.preventDefault(); if (!approvalIsDrawingRef.current) return;
    const canvas = approvalCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const pos = getApprovalCanvasPos(e, canvas);
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#1e3a5f';
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
  };
  const endApprovalDraw = () => {
    approvalIsDrawingRef.current = false;
    const canvas = approvalCanvasRef.current;
    if (canvas) setApprovalSignatureData(canvas.toDataURL());
  };
  const clearApprovalCanvas = () => {
    const canvas = approvalCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setApprovalSignatureData(null);
  };

  const handleApproveLog = (logId: string, approverName: string, notes: string, sigData: string | null) => {
    setLogs(prev => prev.map(l => l.id === logId
      ? { ...l, approvalStatus: 'Approved', approvedBy: approverName || 'Admin', approvedAt: new Date().toISOString(), approvalNotes: notes || undefined, approvalSignature: sigData || undefined }
      : l
    ));
    setApprovalModalLogId(null); setApprovalApproverName(''); setApprovalNoteInput(''); setApprovalSignatureData(null); setApprovingLogId(null);
  };

  const handleFlagLog = (logId: string, note: string) => {
    setLogs(prev => prev.map(l => l.id === logId
      ? { ...l, approvalStatus: 'Flagged', approvedBy: 'Admin', approvedAt: new Date().toISOString(), approvalNotes: note }
      : l
    ));
    setFlaggingLogId(null);
    setFlagNoteInput('');
  };


  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');

  // Logs Filtering & Sorting State
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logFilterDriver, setLogFilterDriver] = useState('All');
  const [logFilterVehicle, setLogFilterVehicle] = useState('All');
  const [logSortConfig, setLogSortConfig] = useState<{ key: keyof TripLog, direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [logDateFrom, setLogDateFrom] = useState('');
  const [logDateTo, setLogDateTo] = useState('');
  const [logFiltersOpen, setLogFiltersOpen] = useState(false);
  const [activeLogMenu, setActiveLogMenu] = useState<string | null>(null);

  // Vehicles Filtering & Sorting State
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [vehicleFilterStatus, setVehicleFilterStatus] = useState('All');
  const [vehicleSortConfig, setVehicleSortConfig] = useState<{ key: keyof Vehicle, direction: 'asc' | 'desc' }>({ key: 'makeModel', direction: 'asc' });
  const [vehicleViewMode, setVehicleViewMode] = useState<'list' | 'grid'>('list');

  // Dashboard Aggregates
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const daysToSubtract = timeframe === 'Daily' ? 1 : timeframe === 'Weekly' ? 7 : 30;
    const cutoff = new Date(now.setDate(now.getDate() - daysToSubtract)).toISOString().split('T')[0];
    return logs.filter(l => l.date >= cutoff);
  }, [logs, timeframe]);

  const totalDistance = filteredLogs.reduce((acc, l) => acc + l.distanceTraveledKm, 0);
  const totalFuel = filteredLogs.reduce((acc, l) => acc + l.fuelConsumedLiters, 0);
  const avgEfficiency = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(1) : "0.0";
  const totalIncidents = filteredLogs.reduce((acc, l) => acc + l.incidents, 0);

  const allFuelCollections = useMemo(() => {
    return filteredLogs.flatMap(log => (log.fuelCollections || []).map(fc => ({
      ...fc,
      tripLogId: log.id,
      date: fc.date || log.date,
      driverId: fc.driverId || log.driverId,
      vehicleId: fc.vehicleId || log.vehicleId,
    })));
  }, [filteredLogs]);

  // Completed dispatches archive
  const [completedDispatches, setCompletedDispatches] = useState<CompletedDispatch[]>([]);

  // When opening maintenance modal from a trip log row, store the tripLogId + vehicleId
  const [maintenanceFromTripLog, setMaintenanceFromTripLog] = useState<{ tripLogId: string; vehicleId: string } | null>(null);

  // #24 Trip log delete confirmation (separate from status log delete at line 476)
  const [deletingTripLogId, setDeletingTripLogId] = useState<string | null>(null);

  // #14 Trip log pagination
  const [logPage, setLogPage] = useState(0);
  const LOG_PAGE_SIZE = 50;

  // Modals State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [viewingLog, setViewingLog] = useState<TripLog | null>(null);
  const [editingLog, setEditingLog] = useState<Partial<TripLog> | null>(null);
  const [editingFuelCollections, setEditingFuelCollections] = useState<Partial<FuelCollection>[]>([]);
  const [editingTripLegs, setEditingTripLegs] = useState<Partial<TripLeg>[]>([]);
  const [editingPassengers, setEditingPassengers] = useState<Partial<Passenger>[]>([]);
  const [isFuelTransactionsExpanded, setIsFuelTransactionsExpanded] = useState(true);
  const [isTripLegsExpanded, setIsTripLegsExpanded] = useState(true);
  const [minimizedFuelStops, setMinimizedFuelStops] = useState<Record<string, boolean>>({});
  const [minimizedTripLegs, setMinimizedTripLegs] = useState<Record<string, boolean>>({});
  const [odometerWarnings, setOdometerWarnings] = useState<Record<number, string>>({});
  const [returningDispatchId, setReturningDispatchId] = useState<string | null>(null);
  const [returningDispatch, setReturningDispatch] = useState<ActiveDispatch | null>(null);

  // Standalone fuel entry modal (separate from trip log form)
  const [standaloneFuelReceiptFile, setStandaloneFuelReceiptFile] = useState<File | null>(null);
  const [isUploadingFuel, setIsUploadingFuel] = useState(false);
  const [isStandaloneFuelModalOpen, setIsStandaloneFuelModalOpen] = useState(false);
  const [standaloneFuelEntry, setStandaloneFuelEntry] = useState<Partial<FuelCollection>>({
    id: '', stationName: '', supplier: 'NP', isPartnerStation: true, location: '',
    liters: 0, costPerLiter: 15.5, paymentMethod: 'Fuel Card',
    date: new Date().toISOString().split('T')[0], time: '',
    fuelType: 'Diesel',
  });
  const [standaloneFuelDriverId, setStandaloneFuelDriverId] = useState('');
  const [standaloneFuelVehicleId, setStandaloneFuelVehicleId] = useState('');
  const [standaloneFuelTripLogId, setStandaloneFuelTripLogId] = useState('');

  // Fuel Log detail view, delete confirmation & three-dot menu
  const [viewingFuelCollection, setViewingFuelCollection] = useState<FuelCollection | null>(null);
  const [isExportingModal, setIsExportingModal] = useState(false);
  const [deletingFuelCollection, setDeletingFuelCollection] = useState<FuelCollection | null>(null);
  const [openFuelMenuId, setOpenFuelMenuId] = useState<string | null>(null);
  const [fuelMenuPos, setFuelMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [fuelMenuEntry, setFuelMenuEntry] = useState<FuelCollection | null>(null);

  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState<Partial<ActiveDispatch | CompletedDispatch> | null>(null);
  const [dispatchBillingMode, setDispatchBillingMode] = useState<'project' | 'corporate'>('project');
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Partial<MaintenanceRecord> | null>(null);
  const [viewingMaintenance, setViewingMaintenance] = useState<MaintenanceRecord | null>(null);
  const [maintSearchQuery, setMaintSearchQuery] = useState('');
  const [maintStatusFilter, setMaintStatusFilter] = useState('all');
  const [maintCurrentPage, setMaintCurrentPage] = useState(1);
  const [maintSortBy, setMaintSortBy] = useState<'date_desc' | 'date_asc' | 'cost_desc' | 'cost_asc'>('date_desc');
  const [maintDateFrom, setMaintDateFrom] = useState('');
  const [maintDateTo, setMaintDateTo] = useState('');
  const [maintViewMode, setMaintViewMode] = useState<'grid' | 'list'>('list');

  // Maintenance computed values (must live at component level – hooks can't be inside renderX functions)
  const filteredMaintenanceRecords = useMemo(() => {
    let filtered = maintenanceRecords.filter(m => {
      const vehicle = vehicles.find(v => v.id === m.vehicleId);
      const driver = drivers.find(d => d.id === m.driverId);
      if (maintSearchQuery) {
        const q = maintSearchQuery.toLowerCase();
        if (!(vehicle?.makeModel || '').toLowerCase().includes(q) && !(vehicle?.plateNumber || '').toLowerCase().includes(q) && !(m.issuesFound || '').toLowerCase().includes(q) && !(driver?.name || '').toLowerCase().includes(q)) return false;
      }
      if (maintStatusFilter !== 'all' && m.status !== maintStatusFilter) return false;
      if (maintDateFrom && m.startDate < maintDateFrom) return false;
      if (maintDateTo && m.startDate > maintDateTo) return false;
      return true;
    });
    filtered.sort((a, b) => {
      if (maintSortBy === 'date_desc') return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      if (maintSortBy === 'date_asc') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (maintSortBy === 'cost_desc') return b.cost - a.cost;
      if (maintSortBy === 'cost_asc') return a.cost - b.cost;
      return 0;
    });
    return filtered;
  }, [maintenanceRecords, vehicles, drivers, maintSearchQuery, maintStatusFilter, maintSortBy, maintDateFrom, maintDateTo]);

  const upcomingMaintenance = useMemo(() => {
    const result: { vehicle: Vehicle, record: MaintenanceRecord, days: number }[] = [];
    const todayMs = new Date().getTime();
    maintenanceRecords.forEach(r => {
      if (r.status === 'Scheduled' && r.startDate) {
        const start = new Date(r.startDate).getTime();
        const diffDays = Math.ceil((start - todayMs) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          const v = vehicles.find(v => v.id === r.vehicleId);
          if (v) result.push({ vehicle: v, record: r, days: diffDays });
        }
      }
    });
    return result.sort((a, b) => a.days - b.days);
  }, [maintenanceRecords, vehicles]);

  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Partial<Driver> | null>(null);

  const [activeMaintenanceMenu, setActiveMaintenanceMenu] = useState<string | null>(null);

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(null);
  const [isVehicleReadOnly, setIsVehicleReadOnly] = useState(false);
  const [activeVehicleMenu, setActiveVehicleMenu] = useState<string | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);

  const [selectedDriverScorecard, setSelectedDriverScorecard] = useState<string | null>(null);

  const [selectedDispatchDetailsId, setSelectedDispatchDetailsId] = useState<string | null>(null);

  // Status log inline edit state
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingLogForm, setEditingLogForm] = useState<{ status: string; reason: string }>({ status: '', reason: '' });
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);

  // Scoring Engine
  const leaderboardLogs = useMemo(() => {
    if (leaderboardPeriodType === 'Rolling') {
      return filteredLogs;
    }
    if (leaderboardPeriodType === 'All Time') {
      return logs;
    }
    return logs.filter(l => {
      const d = new Date(l.date);
      if (leaderboardPeriodType === 'Year') {
        return d.getFullYear().toString() === leaderboardPeriodValue;
      }
      if (leaderboardPeriodType === 'Month') {
        const logMonth = d.toLocaleString('default', { month: 'long', year: 'numeric' });
        return logMonth === leaderboardPeriodValue;
      }
      return true;
    });
  }, [logs, filteredLogs, leaderboardPeriodType, leaderboardPeriodValue]);

  const driverScores = useMemo(() => {
    return drivers.map(driver => {
      const driverLogs = filteredLogs.filter(l => l.driverId === driver.id);
      
      let score = 100;
      let totalDistance = 0;
      let totalConsumed = 0;
      let totalIssued = 0;
      let cost = 0;
      let incidents = 0;
      let policyViolations = 0;
      let routeDeviations = 0;
      let speeding = 0;
      let idling = 0;
      let varianceWarnings = 0;

      driverLogs.forEach(l => {
        const tripFuelIssued = l.fuelCollections ? l.fuelCollections.reduce((sum, fc) => sum + fc.liters, 0) : (l.fuelIssuedLiters || 0);
        const tripFuelCost = l.fuelCollections ? l.fuelCollections.reduce((sum, fc) => sum + (fc.liters * fc.costPerLiter), 0) : ((l.fuelIssuedLiters || 0) * (l.fuelCostPerLiter || 0));

        totalDistance += l.distanceTraveledKm;
        totalConsumed += l.fuelConsumedLiters;
        totalIssued += tripFuelIssued;
        cost += tripFuelCost;
        incidents += l.incidents;
        policyViolations += l.policyViolations || 0;
        routeDeviations += l.routeDeviations || 0;
        speeding += l.speedingEvents;
        idling += l.idlingTimeHours;
        
        // 10% threshold for variance
        const hasVariance = tripFuelIssued > l.fuelConsumedLiters * 1.1; 
        if (hasVariance) varianceWarnings++;
        
        score -= (l.incidents * 20);
        score -= ((l.policyViolations || 0) * 5);
        score -= ((l.routeDeviations || 0) * 5);
        score -= (l.speedingEvents * 2);
        score -= (l.harshBraking * 2);
        score -= (l.idlingTimeHours * 1);
        if (hasVariance) score -= 15;
      });

      if (driverLogs.length > 0) {
        const efficiency = totalConsumed > 0 ? totalDistance / totalConsumed : 0;
        if (efficiency > 10) score += 5;
      }

      return {
        driver,
        score: driverLogs.length === 0 ? 0 : Math.max(0, Math.round(score)),
        trips: driverLogs.length,
        totalDistance,
        efficiency: totalConsumed > 0 ? (totalDistance / totalConsumed).toFixed(1) : '0.0',
        varianceWarnings,
        cost,
        incidents,
        policyViolations,
        routeDeviations,
        speeding,
        idling
      };
    }).sort((a, b) => b.score - a.score);
  }, [drivers, filteredLogs]);

  const leaderboardScores = useMemo(() => {
    return drivers.map(driver => {
      const driverLogs = leaderboardLogs.filter(l => l.driverId === driver.id);
      
      let score = 100;
      let totalDistance = 0;
      let totalConsumed = 0;
      let totalIssued = 0;
      let cost = 0;
      let incidents = 0;
      let policyViolations = 0;
      let routeDeviations = 0;
      let speeding = 0;
      let idling = 0;
      let varianceWarnings = 0;

      driverLogs.forEach(l => {
        const tripFuelIssued = l.fuelCollections ? l.fuelCollections.reduce((sum, fc) => sum + fc.liters, 0) : (l.fuelIssuedLiters || 0);
        const tripFuelCost = l.fuelCollections ? l.fuelCollections.reduce((sum, fc) => sum + (fc.liters * fc.costPerLiter), 0) : ((l.fuelIssuedLiters || 0) * (l.fuelCostPerLiter || 0));

        totalDistance += l.distanceTraveledKm;
        totalConsumed += l.fuelConsumedLiters;
        totalIssued += tripFuelIssued;
        cost += tripFuelCost;
        incidents += l.incidents;
        policyViolations += l.policyViolations || 0;
        routeDeviations += l.routeDeviations || 0;
        speeding += l.speedingEvents;
        idling += l.idlingTimeHours;
        
        // 10% threshold for variance
        const hasVariance = tripFuelIssued > l.fuelConsumedLiters * 1.1; 
        if (hasVariance) varianceWarnings++;
        
        score -= (l.incidents * 20);
        score -= ((l.policyViolations || 0) * 5);
        score -= ((l.routeDeviations || 0) * 5);
        score -= (l.speedingEvents * 2);
        score -= (l.harshBraking * 2);
        score -= (l.idlingTimeHours * 1);
        if (hasVariance) score -= 15;
      });

      if (driverLogs.length > 0) {
        const efficiency = totalConsumed > 0 ? totalDistance / totalConsumed : 0;
        if (efficiency > 10) score += 5;
      }

      return {
        driver,
        score: driverLogs.length === 0 ? 0 : Math.max(0, Math.round(score)),
        trips: driverLogs.length,
        totalDistance,
        efficiency: totalConsumed > 0 ? (totalDistance / totalConsumed).toFixed(1) : '0.0',
        varianceWarnings,
        cost,
        incidents,
        policyViolations,
        routeDeviations,
        speeding,
        idling
      };
    }).sort((a, b) => b.score - a.score);
  }, [drivers, leaderboardLogs]);

  const expiringDocuments = useMemo(() => {
    const docs: { type: string, name: string, days: number, entityId: string }[] = [];
    const getDays = (d: string | undefined | null) => {
      if (!d) return 999;
      return Math.ceil((new Date(d).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    };
    
    drivers.forEach(d => {
      const days = getDays(d.licenseExpiry);
      if (days <= 90) docs.push({ type: 'Driver License', name: d.name, days, entityId: d.id });
    });
    vehicles.forEach(v => {
      const days = getDays(v.insuranceExpiry);
      if (days <= 90) docs.push({ type: 'Vehicle Insurance', name: `${v.makeModel} (${v.plateNumber})`, days, entityId: v.id });
    });
    
    return docs.sort((a, b) => a.days - b.days);
  }, [drivers, vehicles]);

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Performance Overview</h2>
          <p className="text-slate-600 text-sm mt-1">Aggregated data from {filteredLogs.length} trips</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          {['Daily', 'Weekly', 'Monthly'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === t 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {expiringDocuments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="text-red-600" size={20} />
            <h3 className="font-bold text-red-900">Compliance & Document Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiringDocuments.map((doc, i) => (
              <div key={i} className="bg-white p-3 rounded-xl border border-red-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{doc.type}</p>
                  <p className="font-bold text-slate-800 text-sm">{doc.name}</p>
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-bold ${doc.days < 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {doc.days < 0 ? `Expired ${Math.abs(doc.days)}d ago` : `Exp in ${doc.days}d`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Navigation size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Distance</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-xl font-black text-slate-950">{totalDistance.toLocaleString()}</h3>
              <span className="text-xs font-semibold text-slate-600">km</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Fuel size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Efficiency</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-xl font-black text-slate-950">{avgEfficiency}</h3>
              <span className="text-xs font-semibold text-slate-600">km/L</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Trips</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-xl font-black text-slate-950">{filteredLogs.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Utilization</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-xl font-black text-slate-950">
                {vehicles.filter(v => v.status !== 'Decommissioned').length > 0 
                  ? Math.round((activeDispatches.length / vehicles.filter(v => v.status !== 'Decommissioned').length) * 100) 
                  : 0}%
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cost / KM</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-xl font-black text-slate-950">
                ${totalDistance > 0 ? ((allFuelCollections.reduce((acc, fc) => acc + (fc.liters * fc.costPerLiter), 0) + maintenanceRecords.reduce((acc, m) => acc + m.cost, 0)) / totalDistance).toFixed(2) : '0.00'}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Incidents</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-xl font-black text-slate-950">{totalIncidents}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Could add charts here similarly, omitting for brevity or we can add them based on filteredLogs grouped by Date */}
    </div>
  );

  const handleDispatchSort = (key: string) => {
    setDispatchSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleLogSort = (key: keyof TripLog) => {
    setLogSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const processedLogs = useMemo(() => {
    return logs
      .filter(log => {
        const driver = drivers.find(d => d.id === log.driverId);
        const vehicle = vehicles.find(v => v.id === log.vehicleId);
        
        const searchTarget = `${log.date} ${driver?.name || ''} ${vehicle?.makeModel || ''} ${vehicle?.plateNumber || ''}`.toLowerCase();
        const matchesSearch = searchTarget.includes(logSearchQuery.toLowerCase());
        const matchesDriver = logFilterDriver === 'All' || log.driverId === logFilterDriver;
        const matchesVehicle = logFilterVehicle === 'All' || log.vehicleId === logFilterVehicle;
        
        let matchesDate = true;
        if (logDateFrom) matchesDate = matchesDate && log.date >= logDateFrom;
        if (logDateTo) matchesDate = matchesDate && log.date <= logDateTo;
        
        return matchesSearch && matchesDriver && matchesVehicle && matchesDate;
      })
      .sort((a, b) => {
        if (a[logSortConfig.key] < b[logSortConfig.key]) return logSortConfig.direction === 'asc' ? -1 : 1;
        if (a[logSortConfig.key] > b[logSortConfig.key]) return logSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [logs, drivers, vehicles, logSearchQuery, logFilterDriver, logFilterVehicle, logSortConfig, logDateFrom, logDateTo]);

  // Vehicle list — derived here at top level to avoid hooks-in-function violation
  const sortedAndFilteredVehicles = useMemo(() => {
    return vehicles
      .filter(v => {
        if (vehicleFilterStatus !== 'All' && v.status !== vehicleFilterStatus) return false;
        if (vehicleSearchQuery && !`${v.makeModel} ${v.plateNumber}`.toLowerCase().includes(vehicleSearchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const aVal = a[vehicleSortConfig.key];
        const bVal = b[vehicleSortConfig.key];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return vehicleSortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return vehicleSortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
  }, [vehicles, vehicleSearchQuery, vehicleFilterStatus, vehicleSortConfig]);

  const renderLogs = (isSubTab = false) => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          {!isSubTab && <h2 className="text-2xl font-black text-slate-950 tracking-tight">Trip Logs</h2>}
          {!isSubTab && <p className="text-slate-600 text-sm mt-1">Record and track daily driver assignments</p>}
        </div>
        <div className="flex items-center gap-2">
          {/* #27 CSV Export */}
          <button
            onClick={() => {
              const headers = ['Date','Driver','Vehicle','Distance (km)','Fuel Used (L)','Fuel Issued (L)','Incidents','Notes'];
              const rows = processedLogs.map(log => {
                const d = drivers.find(dr => dr.id === log.driverId);
                const v = vehicles.find(ve => ve.id === log.vehicleId);
                const fuelIssued = log.fuelCollections?.reduce((s, fc) => s + fc.liters, 0) || 0;
                return [
                  log.date,
                  d?.name || log.driverId,
                  v ? `${v.makeModel} (${v.plateNumber})` : log.vehicleId,
                  log.distanceTraveledKm,
                  log.fuelConsumedLiters,
                  fuelIssued || '—',
                  log.incidents,
                  `"${(log.notes || '').replace(/"/g, '""')}"`
                ];
              });
              const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url;
              a.download = `trip-logs-${new Date().toISOString().split('T')[0]}.csv`;
              a.click(); URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button
            onClick={() => {
              const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
              const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
              doc.setFontSize(16); doc.setTextColor(30, 30, 90);
              doc.text('BIG - Trip Logs', 14, 16);
              doc.setFontSize(9); doc.setTextColor(100, 100, 120);
              doc.text(`Generated on: ${today}`, 14, 22);

              const headers = ['Date', 'Driver', 'Vehicle', 'Distance (km)', 'Fuel Used (L)', 'Fuel Issued (L)', 'Incidents', 'Status'];
              const rows = processedLogs.map(log => {
                const d = drivers.find(dr => dr.id === log.driverId);
                const v = vehicles.find(ve => ve.id === log.vehicleId);
                const fuelIssued = log.fuelCollections?.reduce((s, fc) => s + fc.liters, 0) || 0;
                return [
                  log.date,
                  d?.name || log.driverId,
                  v ? `${v.makeModel} (${v.plateNumber})` : log.vehicleId,
                  log.distanceTraveledKm.toString(),
                  log.fuelConsumedLiters.toString(),
                  fuelIssued > 0 ? fuelIssued.toString() : '-',
                  log.incidents.toString(),
                  log.approvalStatus || 'Pending'
                ];
              });

              autoTable(doc, {
                head: [headers],
                body: rows,
                startY: 28,
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [79, 70, 229], textColor: 255 },
                alternateRowStyles: { fillColor: [248, 250, 252] },
              });

              doc.save(`trip-logs-${new Date().toISOString().split('T')[0]}.pdf`);
            }}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search date, driver, or vehicle..." 
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <button 
            onClick={() => setLogFiltersOpen(!logFiltersOpen)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors flex items-center gap-2 ${logFiltersOpen ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <Filter size={16} /> Filters { (logFilterDriver !== 'All' || logFilterVehicle !== 'All' || logDateFrom || logDateTo) && <div className="w-2 h-2 rounded-full bg-blue-500"></div> }
          </button>
        </div>
        
        {logFiltersOpen && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Driver</label>
              <select 
                value={logFilterDriver}
                onChange={(e) => setLogFilterDriver(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white cursor-pointer"
              >
                <option value="All">All Drivers</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Vehicle</label>
              <select 
                value={logFilterVehicle}
                onChange={(e) => setLogFilterVehicle(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white cursor-pointer"
              >
                <option value="All">All Vehicles</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.makeModel} ({v.plateNumber})</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">From Date</label>
              <input type="date" value={logDateFrom} onChange={e => setLogDateFrom(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">To Date</label>
              <input type="date" value={logDateTo} onChange={e => setLogDateTo(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-visible shadow-sm">
        <div className="overflow-visible">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider select-none">
              <tr>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleLogSort('date')}>
                  <div className="flex items-center gap-1">Date <ArrowUpDown size={12} className={logSortConfig.key === 'date' ? 'text-blue-500' : 'text-slate-400'} /></div>
                </th>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleLogSort('driverId')}>
                  <div className="flex items-center gap-1">Driver <ArrowUpDown size={12} className={logSortConfig.key === 'driverId' ? 'text-blue-500' : 'text-slate-400'} /></div>
                </th>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleLogSort('vehicleId')}>
                  <div className="flex items-center gap-1">Vehicle <ArrowUpDown size={12} className={logSortConfig.key === 'vehicleId' ? 'text-blue-500' : 'text-slate-400'} /></div>
                </th>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleLogSort('distanceTraveledKm')}>
                  <div className="flex items-center gap-1">Distance <ArrowUpDown size={12} className={logSortConfig.key === 'distanceTraveledKm' ? 'text-blue-500' : 'text-slate-400'} /></div>
                </th>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleLogSort('fuelConsumedLiters')}>
                  <div className="flex items-center gap-1">Fuel Used <ArrowUpDown size={12} className={logSortConfig.key === 'fuelConsumedLiters' ? 'text-blue-500' : 'text-slate-400'} /></div>
                </th>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleLogSort('fuelIssuedLiters')}>
                  <div className="flex items-center gap-1">Fuel Issued <ArrowUpDown size={12} className={logSortConfig.key === 'fuelIssuedLiters' ? 'text-blue-500' : 'text-slate-400'} /></div>
                </th>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-800 transition-colors text-center" onClick={() => handleLogSort('incidents')}>
                  <div className="flex justify-center items-center gap-1">Incidents <ArrowUpDown size={12} className={logSortConfig.key === 'incidents' ? 'text-blue-500' : 'text-slate-400'} /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-600">
                    No matching trip logs found.
                  </td>
                </tr>
              ) : (
              processedLogs.slice(logPage * LOG_PAGE_SIZE, (logPage + 1) * LOG_PAGE_SIZE).map((log, idx, arr) => {
                const isLastItems = idx >= arr.length - 2;
                const driver = drivers.find(d => d.id === log.driverId);
                const vehicle = vehicles.find(v => v.id === log.vehicleId);
                const tripFuelIssued = log.fuelCollections ? log.fuelCollections.reduce((sum, fc) => sum + fc.liters, 0) : (log.fuelIssuedLiters || 0);
                const hasVariance = tripFuelIssued > 0 && tripFuelIssued > log.fuelConsumedLiters * 1.1;
                return (
                  <tr key={log.id} className={`transition-colors ${hasVariance ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4 font-medium text-slate-950">{log.date}</td>
                    <td className="px-6 py-4 text-slate-700">{driver?.name || 'Unknown Driver'}</td>
                    <td className="px-6 py-4 text-slate-700">
                      {vehicle ? `${vehicle.makeModel} (${vehicle.plateNumber})` : 'Unknown Vehicle'}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{log.distanceTraveledKm} km</td>
                    <td className="px-6 py-4 text-slate-700">{log.fuelConsumedLiters} L</td>
                    <td className="px-6 py-4 text-slate-700 font-bold">
                      {tripFuelIssued > 0 ? tripFuelIssued : '-'} L
                      {hasVariance && <AlertTriangle size={12} className="inline ml-1 text-red-500" title="High Fuel Variance" />}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {log.incidents > 0 ? (
                        <span className="inline-flex items-center justify-center bg-red-100 text-red-700 font-bold w-6 h-6 rounded-full text-xs">{log.incidents}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-right relative ${activeLogMenu === log.id ? 'z-50' : 'z-0'}`}>
                      <div className="flex items-center justify-end gap-2">
                        {/* ── Approval Status Badges ── */}
                        {log.maintenanceIssuesLogged && log.maintenanceRecordId && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                            <CheckCircle2 size={11} /> Maintenance Logged
                          </span>
                        )}
                        {log.approvalStatus === 'Approved' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                            <CheckCircle2 size={11} /> Approved
                          </span>
                        )}
                        {log.approvalStatus === 'Flagged' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-lg" title={log.approvalNotes}>
                            <AlertCircle size={11} /> Flagged
                          </span>
                        )}
                        {(!log.approvalStatus || log.approvalStatus === 'Pending') && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg">
                            <Clock size={11} /> Pending
                          </span>
                        )}

                        <button 
                          onClick={() => setActiveLogMenu(activeLogMenu === log.id ? null : log.id)}
                          className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeLogMenu === log.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActiveLogMenu(null)}
                            />
                            <div className={`absolute right-8 ${isLastItems ? 'bottom-8' : 'top-10'} w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-20 overflow-hidden`}>
                              {log.maintenanceIssuesLogged && !log.maintenanceRecordId && (
                                <button
                                  onClick={() => {
                                    setMaintenanceFromTripLog({ tripLogId: log.id, vehicleId: log.vehicleId });
                                    setEditingMaintenance({
                                      vehicleId: log.vehicleId,
                                      startDate: log.date,
                                      status: 'In Progress',
                                    });
                                    setIsMaintenanceModalOpen(true);
                                    setActiveLogMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors text-left font-bold"
                                >
                                  <AlertTriangle size={14} /> Log Maintenance
                                </button>
                              )}
                              <button
                                onClick={() => { 
                                  setViewingLog(log); 
                                  setActiveLogMenu(null); 
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                              >
                                <FileText size={14} className="text-slate-600" /> View Log
                              </button>
                              <button
                                onClick={() => { 
                                  setEditingLog(log); 
                                  setEditingFuelCollections(log.fuelCollections || []); 
                                  setEditingTripLegs(log.legs || []); 
                                  setEditingPassengers(log.passengers || []); 
                                  setOdometerWarnings({}); 
                                  setIsLogModalOpen(true); 
                                  setActiveLogMenu(null); 
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                              >
                                <PenTool size={14} className="text-blue-500" /> Edit Log
                              </button>
                              
                              <button
                                onClick={() => {
                                  setApprovalModalLogId(log.id);
                                  setApprovalApproverName(log.approvedBy || ''); 
                                  setApprovalNoteInput(log.approvalNotes || ''); 
                                  setApprovalSignatureData(log.approvalSignature || null); 
                                  setApprovalSignatureMode(log.approvalSignature ? 'upload' : 'draw');
                                  setActiveLogMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                              >
                                {log.approvalStatus === 'Approved' ? <PenTool size={14} className="text-emerald-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />} {log.approvalStatus === 'Approved' ? 'Update Approval' : 'Approve Log'}
                              </button>
                              
                              {flaggingLogId === log.id ? (
                                <div className="px-4 py-2 bg-slate-50 flex flex-col gap-2 border-y border-slate-100">
                                  <input type="text" value={flagNoteInput} onChange={e => setFlagNoteInput(e.target.value)} placeholder="Reason..." className="text-xs border border-slate-200 rounded p-1.5 w-full" autoFocus />
                                  <div className="flex gap-2">
                                    <button onClick={() => { handleFlagLog(log.id, flagNoteInput); setActiveLogMenu(null); }} className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2 py-1.5 rounded w-full transition-colors">Flag</button>
                                    <button onClick={() => { setFlaggingLogId(null); setFlagNoteInput(''); }} className="text-xs text-slate-600 hover:text-slate-700 bg-white border border-slate-200 w-full rounded">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setFlaggingLogId(log.id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                >
                                  <AlertTriangle size={14} className="text-red-500" /> Flag for Review
                                </button>
                              )}

                              {deletingTripLogId === log.id ? (
                                <div className="px-4 py-2 bg-slate-50 flex flex-col gap-2 border-t border-slate-100">
                                  <p className="text-xs text-red-600 font-bold">Confirm delete?</p>
                                  <div className="flex gap-2">
                                    <button onClick={() => { setLogs(prev => prev.filter(l => l.id !== log.id)); setDeletingTripLogId(null); setActiveLogMenu(null); }} className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2 py-1.5 rounded w-full transition-colors">Yes</button>
                                    <button onClick={() => { setDeletingTripLogId(null); }} className="text-xs text-slate-600 hover:text-slate-700 bg-white border border-slate-200 w-full rounded">No</button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingTripLogId(log.id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-bold"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
        {/* #14 Pagination controls */}
        {processedLogs.length > LOG_PAGE_SIZE && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
            <span className="text-xs text-slate-600 font-mono">
              Showing {logPage * LOG_PAGE_SIZE + 1}–{Math.min((logPage + 1) * LOG_PAGE_SIZE, processedLogs.length)} of {processedLogs.length} records
            </span>
            <div className="flex gap-2">
              <button disabled={logPage === 0} onClick={() => setLogPage(p => p - 1)}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                ← Prev
              </button>
              <button disabled={(logPage + 1) * LOG_PAGE_SIZE >= processedLogs.length} onClick={() => setLogPage(p => p + 1)}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const processedDrivers = useMemo(() => {
    let result = [...drivers];
    
    if (driverSearchQuery) {
      const q = driverSearchQuery.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.licenseNumber?.toLowerCase().includes(q) ||
        d.phone?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q)
      );
    }
    
    if (driverStatusFilter !== 'All') {
      result = result.filter(d => d.status === driverStatusFilter);
    }
    
    result.sort((a, b) => {
      let aVal: any = a[driverSortConfig.key as keyof Driver] || '';
      let bVal: any = b[driverSortConfig.key as keyof Driver] || '';
      
      if (driverSortConfig.key === 'licenseExpiry') {
        aVal = a.licenseExpiry ? new Date(a.licenseExpiry).getTime() : 0;
        bVal = b.licenseExpiry ? new Date(b.licenseExpiry).getTime() : 0;
      }
      
      if (aVal < bVal) return driverSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return driverSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [drivers, driverSearchQuery, driverStatusFilter, driverSortConfig]);

  const renderDrivers = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Driver Roster</h2>
          <p className="text-slate-600 text-sm mt-1">Manage personnel and driver status</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center gap-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors shadow-sm"
          >
            <ShieldAlert size={16} /> Audit Compliance
          </button>
          <button 
            onClick={() => { setEditingDriver(null); setIsDriverModalOpen(true); }}
            className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Driver
          </button>
        </div>
      </div>

      {drivers.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search drivers by name, phone, license..." 
              value={driverSearchQuery}
              onChange={(e) => setDriverSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <select
                value={driverStatusFilter}
                onChange={(e) => setDriverStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none bg-white font-medium text-slate-700 cursor-pointer min-w-[140px]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Warning">Warning</option>
                <option value="Suspended">Suspended</option>
                <option value="Contract Cancelled">Contract Cancelled</option>
                <option value="Left Company">Left Company</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <select
                value={`${driverSortConfig.key}-${driverSortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-');
                  setDriverSortConfig({ key, direction: direction as 'asc' | 'desc' });
                }}
                className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none bg-white font-medium text-slate-700 cursor-pointer min-w-[160px]"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="status-asc">Status</option>
                <option value="licenseExpiry-asc">License Expiry (Earliest)</option>
                <option value="licenseExpiry-desc">License Expiry (Latest)</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {drivers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center col-span-full">
          <User size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-950">No Drivers Found</h3>
          <p className="text-slate-600 mt-2">Add your first driver to start building your roster.</p>
        </div>
      ) : processedDrivers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center col-span-full">
          <Search size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-950">No Matches Found</h3>
          <p className="text-slate-600 mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {processedDrivers.map(driver => {
            const licenseExpired = driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date();
            const licenseExpiringSoon = !licenseExpired && driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
            return (
              <div key={driver.id} 
                   onClick={() => { setSelectedDriverId(driver.id); setActiveTab('driver_details'); }}
                   className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group overflow-hidden cursor-pointer">
                {/* Card header with photo */}
                <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/30 px-5 pt-5 pb-4 flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={driver.imgUrl || `https://i.pravatar.cc/150?u=${driver.id}`}
                      alt={driver.name}
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-white shadow-sm"
                      onError={e => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${driver.id}`; }}
                    />
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${driver.status === 'Active' ? 'bg-emerald-400' : driver.status === 'Warning' ? 'bg-amber-400' : 'bg-red-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-950 truncate">{driver.name}</h3>
                    {driver.nationality && <p className="text-[11px] text-slate-500 mt-0.5">{driver.nationality}</p>}
                    <span className={`mt-1.5 inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      driver.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                      driver.status === 'Warning' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>{driver.status}</span>
                  </div>
                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setEditingDriver(driver); setIsDriverModalOpen(true); }}
                      className="p-1.5 bg-white shadow-sm border border-slate-100 hover:bg-blue-50 hover:border-blue-200 text-slate-600 hover:text-blue-600 rounded-lg transition-all">
                      <PenTool size={12}/>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeletingDriverId(driver.id); }}
                      className="p-1.5 bg-white shadow-sm border border-slate-100 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-500 rounded-lg transition-all">
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </div>

                {/* Card body — contact & license details */}
                <div className="px-5 py-4 space-y-2 border-t border-slate-50">
                  {driver.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="text-slate-400 shrink-0">📞</span>
                      <span className="truncate">{driver.phone}</span>
                    </div>
                  )}
                  {driver.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="text-slate-400 shrink-0">✉️</span>
                      <span className="truncate">{driver.email}</span>
                    </div>
                  )}
                  {driver.licenseNumber && (
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="text-slate-400 shrink-0">🪪</span>
                      <span className="truncate">{driver.licenseType ? `${driver.licenseType} · ` : ''}{driver.licenseNumber}</span>
                    </div>
                  )}
                  {driver.licenseExpiry && (
                    <div className={`flex items-center gap-2 text-xs font-semibold ${licenseExpired ? 'text-red-600' : licenseExpiringSoon ? 'text-amber-600' : 'text-slate-700'}`}>
                      <span className="shrink-0">{licenseExpired ? <AlertTriangle size={14} className="text-red-500" /> : licenseExpiringSoon ? <Clock size={14} className="text-amber-500" /> : '🟢'}</span>
                      <span>License expires: {new Date(driver.licenseExpiry).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                  )}
                  {driver.nextOfKinName && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="text-slate-400 shrink-0">🤝</span>
                      <span className="truncate">NOK: {driver.nextOfKinName}{driver.nextOfKinPhone ? ` · ${driver.nextOfKinPhone}` : ''}</span>
                    </div>
                  )}
                </div>

                {/* Card footer — awards & docs */}
                {(driver.awards?.length || driver.documents?.length) ? (
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                    {driver.awards && driver.awards.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                        🏆 {driver.awards.length} Award{driver.awards.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {driver.documents && driver.documents.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        📎 {driver.documents.length} Doc{driver.documents.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Driver Delete Confirmation Modal */}
      {deletingDriverId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeletingDriverId(null)}>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 text-center tracking-tight mb-2">Delete Driver?</h3>
              <p className="text-sm text-slate-600 text-center mb-6 leading-relaxed">
                Are you sure you want to delete this driver? This action cannot be undone and will remove them from the active roster.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingDriverId(null)} 
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { setDrivers(prev => prev.filter(d => d.id !== deletingDriverId)); setDeletingDriverId(null); }} 
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm shadow-red-200"
                >
                  Delete Driver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDriverDetails = () => {
    const driver = drivers.find(d => d.id === selectedDriverId);
    if (!driver) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <AlertCircle size={48} className="text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-950">Driver Not Found</h3>
          <button onClick={() => setActiveTab('drivers')} className="mt-4 text-blue-600 font-bold hover:underline">
            Return to Drivers
          </button>
        </div>
      );
    }

    const licenseExpired = driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date();
    const licenseExpiringSoon = !licenseExpired && driver.licenseExpiry && new Date(driver.licenseExpiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('drivers')}
              className="p-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">Driver Profile</h2>
              <p className="text-slate-600 text-sm mt-1">Detailed information and records</p>
            </div>
          </div>
          <button 
            onClick={() => { setEditingDriver(driver); setIsDriverModalOpen(true); }}
            className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PenTool size={16} /> Edit Profile
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-16 mb-6 gap-4 overflow-hidden">
              <div className="flex items-end gap-6 min-w-0">
                <img
                  src={driver.imgUrl || `https://i.pravatar.cc/150?u=${driver.id}`}
                  alt={driver.name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${driver.id}`; }}
                />
                <div className="mb-2 min-w-0">
                  <h1 className="text-3xl font-black text-slate-950 truncate">{driver.name}</h1>
                  <p className="text-slate-600 font-medium">{driver.nationality || 'Sierra Leonean'}</p>
                </div>
              </div>
              <div className="mb-2 text-right shrink-0 max-w-[220px]">
                <span className={`px-4 py-1.5 text-sm font-bold uppercase tracking-wider rounded-full shadow-sm inline-block ${
                  driver.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  driver.status === 'Warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  (driver.status === 'Contract Cancelled' || driver.status === 'Left Company') ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                  'bg-red-50 text-red-700 border border-red-100'
                }`}>{driver.status}</span>
                {driver.statusReason && (
                  <p className="text-xs text-slate-600 mt-2 break-words line-clamp-3">{driver.statusReason}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Contact Information</h3>
                {driver.phone && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="text-slate-500" size={18} />
                    <span>{driver.phone}</span>
                  </div>
                )}
                {driver.email && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="text-slate-500" size={18} />
                    <span>{driver.email}</span>
                  </div>
                )}
                {driver.address && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <MapPin className="text-slate-500" size={18} />
                    <span className="leading-snug">{driver.address}</span>
                  </div>
                )}
              </div>

              {/* License & IDs */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Identification</h3>
                {driver.nationalId && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <CreditCard className="text-slate-500" size={18} />
                    <div>
                      <p className="text-xs text-slate-600">National ID</p>
                      <p className="font-semibold">{driver.nationalId}</p>
                    </div>
                  </div>
                )}
                {driver.licenseNumber && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="text-slate-500" size={18} />
                    <div>
                      <p className="text-xs text-slate-600">{driver.licenseType || 'Driving License'}</p>
                      <p className="font-semibold">{driver.licenseNumber}</p>
                    </div>
                  </div>
                )}
                {driver.licenseExpiry && (
                  <div className={`flex items-center gap-3 ${licenseExpired ? 'text-red-700' : licenseExpiringSoon ? 'text-amber-700' : 'text-slate-700'}`}>
                    {licenseExpired ? <AlertTriangle className="text-red-500" size={18} /> : licenseExpiringSoon ? <Clock className="text-amber-500" size={18} /> : <Calendar className="text-slate-500" size={18} />}
                    <div>
                      <p className={`text-xs ${licenseExpired ? 'text-red-500 font-bold' : licenseExpiringSoon ? 'text-amber-600 font-bold' : 'text-slate-600'}`}>
                        {licenseExpired ? 'License Expired' : licenseExpiringSoon ? 'License Expiring Soon' : 'License Expiry'}
                      </p>
                      <p className="font-semibold">{new Date(driver.licenseExpiry).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Contacts */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Emergency / NOK</h3>
                {driver.nextOfKinName && (
                  <div className="flex items-start gap-3 text-slate-700">
                    <Users className="text-slate-500 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-slate-600">Next of Kin ({driver.nextOfKinRelationship || 'Relative'})</p>
                      <p className="font-semibold">{driver.nextOfKinName}</p>
                      {driver.nextOfKinPhone && <p className="text-sm text-slate-600">{driver.nextOfKinPhone}</p>}
                    </div>
                  </div>
                )}
                {driver.emergencyContactName && (
                  <div className="flex items-start gap-3 text-slate-700">
                    <ShieldAlert className="text-slate-500 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-slate-600">Emergency Contact</p>
                      <p className="font-semibold">{driver.emergencyContactName}</p>
                      {driver.emergencyContactPhone && <p className="text-sm text-slate-600">{driver.emergencyContactPhone}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              Documents &amp; Attachments
            </h3>
            
            {/* Header Dropdown Menu */}
            <div className="relative z-20">
              <button
                onClick={() => setHeaderDocDropdownOpen(!headerDocDropdownOpen)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
              >
                <MoreVertical size={20} />
              </button>
              
              {headerDocDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden py-1">
                  <button
                    onClick={() => { 
                      setHeaderDocDropdownOpen(false); 
                      setEditingDriver(driver); 
                      setIsDriverModalOpen(true); 
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left"
                  >
                    <Upload size={16} /> Upload Document
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Global click-away overlay for dropdowns */}
          {(headerDocDropdownOpen || activeDocDropdown) && (
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => { setHeaderDocDropdownOpen(false); setActiveDocDropdown(null); }}
            />
          )}

          {(!driver.documents || driver.documents.length === 0) ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <FileText className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-slate-600 font-medium">No documents uploaded</p>
              <button
                onClick={() => { setEditingDriver(driver); setIsDriverModalOpen(true); }}
                className="mt-2 text-sm text-blue-600 font-bold hover:underline"
              >
                Upload documents
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {driver.documents!.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-950 truncate" title={doc.label}>{doc.label}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">{doc.docType?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  {/* View + Delete actions in Dropdown */}
                  <div className="relative z-20 shrink-0 ml-2">
                    <button
                      onClick={() => setActiveDocDropdown(activeDocDropdown === doc.id ? null : doc.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {activeDocDropdown === doc.id && (
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden py-1">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setActiveDocDropdown(null)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          <Eye size={16} /> View
                        </a>
                        <a
                          href={doc.fileUrl}
                          download
                          onClick={() => setActiveDocDropdown(null)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          <Download size={16} /> Download
                        </a>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button
                          onClick={async () => {
                            setActiveDocDropdown(null);
                            if (!window.confirm(`Delete "${doc.label}"? This cannot be undone.`)) return;
                            const { error } = await supabase.from('driver_documents').delete().eq('id', doc.id);
                            if (!error) {
                              _setDrivers(prev => prev.map(d =>
                                d.id === driver.id
                                  ? { ...d, documents: (d.documents || []).filter(dd => dd.id !== doc.id) }
                                  : d
                              ));
                            }
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Status History Timeline ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <Shield className="text-blue-600" size={20} />
              Status History
            </h3>
            <div className="flex items-center gap-3">
              {(driver.suspensionCount ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
                  <AlertTriangle size={12} />
                  Suspended {driver.suspensionCount}× total
                </span>
              )}
              <button
                onClick={() => { setEditingDriver(driver); setIsDriverModalOpen(true); }}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-xl transition"
              >
                <PenTool size={12} /> Update Status
              </button>
            </div>
          </div>

          {(!driver.statusLogs || driver.statusLogs.length === 0) ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Shield className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-slate-600 font-medium text-sm">No status changes recorded</p>
              <p className="text-slate-500 text-xs mt-1">Changes will appear here automatically when you update this driver's status</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100" />
              <div className="space-y-4">
                {driver.statusLogs.map((log, idx) => {
                  const statusColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
                    'Active':             { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
                    'Warning':            { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400'   },
                    'Suspended':          { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500'     },
                    'Contract Cancelled': { bg: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200',   dot: 'bg-slate-400'   },
                    'Left Company':       { bg: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200',   dot: 'bg-slate-400'   },
                  };
                  const isEditingThis = editingLogId === log.id;
                  const isDeletingThis = deletingLogId === log.id;
                  const displayStatus = isEditingThis ? editingLogForm.status : log.status;
                  const c = statusColors[displayStatus] || statusColors['Active'];
                  const logDate = new Date(log.createdAt);
                  const formattedDate = logDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const formattedTime = logDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                  // ── Helper: save edited log ───────────────────────────────────
                  const handleSaveLog = async () => {
                    const updated: DriverStatusLog = {
                      ...log,
                      status: editingLogForm.status,
                      reason: editingLogForm.reason,
                    };
                    // Optimistically update state
                    setAllStatusLogs(prev => prev.map(l => l.id === log.id ? updated : l));
                    setDrivers(prev => prev.map(d => {
                      if (d.id !== driver.id) return d;
                      const updatedLogs = (d.statusLogs || []).map(l => l.id === log.id ? updated : l);
                      return {
                        ...d,
                        statusLogs: updatedLogs,
                        suspensionCount: updatedLogs.filter(l => l.status === 'Suspended').length,
                      };
                    }));
                    setEditingLogId(null);
                    // Persist
                    const { error } = await supabase
                      .from('driver_status_logs')
                      .update({ status: editingLogForm.status, reason: editingLogForm.reason })
                      .eq('id', log.id);
                    if (error) console.error('[Status Log] Update failed:', error.message);
                  };

                  // ── Helper: delete log ────────────────────────────────────────
                  const handleDeleteLog = async () => {
                    // Optimistically remove
                    setAllStatusLogs(prev => prev.filter(l => l.id !== log.id));
                    setDrivers(prev => prev.map(d => {
                      if (d.id !== driver.id) return d;
                      const updatedLogs = (d.statusLogs || []).filter(l => l.id !== log.id);
                      return {
                        ...d,
                        statusLogs: updatedLogs,
                        suspensionCount: updatedLogs.filter(l => l.status === 'Suspended').length,
                      };
                    }));
                    setDeletingLogId(null);
                    // Persist
                    const { error } = await supabase
                      .from('driver_status_logs')
                      .delete()
                      .eq('id', log.id);
                    if (error) console.error('[Status Log] Delete failed:', error.message);
                  };

                  return (
                    <div key={log.id} className="flex gap-4 relative group/log">
                      {/* Timeline dot */}
                      <div className={`relative z-10 w-10 h-10 rounded-full ${c.dot} border-4 border-white shadow-sm flex items-center justify-center shrink-0 mt-0.5 transition-all`}>
                        {displayStatus === 'Active' && <CheckCircle2 size={14} className="text-white" />}
                        {displayStatus === 'Warning' && <AlertTriangle size={14} className="text-white" />}
                        {displayStatus === 'Suspended' && <Shield size={14} className="text-white" />}
                        {(displayStatus === 'Contract Cancelled' || displayStatus === 'Left Company') && <User size={14} className="text-white" />}
                      </div>

                      {/* Card */}
                      <div className={`flex-1 ${c.bg} border ${c.border} rounded-xl p-4 transition-all ${ idx === 0 ? 'ring-1 ring-offset-1 ring-blue-200' : '' } ${isEditingThis ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}>

                        {isEditingThis ? (
                          /* ── EDIT MODE ─────────────────────────────────────────────────── */
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] font-bold text-slate-600 uppercase w-14 shrink-0">Status</label>
                              <select
                                value={editingLogForm.status}
                                onChange={e => setEditingLogForm(f => ({ ...f, status: e.target.value }))}
                                className="flex-1 text-xs font-bold p-1.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
                              >
                                <option value="Active">Active</option>
                                <option value="Warning">Warning</option>
                                <option value="Suspended">Suspended</option>
                                <option value="Contract Cancelled">Contract Cancelled</option>
                                <option value="Left Company">Left Company</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <label className="text-[10px] font-bold text-slate-600 uppercase w-14 shrink-0 pt-1.5">Reason</label>
                              <textarea
                                value={editingLogForm.reason}
                                onChange={e => setEditingLogForm(f => ({ ...f, reason: e.target.value }))}
                                className="flex-1 text-xs p-2 border border-slate-300 rounded-lg bg-white resize-none min-h-[64px] focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                placeholder="Describe the reason for this status..."
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setEditingLogId(null)}
                                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveLog}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                              >
                                <CheckCircle2 size={12} /> Save Changes
                              </button>
                            </div>
                          </div>
                        ) : isDeletingThis ? (
                          /* ── DELETE CONFIRM MODE ───────────────────────────────────────── */
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 text-red-700">
                              <AlertTriangle size={14} />
                              <span className="text-xs font-bold">Delete this status entry? This cannot be undone.</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDeletingLogId(null)}
                                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleDeleteLog}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center gap-1"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── READ MODE ───────────────────────────────────────────────────── */
                          <>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${c.bg} ${c.text} ${c.border} border`}>
                                  {log.status}
                                </span>
                                {idx === 0 && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">Latest</span>
                                )}
                                <span className="text-xs text-slate-500">{formattedDate} · {formattedTime}</span>
                              </div>
                              {/* Action buttons — visible on hover */}
                              <div className="flex gap-1 opacity-0 group-hover/log:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={() => { setEditingLogId(log.id); setEditingLogForm({ status: log.status, reason: log.reason || '' }); setDeletingLogId(null); }}
                                  title="Edit this entry"
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <PenTool size={13} />
                                </button>
                                <button
                                  onClick={() => { setDeletingLogId(log.id); setEditingLogId(null); }}
                                  title="Delete this entry"
                                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                            {log.reason && (
                              <p className="text-sm text-slate-700 mt-2 leading-relaxed">{log.reason}</p>
                            )}
                            {!log.reason && (
                              <p className="text-xs text-slate-500 mt-2 italic">No reason recorded</p>
                            )}
                            {log.recordedBy && (
                              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                                <User size={10} /> Recorded by {log.recordedBy}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVehicles = () => {
    // Full-page vehicle detail view
    if (viewingVehicle) {
      return (
        <VehicleDetailsView
          vehicle={viewingVehicle}
          onBack={() => setViewingVehicle(null)}
          onEdit={() => {
            setEditingVehicle(viewingVehicle);
            setIsVehicleReadOnly(false);
            setIsVehicleModalOpen(true);
          }}
        />
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">Fleet Vehicles</h2>
            <p className="text-slate-600 text-sm mt-1">Manage vehicles and asset status</p>
          </div>
          <button 
            onClick={() => { setEditingVehicle(null); setIsVehicleReadOnly(false); setIsVehicleModalOpen(true); }}
            className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Vehicle
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by Make/Model or Plate..." 
              value={vehicleSearchQuery}
              onChange={e => setVehicleSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-4 items-center">
            <select 
              value={vehicleFilterStatus}
              onChange={e => setVehicleFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>
            
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
              <button
                onClick={() => setVehicleViewMode('list')}
                title="List View"
                className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
                  vehicleViewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setVehicleViewMode('grid')}
                title="Grid View"
                className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
                  vehicleViewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {vehicleViewMode === 'list' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => setVehicleSortConfig(prev => ({ key: 'makeModel', direction: prev.key === 'makeModel' && prev.direction === 'asc' ? 'desc' : 'asc' }))}>
                    Make & Model <ArrowUpDown size={12} className="inline ml-1" />
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => setVehicleSortConfig(prev => ({ key: 'year', direction: prev.key === 'year' && prev.direction === 'asc' ? 'desc' : 'asc' }))}>
                    Year <ArrowUpDown size={12} className="inline ml-1" />
                  </th>
                  <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => setVehicleSortConfig(prev => ({ key: 'odometer', direction: prev.key === 'odometer' && prev.direction === 'asc' ? 'desc' : 'asc' }))}>
                    Odometer <ArrowUpDown size={12} className="inline ml-1" />
                  </th>
                  <th className="px-6 py-4 font-semibold">License Plate</th>
                  <th className="px-6 py-4 font-semibold">Ins. Expiry</th>
                  <th className="px-6 py-4 font-semibold">Condition</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedAndFilteredVehicles.map(vehicle => (
                  <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-950 flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
                        {vehicle.imageUrl ? (
                          <img src={vehicle.imageUrl} alt={vehicle.makeModel} className="w-full h-full object-cover" />
                        ) : (
                          <Car size={16} className="text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span>{vehicle.makeModel}</span>
                        <span className="text-xs text-slate-500 font-normal">{vehicle.isCompanyRegistered ? 'Company Owned' : 'External'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{vehicle.year}</td>
                    <td className="px-6 py-4 text-slate-700">{(vehicle.odometer || 0).toLocaleString()} km</td>
                    <td className="px-6 py-4 text-slate-700 font-mono">{vehicle.plateNumber}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const insExpired = vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) < new Date();
                        const insExpiringSoon = !insExpired && vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                        return (
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${insExpired ? 'text-red-600' : insExpiringSoon ? 'text-amber-600' : 'text-slate-700'}`}>
                            {insExpired ? <AlertTriangle size={12} /> : insExpiringSoon ? <Clock size={12} /> : null}
                            {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{vehicle.condition}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        vehicle.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        vehicle.status === 'Maintenance' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveVehicleMenu(activeVehicleMenu === vehicle.id ? null : vehicle.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {activeVehicleMenu === vehicle.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveVehicleMenu(null)}></div>
                            <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 overflow-hidden">
                              <button 
                                onClick={() => { setActiveVehicleMenu(null); setViewingVehicle(vehicle as Vehicle); }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Eye size={14} /> View
                              </button>
                              <button 
                                onClick={() => { setActiveVehicleMenu(null); setEditingVehicle(vehicle); setIsVehicleReadOnly(false); setIsVehicleModalOpen(true); }}
                                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                              >
                                <PenTool size={14} /> Edit
                              </button>
                              <div className="h-px bg-slate-100 my-1"></div>
                              <button 
                                onClick={() => { setActiveVehicleMenu(null); setDeletingVehicle(vehicle as Vehicle); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedAndFilteredVehicles.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-600">
                      No vehicles match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedAndFilteredVehicles.map(vehicle => {
              const insExpired = vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) < new Date();
              const insExpiringSoon = !insExpired && vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
              return (
                <div key={vehicle.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group cursor-pointer" onClick={() => setViewingVehicle(vehicle as Vehicle)}>
                  <div className="relative h-48 bg-slate-100">
                    {vehicle.imageUrl ? (
                      <img src={vehicle.imageUrl} alt={vehicle.makeModel} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <Car size={32} className="mb-2" />
                        <span className="text-xs font-medium uppercase tracking-wider font-mono">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${
                        vehicle.status === 'Available' ? 'bg-emerald-500/90 text-white' :
                        vehicle.status === 'Maintenance' ? 'bg-amber-500/90 text-white' :
                        'bg-slate-800/90 text-white'
                      }`}>
                        {vehicle.status}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setActiveVehicleMenu(activeVehicleMenu === vehicle.id ? null : vehicle.id)}
                          className="p-1.5 text-slate-700 bg-white/90 hover:bg-white rounded-md shadow-sm transition-colors backdrop-blur-md"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {activeVehicleMenu === vehicle.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveVehicleMenu(null)}></div>
                            <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 overflow-hidden">
                              <button 
                                onClick={() => { setActiveVehicleMenu(null); setViewingVehicle(vehicle as Vehicle); }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Eye size={14} /> View
                              </button>
                              <button 
                                onClick={() => { setActiveVehicleMenu(null); setEditingVehicle(vehicle); setIsVehicleReadOnly(false); setIsVehicleModalOpen(true); }}
                                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                              >
                                <PenTool size={14} /> Edit
                              </button>
                              <div className="h-px bg-slate-100 my-1"></div>
                              <button 
                                onClick={() => { setActiveVehicleMenu(null); setDeletingVehicle(vehicle as Vehicle); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-black text-slate-950 text-lg leading-tight tracking-tight">{vehicle.makeModel}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 font-mono font-medium">{vehicle.plateNumber}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-xs text-slate-500 font-medium">{vehicle.year}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="block text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Odometer</span>
                        <span className="font-semibold text-slate-700">{(vehicle.odometer || 0).toLocaleString()} km</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Condition</span>
                        <span className="font-semibold text-slate-700">{vehicle.condition}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Ins. Expiry</span>
                        <div className={`flex items-center gap-1.5 font-bold ${insExpired ? 'text-red-600' : insExpiringSoon ? 'text-amber-600' : 'text-slate-700'}`}>
                          {insExpired ? <AlertTriangle size={14} /> : insExpiringSoon ? <Clock size={14} /> : null}
                          {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderLeaderboard = () => {
    const isDisqualified = (ds: typeof driverScores[0]) =>
      ds.incidents >= 1 || ds.varianceWarnings >= 2;

    const rankStyle = (idx: number, disq: boolean) => {
      if (disq) return { badge: 'bg-red-50 text-red-400', label: String(idx + 1) };
      if (idx === 0) return { badge: 'bg-amber-100 text-amber-700', label: '🥇' };
      if (idx === 1) return { badge: 'bg-slate-200 text-slate-700', label: '🥈' };
      if (idx === 2) return { badge: 'bg-orange-100 text-orange-700', label: '🥉' };
      return { badge: 'bg-slate-50 text-slate-500', label: String(idx + 1) };
    };

    const currentMonthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    // Generate last 24 months (newest first) for pickers
    const last24Months: string[] = Array.from({ length: 24 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString('default', { month: 'long', year: 'numeric' });
    });

    // Parses both new pipe format ("type|period|note|date") and legacy (" - " format)
    const parseAward = (raw: string): { type: string; period: string; note: string; date: string } => {
      if (raw.includes('|')) {
        const [type = '', period = '', note = '', date = ''] = raw.split('|');
        return { type, period, note, date };
      }
      const parts = raw.split(' - ');
      const date = parts.pop() || '';
      const rest = parts.join(' - ');
      const noteMatch = rest.match(/\((.+?)\)$/);
      const note = noteMatch ? noteMatch[1] : '';
      const type = rest.replace(/\s*\(.+?\)$/, '').trim();
      return { type, period: '', note, date };
    };

    const allAwardedDrivers = leaderboardScores
      .filter(ds => ds.driver.awards && ds.driver.awards.length > 0)
      .flatMap(ds => (ds.driver.awards as string[]).map(aw => ({
        driver: ds.driver,
        raw: aw,
        parsed: parseAward(aw),
      })))
      .sort((a, b) => {
        const dateA = new Date(a.parsed.date).getTime() || 0;
        const dateB = new Date(b.parsed.date).getTime() || 0;
        return dateB - dateA;
      });

    // Unique periods present in actual award records (for filter pills)
    const hofPeriods = ['All Time', ...Array.from(new Set(
      allAwardedDrivers.map(e => e.parsed.period).filter(Boolean)
    ))];

    const hofAwards = hofFilter === 'All Time'
      ? allAwardedDrivers
      : allAwardedDrivers.filter(e => e.parsed.period === hofFilter);

    // Group by period for "All Time" display
    const groupedHof: Record<string, typeof allAwardedDrivers> = {};
    hofAwards.forEach(e => {
      const key = e.parsed.period || 'Legacy Awards';
      if (!groupedHof[key]) groupedHof[key] = [];
      groupedHof[key].push(e);
    });

    const penaltyRules = [
      { label: 'Incident', penalty: -20, unit: 'each' },
      { label: 'Policy Violation', penalty: -5, unit: 'each' },
      { label: 'Route Deviation', penalty: -5, unit: 'each' },
      { label: 'Speeding Event', penalty: -2, unit: 'each' },
      { label: 'Fuel Variance Flag', penalty: -15, unit: 'each' },
      { label: 'Idling Time', penalty: -1, unit: 'per hr' },
    ];

    const handleSort = (field: typeof leaderboardSortField) => {
      if (leaderboardSortField === field) {
        setLeaderboardSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setLeaderboardSortField(field);
        setLeaderboardSortDirection('desc');
      }
    };

    const SortIcon = ({ field }: { field: typeof leaderboardSortField }) => {
      if (leaderboardSortField !== field) return <ArrowUpDown size={12} className="inline-block ml-1 opacity-20" />;
      return leaderboardSortDirection === 'asc' 
        ? <ChevronUp size={14} className="inline-block ml-1 text-blue-500" />
        : <ChevronDown size={14} className="inline-block ml-1 text-blue-500" />;
    };

    // Filter and Sort Data
    const processedScores = leaderboardScores
      .filter(ds => ds.trips > 0)
      .filter(ds => {
        if (leaderboardStatus === 'eligible') return !isDisqualified(ds);
        if (leaderboardStatus === 'disqualified') return isDisqualified(ds);
        return true;
      })
      .filter(ds => {
        if (!leaderboardSearch.trim()) return true;
        return ds.driver.name.toLowerCase().includes(leaderboardSearch.toLowerCase());
      })
      .sort((a, b) => {
        let valA: any = a[leaderboardSortField as keyof typeof a];
        let valB: any = b[leaderboardSortField as keyof typeof b];
        
        if (leaderboardSortField === 'name') {
          valA = a.driver.name;
          valB = b.driver.name;
        } else if (leaderboardSortField === 'variance') {
          valA = a.varianceWarnings;
          valB = b.varianceWarnings;
        } else if (leaderboardSortField === 'distance') {
          valA = a.totalDistance;
          valB = b.totalDistance;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return leaderboardSortDirection === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        }
        return leaderboardSortDirection === 'asc' ? valA - valB : valB - valA;
      });

    return (
      <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Driver Performance &amp; Awards</h2>
          <p className="text-slate-600 text-sm mt-1">
            Live metrics from{' '}
            <span className="font-bold text-blue-600">{leaderboardLogs.length} trip logs</span>
            {' '}— scoring period: <span className="font-bold text-slate-700">{leaderboardPeriodType === 'Rolling' ? 'Last 30 Days' : leaderboardPeriodValue}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setAwardModal({ driverId: '', driverName: '' }); setAwardType('Driver of the Month'); setAwardNote(''); setAwardSuccess(false); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm shadow-sm transition-colors shrink-0"
          >
            <Gift size={15} /> Issue Award
          </button>
        </div>
      </div>

      {/* Scoring Algorithm Key */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">Scoring Algorithm — Every driver starts at 100 pts</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {penaltyRules.map(p => (
            <div key={p.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
              <span className="text-red-500 font-black text-sm">{p.penalty}</span><span className="text-slate-500 text-[10px] font-mono"> pts</span>
              <p className="text-[10px] text-slate-700 font-semibold mt-0.5 leading-tight">{p.label}</p>
              <p className="text-[9px] text-slate-500 font-mono">{p.unit}</p>
            </div>
          ))}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center shadow-sm">
            <span className="text-emerald-500 font-black text-sm">+5</span><span className="text-slate-500 text-[10px] font-mono"> pts</span>
            <p className="text-[10px] text-slate-700 font-semibold mt-0.5 leading-tight">Efficiency Bonus</p>
            <p className="text-[9px] text-slate-500 font-mono">if &gt;10 km/L</p>
          </div>
        </div>
      </div>

      {/* Combined Rankings Table Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          <select 
            value={leaderboardPeriodType}
            onChange={e => {
              const type = e.target.value as any;
              setLeaderboardPeriodType(type);
              if (type === 'Rolling') setLeaderboardPeriodValue('Monthly');
              else if (type === 'Month') setLeaderboardPeriodValue(currentMonthLabel);
              else if (type === 'Year') setLeaderboardPeriodValue(new Date().getFullYear().toString());
              else if (type === 'All Time') setLeaderboardPeriodValue('All Time');
            }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="Rolling">Rolling Window</option>
            <option value="Month">Specific Month</option>
            <option value="Year">Specific Year</option>
            <option value="All Time">All Time</option>
          </select>
          
          {leaderboardPeriodType === 'Month' && (
            <select
              value={leaderboardPeriodValue}
              onChange={e => setLeaderboardPeriodValue(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              {last24Months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}

          {leaderboardPeriodType === 'Year' && (
            <select
              value={leaderboardPeriodValue}
              onChange={e => setLeaderboardPeriodValue(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              {[0, 1, 2].map(offset => {
                const y = (new Date().getFullYear() - offset).toString();
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          )}
        </div>

        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search drivers by name..."
            value={leaderboardSearch}
            onChange={e => setLeaderboardSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select 
            value={leaderboardStatus} 
            onChange={e => setLeaderboardStatus(e.target.value as any)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="all">All Drivers</option>
            <option value="eligible">Award Eligible Only</option>
            <option value="disqualified">Disqualified Only</option>
          </select>
        </div>
      </div>

      {/* Combined Rankings Table */}
      {leaderboardScores.filter(ds => ds.trips > 0).length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <Activity size={36} className="text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 font-bold">No trip data for this period</p>
          <p className="text-xs text-slate-400 mt-1">Add trip logs to see driver scores here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4 font-semibold w-14 text-center">Rank</th>
                <th className="px-4 py-4 font-semibold cursor-pointer hover:text-blue-600 transition-colors select-none" onClick={() => handleSort('name')}>
                  Driver <SortIcon field="name" />
                </th>
                <th className="px-4 py-4 font-semibold text-center cursor-pointer hover:text-blue-600 transition-colors select-none" onClick={() => handleSort('score')}>
                  Score <SortIcon field="score" />
                </th>
                <th className="px-4 py-4 font-semibold cursor-pointer hover:text-blue-600 transition-colors select-none" onClick={() => handleSort('trips')}>
                  Trips <SortIcon field="trips" />
                </th>
                <th className="px-4 py-4 font-semibold cursor-pointer hover:text-blue-600 transition-colors select-none" onClick={() => handleSort('distance')}>
                  Distance <SortIcon field="distance" />
                </th>
                <th className="px-4 py-4 font-semibold cursor-pointer hover:text-blue-600 transition-colors select-none" onClick={() => handleSort('efficiency')}>
                  Efficiency <SortIcon field="efficiency" />
                </th>
                <th className="px-4 py-4 font-semibold text-center cursor-pointer hover:text-blue-600 transition-colors select-none" onClick={() => handleSort('incidents')}>
                  Incidents <SortIcon field="incidents" />
                </th>
                <th className="px-4 py-4 font-semibold text-center cursor-pointer hover:text-blue-600 transition-colors select-none" onClick={() => handleSort('variance')}>
                  Variance <SortIcon field="variance" />
                </th>
                <th className="px-4 py-4 font-semibold text-center">Award Status</th>
                <th className="px-4 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedScores.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                    No drivers match your current filters.
                  </td>
                </tr>
              ) : processedScores.map((ds, idx) => {
                const disq = isDisqualified(ds);
                // Dynamic rank based on processed order
                const rs = rankStyle(idx, disq);
                return (
                  <tr key={ds.driver.id} className={`transition-colors ${disq ? 'bg-red-50/20 hover:bg-red-50/40' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${rs.badge}`}>{rs.label}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img src={ds.driver.imgUrl} alt={ds.driver.name} className="w-9 h-9 rounded-full border-2 border-slate-100 object-cover" />
                          {idx === 0 && !disq && <span className="absolute -top-1 -right-1 text-[11px]">🥇</span>}
                        </div>
                        <div>
                          <span className="font-bold text-slate-950">{ds.driver.name}</span>
                          {ds.driver.awards && ds.driver.awards.length > 0 ? (
                            <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1"><Trophy size={9} /> {ds.driver.awards.length} Award{ds.driver.awards.length !== 1 ? 's' : ''}</p>
                          ) : (
                            <p className="text-[10px] text-slate-500 font-mono">No awards yet</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-lg font-black ${
                        ds.trips === 0 ? 'bg-slate-50 text-slate-400' :
                        ds.score >= 90 ? 'bg-emerald-50 text-emerald-600' :
                        ds.score >= 70 ? 'bg-blue-50 text-blue-600' :
                        ds.score >= 50 ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>{ds.trips === 0 ? '—' : ds.score}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-700 font-mono">{ds.trips}</td>
                    <td className="px-4 py-4 text-slate-700 font-mono">{ds.totalDistance.toFixed(1)} km</td>
                    <td className="px-4 py-4 font-mono">
                      <span className={Number(ds.efficiency) >= 10 ? 'text-emerald-600 font-bold' : 'text-slate-700'}>
                        {ds.efficiency} km/L{Number(ds.efficiency) >= 10 && <span className="text-[10px] text-emerald-500 ml-1">+5</span>}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {ds.incidents > 0 ? (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold">
                          <AlertTriangle size={11} /> {ds.incidents} <span className="text-red-400 font-normal">(-{ds.incidents * 20})</span>
                        </span>
                      ) : (
                        <span className="text-emerald-500 text-xs font-bold flex items-center justify-center gap-1"><CheckCircle2 size={11} /> None</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {ds.varianceWarnings > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-lg text-xs font-bold">
                          <AlertTriangle size={11} /> {ds.varianceWarnings} <span className="text-amber-500 font-normal">(-{ds.varianceWarnings * 15})</span>
                        </span>
                      ) : (
                        <span className="text-emerald-500 text-xs font-bold flex items-center justify-center gap-1"><CheckCircle2 size={11} /> Clean</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {ds.trips === 0 ? (
                        <span className="text-slate-400 text-xs font-mono">No trips</span>
                      ) : disq ? (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-lg text-xs font-bold">
                          <AlertTriangle size={11} /> Disqualified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg text-xs font-bold">
                          <CheckCircle2 size={11} /> Eligible
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setAwardModal({ driverId: ds.driver.id, driverName: ds.driver.name }); setAwardType('Driver of the Month'); setAwardNote(''); setAwardSuccess(false); }}
                          className="text-amber-600 hover:text-white bg-amber-50 hover:bg-amber-500 p-1.5 rounded-lg transition-colors"
                          title="Issue Award"
                        ><Gift size={14} /></button>
                        <button onClick={() => setSelectedDriverScorecard(ds.driver.id)}
                          className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                          Scorecard
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Disqualification Rules */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-900">Disqualification Rules</p>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            A driver is <strong>automatically disqualified</strong> from monthly award eligibility if they have{' '}
            <strong>1 or more incident</strong> or <strong>2 or more fuel variance flags</strong> in the scoring period.
          </p>
        </div>
      </div>

      {/* Awards Hall of Fame */}
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Award size={20} className="text-amber-500" />
            <div>
              <h3 className="text-lg font-black text-slate-950">Awards Hall of Fame</h3>
              <p className="text-xs text-slate-500">
                {hofFilter === 'All Time'
                  ? `${allAwardedDrivers.length} total award${allAwardedDrivers.length !== 1 ? 's' : ''} across all months`
                  : `${hofAwards.length} award${hofAwards.length !== 1 ? 's' : ''} for ${hofFilter}`}
              </p>
            </div>
          </div>
        </div>

        {/* Month filter pills — only shown when there are awards */}
        {allAwardedDrivers.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {hofPeriods.map(p => (
              <button key={p} onClick={() => setHofFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  hofFilter === p
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50'
                }`}>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {allAwardedDrivers.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
            <Trophy size={32} className="text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-sm">No awards have been issued yet.</p>
            <p className="text-xs text-slate-400 mt-1">Use the "Issue Award" button above to recognise a driver.</p>
          </div>
        ) : hofAwards.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center">
            <Calendar size={28} className="text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 font-medium text-sm">No awards recorded for {hofFilter}.</p>
          </div>
        ) : hofFilter === 'All Time' ? (
          /* Grouped by month */
          <div className="space-y-6">
            {Object.entries(groupedHof).map(([period, entries]) => (
              <div key={period}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">{period}</span>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full">{entries.length}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {entries.map((entry, i) => (
                    <div key={i} className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-amber-100 p-2 rounded-xl shrink-0"><Trophy size={16} className="text-amber-600" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-amber-900 text-sm leading-tight">{entry.parsed.type}</p>
                        {entry.parsed.note && <p className="text-[10px] text-amber-700 mt-0.5 italic">"{entry.parsed.note}"</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <img src={entry.driver.imgUrl} alt={entry.driver.name} className="w-5 h-5 rounded-full border border-amber-200 object-cover" />
                          <span className="text-xs font-bold text-amber-700 truncate">{entry.driver.name}</span>
                        </div>
                        {entry.parsed.date && (
                          <p className="text-[10px] text-amber-400 font-mono mt-1.5 flex items-center gap-1">
                            <Calendar size={9} /> Issued {entry.parsed.date}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single month filtered view */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hofAwards.map((entry, i) => (
              <div key={i} className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-amber-100 p-2.5 rounded-xl shrink-0"><Trophy size={18} className="text-amber-600" /></div>
                <div className="min-w-0">
                  <p className="font-black text-amber-900 text-sm">{entry.parsed.type}</p>
                  {entry.parsed.note && <p className="text-[10px] text-amber-700 italic mt-0.5">"{entry.parsed.note}"</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <img src={entry.driver.imgUrl} alt={entry.driver.name} className="w-5 h-5 rounded-full border border-amber-200 object-cover" />
                    <span className="text-xs font-bold text-amber-700 truncate">{entry.driver.name}</span>
                  </div>
                  {entry.parsed.date && (
                    <p className="text-[10px] text-amber-500 font-mono mt-1.5 flex items-center gap-1">
                      <Calendar size={9} /> Issued {entry.parsed.date}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Award Modal */}
      {awardModal !== null && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-t-3xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl"><Trophy size={20} className="text-white" /></div>
                <div>
                  <h2 className="text-lg font-black text-white">Issue Award</h2>
                  <p className="text-amber-100 text-xs mt-0.5">Recognise exceptional performance</p>
                </div>
              </div>
              <button onClick={() => { setAwardModal(null); setAwardSuccess(false); }} className="text-amber-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl p-1.5 transition-colors"><X size={18} /></button>
            </div>
            {awardSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="bg-emerald-50 border-4 border-emerald-400 rounded-full w-16 h-16 mx-auto flex items-center justify-center"><CheckCircle2 size={32} className="text-emerald-500" /></div>
                <h3 className="text-xl font-black text-slate-950">Award Issued!</h3>
                <p className="text-sm text-slate-600">Saved to the driver's permanent record and synced to the database.</p>
                <button onClick={() => { setAwardModal(null); setAwardSuccess(false); }} className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">Done</button>
              </div>
            ) : (
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Driver selector */}
                <div>
                  <label className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Driver</label>
                  <select value={awardModal.driverId} onChange={e => { const d = drivers.find(dr => dr.id === e.target.value); setAwardModal({ driverId: e.target.value, driverName: d?.name || '' }); }}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="">— Select a driver —</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                {/* Scoring Period */}
                <div>
                  <label className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Scoring Period
                    <span className="ml-2 text-[10px] font-normal text-slate-500 normal-case">Which month is this award for?</span>
                  </label>
                  <select value={awardPeriod} onChange={e => setAwardPeriod(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400">
                    {last24Months.map((m, i) => (
                      <option key={m} value={m}>{m}{i === 0 ? ' (Current Month)' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Award Type */}
                <div>
                  <label className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Award Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Driver of the Month', 'Top Fuel Efficiency', 'Zero Incidents Award', 'Most Trips Completed', 'Best Punctuality', 'Special Recognition'].map(type => (
                      <button key={type} onClick={() => setAwardType(type)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all border ${
                          awardType === type ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                        }`}>{type}</button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Note <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                  <textarea value={awardNote} onChange={e => setAwardNote(e.target.value)} rows={2}
                    placeholder="Add a custom citation for this award..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                </div>

                {/* Live preview */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                  <Trophy size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 leading-relaxed">
                    <span className="font-black">{awardType}</span>
                    {awardNote && <span className="italic"> — "{awardNote}"</span>}
                    <span className="text-amber-500 font-semibold"> · {awardPeriod}</span>
                    {awardModal.driverName && (
                      <span className="text-amber-600"> · {awardModal.driverName}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button onClick={() => { setAwardModal(null); setAwardSuccess(false); }} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors">Cancel</button>
                  <button
                    disabled={!awardModal.driverId || awardSaving}
                    onClick={() => {
                      if (!awardModal.driverId) return;
                      setAwardSaving(true);
                      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                      // Pipe-delimited format: type|period|note|date
                      const entry = `${awardType}|${awardPeriod}|${awardNote}|${dateStr}`;
                      setDrivers((prev: any) => prev.map((d: any) => d.id === awardModal!.driverId ? { ...d, awards: [...(d.awards || []), entry] } : d));
                      setTimeout(() => { setAwardSaving(false); setAwardSuccess(true); setHofFilter(awardPeriod); }, 600);
                    }}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {awardSaving ? <span className="animate-pulse">Saving...</span> : <><Gift size={14} /> Issue Award</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    );
  };


  const handleSaveCity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCity.id) {
        const { error } = await supabase.from('fuel_cities').update({ name: editingCity.name, region: editingCity.region }).eq('id', editingCity.id);
        if (error) throw error;
        setFuelCities(prev => prev.map(c => c.id === editingCity.id ? { ...c, name: editingCity.name || '', region: editingCity.region } : c));
      } else {
        const newCity = { name: editingCity.name || '', region: editingCity.region };
        const { data, error } = await supabase.from('fuel_cities').insert([newCity]).select();
        if (error) throw error;
        if (data && data.length > 0) setFuelCities(prev => [...prev, data[0] as FuelCity]);
      }
      setIsCityModalOpen(false);
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteCity = async (id: string) => {
    if (!window.confirm('Delete this city?')) return;
    try {
      const { error } = await supabase.from('fuel_cities').delete().eq('id', id);
      if (error) throw error;
      setFuelCities(prev => prev.filter(c => c.id !== id));
    } catch (err: any) { alert(err.message); }
  };

  const handleSaveStation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: editingStation.name || '',
        city_id: editingStation.city_id || null,
        is_partner: !!editingStation.is_partner,
        supplier: editingStation.supplier || null
      };
      if (editingStation.id) {
        const { error } = await supabase.from('fuel_stations').update(payload).eq('id', editingStation.id);
        if (error) throw error;
        setFuelStations(prev => prev.map(s => s.id === editingStation.id ? { ...s, ...payload } : s));
      } else {
        const { data, error } = await supabase.from('fuel_stations').insert([payload]).select();
        if (error) throw error;
        if (data && data.length > 0) setFuelStations(prev => [...prev, data[0] as FuelStation]);
      }
      setIsStationModalOpen(false);
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteStation = async (id: string) => {
    if (!window.confirm('Delete this station?')) return;
    try {
      const { error } = await supabase.from('fuel_stations').delete().eq('id', id);
      if (error) throw error;
      setFuelStations(prev => prev.filter(s => s.id !== id));
    } catch (err: any) { alert(err.message); }
  };


  const renderFuel = () => {
    // ── Analytics Computations ──────────────────────────────────────────────
    const totalFuelLiters = allFuelCollections.reduce((acc, f) => acc + f.liters, 0);
    const totalFuelCost = allFuelCollections.reduce((acc, f) => acc + (f.liters * f.costPerLiter), 0);
    const partnerLiters = allFuelCollections.filter(f => f.isPartnerStation !== false).reduce((acc, f) => acc + f.liters, 0);
    const nonPartnerLiters = allFuelCollections.filter(f => f.isPartnerStation === false).reduce((acc, f) => acc + f.liters, 0);
    const mmLiters = allFuelCollections.filter(f => f.paymentMethod === 'Mobile Money').reduce((acc, f) => acc + f.liters, 0);
    const tripsCompleted = new Set(allFuelCollections.map(f => f.tripLogId).filter(Boolean)).size;

    // Per-driver totals (for dashboard card)
    const fuelByDriver = drivers.map(d => ({
      driver: d,
      liters: allFuelCollections.filter(f => f.driverId === d.id).reduce((acc, f) => acc + f.liters, 0),
      cost: allFuelCollections.filter(f => f.driverId === d.id).reduce((acc, f) => acc + f.liters * f.costPerLiter, 0),
    })).filter(x => x.liters > 0).sort((a, b) => b.liters - a.liters);

    // Per-supplier totals
    const suppliers = [...new Set(allFuelCollections.map(f => f.supplier || 'Unknown'))];
    const fuelBySupplier = suppliers.map(s => ({
      supplier: s,
      liters: allFuelCollections.filter(f => (f.supplier || 'Unknown') === s).reduce((acc, f) => acc + f.liters, 0),
    })).sort((a, b) => b.liters - a.liters);

    // Per-city totals
    const cities = [...new Set(allFuelCollections.map(f => f.location).filter(Boolean))];
    const fuelByCity = cities.map(c => ({
      city: c,
      liters: allFuelCollections.filter(f => f.location === c).reduce((acc, f) => acc + f.liters, 0),
    })).sort((a, b) => b.liters - a.liters).slice(0, 6);

    // Avg efficiency
    const avgEffKm = totalFuelLiters > 0 && totalDistance > 0 ? (totalDistance / totalFuelLiters).toFixed(1) : '—';

    // ── Alerts ────────────────────────────────────────────────────────────────
    const alerts: { type: 'red' | 'amber'; msg: string }[] = [];
    if (nonPartnerLiters > 0) alerts.push({ type: 'amber', msg: `${nonPartnerLiters.toFixed(0)} L purchased from non-partner stations — review receipts.` });
    if (mmLiters > 0) alerts.push({ type: 'amber', msg: `${mmLiters.toFixed(0)} L purchased via Mobile Money — verify authorisation.` });
    allFuelCollections.forEach(f => {
      if (f.liters > 55) alerts.push({ type: 'red', msg: `Unusually large fill-up: ${f.liters} L by ${drivers.find(d => d.id === f.driverId)?.name || f.driverId} at ${f.stationName} (${f.date}).` });
    });
    // Duplicate detection: same driver, date, station within same day
    const dupeMap: Record<string, number> = {};
    allFuelCollections.forEach(f => {
      const key = `${f.driverId}-${f.date}-${f.stationName}`;
      dupeMap[key] = (dupeMap[key] || 0) + 1;
    });
    Object.entries(dupeMap).forEach(([key, count]) => {
      if (count > 1) {
        const [dId, date, stn] = key.split('-');
        alerts.push({ type: 'red', msg: `Possible duplicate: ${count} transactions at "${stn}" on ${date} for driver ${drivers.find(d => d.id === dId)?.name || dId}.` });
      }
    });

    // ── Filtered Transactions ─────────────────────────────────────────────────
    const FUEL_PAGE_SIZE = 30;
    const filteredTx = allFuelCollections.filter(f => {
      const driver = drivers.find(d => d.id === f.driverId);
      if (fuelSearchQuery) {
        const q = fuelSearchQuery.toLowerCase();
        if (!driver?.name.toLowerCase().includes(q) && !f.stationName.toLowerCase().includes(q) && !f.location?.toLowerCase().includes(q)) return false;
      }
      if (fuelDriverFilter !== 'all' && f.driverId !== fuelDriverFilter) return false;
      if (fuelSupplierFilter !== 'all' && (f.supplier || 'Unknown') !== fuelSupplierFilter) return false;
      if (fuelPaymentFilter !== 'all' && f.paymentMethod !== fuelPaymentFilter) return false;
      if (fuelFuelTypeFilter !== 'all' && (f.fuelType || '') !== fuelFuelTypeFilter) return false;
      if (fuelPartnerFilter !== 'all' && (f.stationName || '').toLowerCase() !== fuelPartnerFilter.toLowerCase()) return false;
      if (fuelCityFilter !== 'all' && f.location !== fuelCityFilter) return false;
      if (fuelDateFrom && f.date && f.date < fuelDateFrom) return false;
      if (fuelDateTo && f.date && f.date > fuelDateTo) return false;
      return true;
    }).sort((a, b) => {
      if (fuelSortBy === 'date_desc') return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
      if (fuelSortBy === 'date_asc') return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
      if (fuelSortBy === 'liters_desc') return b.liters - a.liters;
      if (fuelSortBy === 'liters_asc') return a.liters - b.liters;
      const costA = a.liters * a.costPerLiter;
      const costB = b.liters * b.costPerLiter;
      if (fuelSortBy === 'cost_desc') return costB - costA;
      if (fuelSortBy === 'cost_asc') return costA - costB;
      return 0;
    });

    const pagedTx = filteredTx.slice(fuelPage * FUEL_PAGE_SIZE, (fuelPage + 1) * FUEL_PAGE_SIZE);
    const totalPages = Math.ceil(filteredTx.length / FUEL_PAGE_SIZE);
    const filteredLiters = filteredTx.reduce((acc, f) => acc + f.liters, 0);
    const filteredCost = filteredTx.reduce((acc, f) => acc + f.liters * f.costPerLiter, 0);

    // ── Export helpers ───────────────────────────────────────────────────────
    const downloadBlob = (blob: Blob, filename: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
    };

    const exportFuelCSV = () => {
      const headers = ['Date','Time','Driver','Vehicle','Project','Station','District','City','Fuel_Type','Litres','Cost_Per_Litre','Total_Cost','Payment_Method','Receipt_Ref','Partner_Station','Non_Partner_Reason','Trip_ID','Remarks'];
      const rows = filteredTx.map(f => {
        const driver = drivers.find(d => d.id === f.driverId);
        const vehicle = vehicles.find(v => v.id === f.vehicleId);
        const esc = (v?: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        return [esc(f.date), esc(f.time), esc(driver?.name), esc(vehicle ? `${vehicle.makeModel} (${vehicle.plateNumber})` : ''), esc(f.supplier), esc(f.stationName), esc(f.district), esc(f.location), esc(f.fuelType), f.liters.toFixed(2), f.costPerLiter.toFixed(2), (f.liters * f.costPerLiter).toFixed(2), esc(f.paymentMethod), esc(parseReceipt(f.receiptNumber).text), f.isPartnerStation === false ? 'No' : 'Yes', esc(f.nonPartnerReason), esc(f.tripLogId), esc(f.remarks)].join(',');
      });
      downloadBlob(new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' }), `fuel-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const exportFuelPDF = () => {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      // Title
      doc.setFontSize(16); doc.setTextColor(30, 30, 90);
      doc.text('BIG — Fuel Transactions Report', 14, 16);
      doc.setFontSize(9); doc.setTextColor(100, 100, 120);
      doc.text(`Generated: ${today}   |   ${filteredTx.length} transactions   |   ${filteredLiters.toFixed(0)} L   |   Le ${filteredCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 14, 23);
      autoTable(doc, {
        startY: 28,
        head: [['Date', 'Driver', 'Vehicle', 'Project', 'Station', 'City', 'Fuel Type', 'Litres', 'Cost/L', 'Total (Le)', 'Payment', 'Partner', 'Receipt']],
        body: filteredTx.map(f => {
          const driver = drivers.find(d => d.id === f.driverId);
          const vehicle = vehicles.find(v => v.id === f.vehicleId);
          return [
            f.date || '', driver?.name || '', vehicle ? `${vehicle.plateNumber}` : '',
            f.supplier || '', f.stationName || '', `${f.location || ''}${f.district ? ` (${f.district})` : ''}`,
            f.fuelType || '', f.liters.toFixed(1), f.costPerLiter.toFixed(2), (f.liters * f.costPerLiter).toLocaleString(undefined, { maximumFractionDigits: 0 }),
            f.paymentMethod || '', f.isPartnerStation === false ? 'No' : 'Yes', parseReceipt(f.receiptNumber).text || '',
          ];
        }),
        headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
        bodyStyles: { fontSize: 7, textColor: [30, 30, 30] },
        alternateRowStyles: { fillColor: [245, 247, 255] },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 10) {
            const val = data.cell.raw as string;
            if (val === 'No') { data.cell.styles.textColor = [185, 28, 28]; data.cell.styles.fontStyle = 'bold'; }
          }
        },
        margin: { left: 14, right: 14 },
        styles: { cellPadding: 2 },
      });
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7); doc.setTextColor(150);
        doc.text(`BIG Fleet Management — Confidential   |   Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 6);
      }
      doc.save(`fuel-transactions-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const exportSuppliersCSV = () => {
      const headers = ['Name','Short_Code','Partner_Status','Contact_Person','Phone','Email','Website','Head_Office_Address','City','Country','Account_Number','Contract_Ref','Contract_Start','Contract_End','Credit_Limit_Le','Notes'];
      const rows = fuelSuppliers.map(s => {
        const esc = (v?: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        return [esc(s.name), esc(s.shortCode), s.isPartner ? 'Partner' : 'Non-Partner', esc(s.contactPerson), esc(s.phone), esc(s.email), esc(s.website), esc(s.headOfficeAddress), esc(s.city), esc(s.country), esc(s.accountNumber), esc(s.contractRef), esc(s.contractStartDate), esc(s.contractEndDate), s.creditLimit ?? '', esc(s.notes)].join(',');
      });
      downloadBlob(new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' }), `fuel-projects-${new Date().toISOString().split('T')[0]}.csv`);
    };

    const exportSuppliersPDF = () => {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      doc.setFontSize(16); doc.setTextColor(30, 30, 90);
      doc.text('BIG — Fuel Project Registry', 14, 16);
      doc.setFontSize(9); doc.setTextColor(100, 100, 120);
      doc.text(`Generated: ${today}   |   ${fuelSuppliers.length} projects   |   ${fuelSuppliers.filter(s => s.isPartner).length} partners`, 14, 23);
      autoTable(doc, {
        startY: 28,
        head: [['Project', 'Status', 'Contact', 'Phone', 'Email', 'Account #', 'Contract Ref', 'Contract End', 'Credit Limit (Le)']],
        body: fuelSuppliers.map(s => [
          `${s.name}${s.shortCode ? ` (${s.shortCode})` : ''}`,
          s.isPartner ? 'Partner' : 'Non-Partner',
          s.contactPerson || '', s.phone || '', s.email || '',
          s.accountNumber || '', s.contractRef || '', s.contractEndDate || '',
          s.creditLimit ? s.creditLimit.toLocaleString() : '',
        ]),
        headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
        alternateRowStyles: { fillColor: [245, 247, 255] },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 1) {
            const val = data.cell.raw as string;
            data.cell.styles.textColor = val === 'Partner' ? [22, 101, 52] : [185, 28, 28];
            data.cell.styles.fontStyle = 'bold';
          }
        },
        margin: { left: 14, right: 14 },
      });
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7); doc.setTextColor(150);
        doc.text(`BIG Fleet Management — Confidential   |   Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 6);
      }
      doc.save(`fuel-projects-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const maxBarLiters = Math.max(...fuelByDriver.map(x => x.liters), 1);
    const maxSupplierLiters = Math.max(...fuelBySupplier.map(x => x.liters), 1);
    const maxCityLiters = Math.max(...fuelByCity.map(x => x.liters), 1);

    const paymentBadge = (pm?: string) => {
      if (pm === 'Fuel Card') return 'bg-blue-50 text-blue-700 border border-blue-200';
      if (pm === 'Voucher') return 'bg-purple-50 text-purple-700 border border-purple-200';
      if (pm === 'Mobile Money') return 'bg-amber-50 text-amber-700 border border-amber-200';
      if (pm === 'Cash') return 'bg-slate-50 text-slate-700 border border-slate-200';
      return 'bg-slate-50 text-slate-600 border border-slate-200';
    };

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">Fuel Management</h2>
            <p className="text-slate-600 text-sm mt-1">Multi-project · Multi-station · Trip-linked fuel tracking</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {(['overview', 'fuel', 'settings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFuelSubTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${fuelSubTab === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-700'}`}
                >
                  {tab === 'overview' ? '📊 Overview' : tab === 'fuel' ? '⛽ Fuel Logs' : '⚙️ Settings'}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setStandaloneFuelEntry({
                  id: uuidv4(),
                  stationName: '', supplier: 'NP', isPartnerStation: true, location: '',
                  liters: 0, costPerLiter: 15.5, paymentMethod: 'Fuel Card',
                  date: new Date().toISOString().split('T')[0], time: '',
                  fuelType: 'Diesel',
                });
                setStandaloneFuelDriverId('');
                setStandaloneFuelVehicleId('');
                setStandaloneFuelTripLogId('');
                setStandaloneFuelReceiptFile(null); setIsStandaloneFuelModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
            >
              <Fuel size={15} /> Record Fuel Fill-Up
            </button>
          </div>
        </div>

        {fuelSubTab === 'overview' && (
          <div className="space-y-6">
        {/* ── Overview Panel ── */}
        {/* ── Alerts ── */}
        {alerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setFuelFiltersOpen(prev => !prev)}
              className="w-full px-5 py-3 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600" />
                <span className="font-bold text-red-800 text-sm">{alerts.length} Alert{alerts.length > 1 ? 's' : ''} Detected</span>
              </div>
              <span className="text-xs text-red-500">{fuelFiltersOpen ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {fuelFiltersOpen && (
              <div className="px-5 pb-4 space-y-2">
                {alerts.map((a, i) => (
                  <div key={i} className={`flex items-start gap-2 p-3 rounded-xl text-xs font-medium ${a.type === 'red' ? 'bg-red-100 text-red-800' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" /> {a.msg}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Litres', value: `${totalFuelLiters.toFixed(0)} L`, icon: Fuel, color: 'blue' },
            { label: 'Total Cost', value: `Le ${totalFuelCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingDown, color: 'emerald' },
            { label: 'Transactions', value: allFuelCollections.length.toString(), icon: FileText, color: 'amber' },
            { label: 'Avg Efficiency', value: `${avgEffKm} km/L`, icon: TrendingUp, color: 'blue' },
            { label: 'Partner Station L', value: `${partnerLiters.toFixed(0)} L`, icon: CheckCircle2, color: 'emerald' },
            { label: 'Non-Partner L', value: `${nonPartnerLiters.toFixed(0)} L`, icon: AlertTriangle, color: 'red' },
            { label: 'Mobile Money L', value: `${mmLiters.toFixed(0)} L`, icon: ShieldAlert, color: 'amber' },
            { label: 'Trips With Fuel', value: tripsCompleted.toString(), icon: Navigation, color: 'blue' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 bg-${color}-50 text-${color}-600 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                <h3 className="text-base font-black text-slate-950 truncate">{value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* ── Analytics Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fuel by Project */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-950 text-sm uppercase tracking-wider mb-4">By Project</h3>
            <div className="space-y-3">
              {fuelBySupplier.map(({ supplier, liters }) => (
                <div key={supplier}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">{supplier}</span>
                    <span className="text-slate-600">{liters.toFixed(0)} L</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${supplierColors[supplier as string] || 'bg-slate-400'}`} style={{ width: `${(liters / maxSupplierLiters) * 100}%` }} />
                  </div>
                </div>
              ))}
              {fuelBySupplier.length === 0 && <p className="text-xs text-slate-500 italic">No data yet.</p>}
            </div>
          </div>

          {/* Fuel by Driver */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-950 text-sm uppercase tracking-wider mb-4">By Driver</h3>
            <div className="space-y-3">
              {fuelByDriver.slice(0, 5).map(({ driver, liters }) => (
                <div key={driver.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700 truncate">{driver.name}</span>
                    <span className="text-slate-600 shrink-0 ml-2">{liters.toFixed(0)} L</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(liters / maxBarLiters) * 100}%` }} />
                  </div>
                </div>
              ))}
              {fuelByDriver.length === 0 && <p className="text-xs text-slate-500 italic">No data yet.</p>}
            </div>
          </div>

          {/* Fuel by City */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-950 text-sm uppercase tracking-wider mb-4">By City</h3>
            <div className="space-y-3">
              {fuelByCity.map(({ city, liters }) => (
                <div key={city}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">{city}</span>
                    <span className="text-slate-600">{liters.toFixed(0)} L</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(liters / maxCityLiters) * 100}%` }} />
                  </div>
                </div>
              ))}
              {fuelByCity.length === 0 && <p className="text-xs text-slate-500 italic">No data yet.</p>}
            </div>
          </div>
        </div>
        </div>
        )}

        {fuelSubTab === 'fuel' && (
          <div className="space-y-6 animate-fade-in">

        {/* ── Fuel Log Detail View ── */}
        {viewingFuelCollection && (() => {
          const fc = viewingFuelCollection;
          const _driver = drivers.find(d => d.id === fc.driverId);
          const _vehicle = vehicles.find(v => v.id === fc.vehicleId);
          const _parentLog = logs.find(l => l.id === fc.tripLogId);
          const _isNonPartner = fc.isPartnerStation === false;
          const totalCost = (fc.liters || 0) * (fc.costPerLiter || 0);
          return (
            <div className="animate-fade-in">
              {!isExportingModal && (
                <div className="flex items-center justify-between mb-5">
                  <button onClick={() => setViewingFuelCollection(null)} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"><ArrowLeft size={16} /> Back to Fuel Logs</button>
                  <button 
                    onClick={async () => {
                      setIsExportingModal(true);
                      try {
                        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        
                        doc.setFontSize(18); doc.setTextColor(30, 30, 90);
                        doc.text('BIG — Fuel Log Details', 14, 20);
                        
                        doc.setFontSize(10); doc.setTextColor(100, 100, 120);
                        doc.text(`Exported on: ${today}   |   Ref: ${parseReceipt(fc.receiptNumber).text || 'N/A'}`, 14, 28);
                        
                        const tableData = [
                          ['Date & Time', `${fc.date || ''} ${fc.time || ''}`.trim()],
                          ['Driver', _driver?.name || 'Unknown'],
                          ['Vehicle', _vehicle ? `${_vehicle.makeModel} (${_vehicle.plateNumber})` : 'Unknown'],
                          ['Station', `${fc.stationName || ''} - ${fc.location || ''} ${fc.district ? `(${fc.district})` : ''}`],
                          ['Project / Supplier', fc.supplier || 'N/A'],
                          ['Fuel Type', fc.fuelType || 'N/A'],
                          ['Volume & Rate', `${(fc.liters || 0).toFixed(1)} L @ Le ${(fc.costPerLiter || 0).toFixed(2)} / L`],
                          ['Total Cost', `Le ${((fc.liters || 0) * (fc.costPerLiter || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`],
                          ['Payment Method', fc.paymentMethod || 'N/A'],
                          ['Partner Station', _isNonPartner ? 'No' : 'Yes']
                        ];
                        
                        if (_isNonPartner && fc.nonPartnerReason) {
                          tableData.push(['Non-Partner Reason', fc.nonPartnerReason]);
                        }
                        if (fc.remarks) {
                          tableData.push(['Remarks', fc.remarks]);
                        }
                        
                        autoTable(doc, {
                          startY: 35,
                          head: [['Field', 'Details']],
                          body: tableData,
                          theme: 'grid',
                          headStyles: { fillColor: [40, 40, 100], textColor: 255, fontStyle: 'bold' },
                          columnStyles: {
                            0: { fontStyle: 'bold', cellWidth: 50, fillColor: [245, 247, 250] },
                            1: { cellWidth: 'auto' }
                          },
                          styles: { fontSize: 10, cellPadding: 6 }
                        });
                        
                        const receiptUrl = parseReceipt(fc.receiptNumber).url;
                        if (receiptUrl) {
                          const finalY = (doc as any).lastAutoTable.finalY + 15;
                          doc.setFontSize(10);
                          doc.setTextColor(50, 50, 200);
                          doc.textWithLink('View Attached Receipt Image Online', 14, finalY, { url: receiptUrl });
                        }
                    
                        doc.save(`Fuel-Log-${fc.stationName?.replace(/\s+/g, '-') || 'Details'}-${fc.date || today}.pdf`);
                      } catch (err) {
                        console.error('Export failed', err);
                        alert('Failed to export PDF');
                      } finally {
                        setIsExportingModal(false);
                      }
                    }} 
                    disabled={isExportingModal}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isExportingModal ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                    {isExportingModal ? 'Exporting...' : 'Export to PDF'}
                  </button>
                </div>
              )}

              <div id="fuel-log-details-export-area" className={isExportingModal ? 'p-6 bg-slate-50' : ''}>
                {/* Hero */}
                <div className={`rounded-2xl p-6 mb-6 ${_isNonPartner ? 'bg-gradient-to-br from-red-600 to-red-700' : 'bg-gradient-to-br from-blue-600 to-indigo-700'} text-white shadow-xl`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2"><Fuel size={20} className="opacity-80" /><span className="text-sm font-bold opacity-80 uppercase tracking-wider">Fuel Fill-Up Record</span></div>
                      <h1 className="text-2xl font-black mb-1">{fc.stationName || 'Unknown Station'}</h1>
                      <p className="opacity-75 text-sm">{fc.location}{fc.district ? ` · ${fc.district}` : ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-3xl font-black">Le {totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      <div className="text-sm opacity-75 mt-1">{(fc.liters || 0).toFixed(1)} L @ Le {(fc.costPerLiter || 0).toFixed(2)}/L</div>
                      {_isNonPartner ? <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 border border-white/30"><AlertTriangle size={11} /> Non-Partner</span> : <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 border border-white/30"><CheckCircle2 size={11} /> Partner Station</span>}
                    </div>
                  </div>
                  {!isExportingModal && (
                    <div className="flex gap-3 mt-6 pt-4 border-t border-white/20">
                      <button onClick={() => { setStandaloneFuelEntry({ ...fc }); setStandaloneFuelDriverId(fc.driverId || ''); setStandaloneFuelVehicleId(fc.vehicleId || ''); setStandaloneFuelTripLogId(fc.tripLogId || ''); setStandaloneFuelReceiptFile(null); setIsStandaloneFuelModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-sm font-bold transition-colors"><Pencil size={14} /> Edit Entry</button>
                      <button onClick={() => setDeletingFuelCollection(fc)} className="flex items-center gap-2 px-4 py-2 bg-red-800/40 hover:bg-red-800/60 border border-red-400/30 rounded-xl text-sm font-bold transition-colors"><Trash2 size={14} /> Delete Entry</button>
                    </div>
                  )}
                </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Calendar size={12} /> Date & Time</p>
                  <p className="text-xl font-black text-slate-900">{fc.date || '—'}</p>
                  <p className="text-sm text-slate-500 mt-1">{fc.time || 'Time not recorded'}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Fuel size={12} /> Fuel Type</p>
                  {fc.fuelType ? <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-black ${fc.fuelType === 'Diesel' ? 'bg-amber-100 text-amber-800' : fc.fuelType === 'Premium' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{fc.fuelType}</span> : <span className="text-slate-400 text-sm">Not recorded</span>}
                  <p className="text-xs text-slate-500 mt-2">Project: <span className="font-bold">{fc.supplier || '—'}</span></p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CreditCard size={12} /> Payment</p>
                  <p className="text-xl font-black text-slate-900">{fc.paymentMethod || '—'}</p>
                  <p className="text-sm text-slate-500 mt-1">Receipt: <span className="font-mono font-bold">{parseReceipt(fc.receiptNumber).text || '—'}</span></p>
                  {parseReceipt(fc.receiptNumber).url && (
                    <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={parseReceipt(fc.receiptNumber).url} alt="Receipt" className="w-full h-full object-contain" />
                      <a href={parseReceipt(fc.receiptNumber).url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"><ExternalLink className="text-white drop-shadow-md" /></a>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><User size={12} /> Driver</p>
                  <div className="flex items-center gap-3">
                    {_driver?.imgUrl ? <img src={_driver.imgUrl} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200" /> : <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center"><User size={20} className="text-slate-500" /></div>}
                    <div><p className="font-black text-slate-900">{_driver?.name || '—'}</p><p className="text-xs text-slate-500">{_driver?.licenseNumber ? `Lic: ${_driver.licenseNumber}` : 'No license on file'}</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Car size={12} /> Vehicle</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center"><Car size={20} className="text-blue-600" /></div>
                    <div><p className="font-black text-slate-900">{_vehicle?.makeModel || '—'}</p><p className="text-xs font-mono text-slate-500">{_vehicle?.plateNumber || '—'}</p></div>
                  </div>
                </div>
              </div>

              {_parentLog && (<div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><ExternalLink size={12} /> Linked Trip Log</p><div className="flex items-center justify-between"><div><p className="font-bold text-slate-800">{_parentLog.date}</p><p className="text-xs text-slate-500">Distance: {_parentLog.distanceTraveledKm} km</p></div><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${_parentLog.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : _parentLog.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{_parentLog.approvalStatus || 'Pending'}</span></div></div>)}
              {_isNonPartner && fc.nonPartnerReason && (<div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6"><p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><AlertTriangle size={12} /> Non-Partner Reason</p><p className="text-sm text-amber-800 font-medium">{fc.nonPartnerReason}</p></div>)}
              {fc.remarks && (<div className="bg-slate-50 border border-slate-200 rounded-2xl p-5"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Remarks</p><p className="text-sm text-slate-700">{fc.remarks}</p></div>)}
              </div>
            </div>
          );
        })()}

        {!viewingFuelCollection && (<>
        {/* ── Filters Panel ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Search driver, station, or city..."
                  value={fuelSearchQuery}
                  onChange={e => { setFuelSearchQuery(e.target.value); setFuelPage(0); }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <SearchableSelect 
                value={fuelSortBy} 
                onChange={(v: any) => { setFuelSortBy(v as any); setFuelPage(0); }} 
                options={[
                  {value: 'date_desc', label: 'Newest First'},
                  {value: 'date_asc', label: 'Oldest First'},
                  {value: 'liters_desc', label: 'Highest Litres'},
                  {value: 'liters_asc', label: 'Lowest Litres'},
                  {value: 'cost_desc', label: 'Highest Cost'},
                  {value: 'cost_asc', label: 'Lowest Cost'}
                ]} 
                placeholder="Sort By" 
              />
              <SearchableSelect 
                value={fuelDriverFilter} 
                onChange={(v: any) => { setFuelDriverFilter(v); setFuelPage(0); }} 
                options={[
                  {value: 'all', label: 'All Drivers'},
                  ...drivers.map(d => ({value: d.id, label: d.name}))
                ]} 
                placeholder="All Drivers" 
              />
              <SearchableSelect 
                value={fuelSupplierFilter} 
                onChange={(v: any) => { setFuelSupplierFilter(v); setFuelPage(0); }} 
                options={[
                  {value: 'all', label: 'All Projects'},
                  ...[...new Set(allFuelCollections.map(f => f.supplier || 'Unknown'))].map(s => ({value: s, label: s}))
                ]} 
                placeholder="All Projects" 
              />
              <SearchableSelect 
                value={fuelPaymentFilter} 
                onChange={(v: any) => { setFuelPaymentFilter(v); setFuelPage(0); }} 
                options={[
                  {value: 'all', label: 'All Payments'},
                  {value: 'Fuel Card', label: 'Fuel Card'},
                  {value: 'Voucher', label: 'Voucher'},
                  {value: 'Mobile Money', label: 'Mobile Money'},
                  {value: 'Cash', label: 'Cash'}
                ]} 
                placeholder="All Payments" 
              />
              <SearchableSelect 
                value={fuelFuelTypeFilter} 
                onChange={(v: any) => { setFuelFuelTypeFilter(v); setFuelPage(0); }} 
                options={[
                  {value: 'all', label: 'All Fuel Types'},
                  {value: 'Petrol', label: '⛽ Petrol'},
                  {value: 'Diesel', label: '🟡 Diesel'},
                  {value: 'Premium', label: '💜 Premium'}
                ]} 
                placeholder="All Fuel Types" 
              />
              <SearchableSelect 
                value={fuelPartnerFilter} 
                onChange={(v: any) => { setFuelPartnerFilter(v); setFuelPage(0); }} 
                options={[
                  {value: 'all', label: 'All Stations'},
                  ...[...new Set(allFuelCollections.map(f => f.stationName).filter(Boolean))].sort().map(s => ({value: s, label: s}))
                ]} 
                placeholder="All Stations" 
              />
              <SearchableSelect 
                value={fuelCityFilter} 
                onChange={(v: any) => { setFuelCityFilter(v); setFuelPage(0); }} 
                options={[
                  {value: 'all', label: 'All Cities'},
                  ...[...new Set(allFuelCollections.map(f => f.location).filter(Boolean))].sort().map(c => ({value: c, label: c}))
                ]} 
                placeholder="All Cities" 
              />
              <input type="date" value={fuelDateFrom} onChange={e => { setFuelDateFrom(e.target.value); setFuelPage(0); }} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400" title="From date" />
              <input type="date" value={fuelDateTo} onChange={e => { setFuelDateTo(e.target.value); setFuelPage(0); }} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400" title="To date" />
              {(fuelSearchQuery || fuelSortBy !== 'date_desc' || fuelDriverFilter !== 'all' || fuelSupplierFilter !== 'all' || fuelPaymentFilter !== 'all' || fuelFuelTypeFilter !== 'all' || fuelPartnerFilter !== 'all' || fuelCityFilter !== 'all' || fuelDateFrom || fuelDateTo) && (
                <button onClick={() => { setFuelSearchQuery(''); setFuelSortBy('date_desc'); setFuelDriverFilter('all'); setFuelSupplierFilter('all'); setFuelPaymentFilter('all'); setFuelFuelTypeFilter('all'); setFuelPartnerFilter('all'); setFuelCityFilter('all'); setFuelDateFrom(''); setFuelDateTo(''); setFuelPage(0); }} className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-100">
                  Clear
                </button>
              )}
            </div>
            </div>
          </div>

          {/* Summary row + Export */}
          <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-4 text-xs text-slate-600">
            <div className="flex bg-slate-200/50 p-0.5 rounded-lg mr-2 border border-slate-200">
              <button onClick={() => setFuelViewMode('grid')} className={`p-1 rounded flex items-center justify-center transition-colors ${fuelViewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`} title="Grid View"><LayoutGrid size={14} /></button>
              <button onClick={() => setFuelViewMode('list')} className={`p-1 rounded flex items-center justify-center transition-colors ${fuelViewMode === 'list' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`} title="List View"><List size={14} /></button>
            </div>
            <span><span className="font-bold text-slate-700">{filteredTx.length}</span> transactions</span>
            <span><span className="font-bold text-blue-600">{filteredLiters.toFixed(0)} L</span> total</span>
            <span><span className="font-bold text-slate-700">Le {filteredCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> cost</span>
            <div className="ml-auto flex items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase mr-2">Export:</span>
              <div className="flex rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                <button
                  onClick={exportFuelCSV}
                  disabled={filteredTx.length === 0}
                  title="Download as CSV"
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-emerald-700"
                >
                  <Download size={11} /> CSV
                </button>
                <button
                  onClick={exportFuelPDF}
                  disabled={filteredTx.length === 0}
                  title="Download as PDF"
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <FileText size={11} /> PDF
                </button>
              </div>
            </div>
          </div>

          {/* ── Transaction Table ── */}
          {fuelViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {pagedTx.map(fc => {
                const _driver = drivers.find(d => d.id === fc.driverId);
                const _vehicle = vehicles.find(v => v.id === fc.vehicleId);
                const _isNonPartner = fc.isPartnerStation === false;
                return (
                  <div key={fc.id} onClick={() => setViewingFuelCollection(fc)} className={`bg-white rounded-2xl border flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${_isNonPartner ? 'border-red-200' : 'border-slate-200'}`}>
                    <div className={`p-4 border-b flex justify-between items-start gap-2 ${_isNonPartner ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/50 border-slate-100'}`}>
                      <div className="flex flex-col min-w-0">
                        <h4 className="font-bold text-slate-900 truncate text-sm">{fc.stationName}</h4>
                        <p className="text-xs text-slate-500 truncate">{fc.location || 'Unknown location'}</p>
                      </div>
                      {_isNonPartner ? (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 border border-red-200"><AlertTriangle size={10} /> Non-Partner</span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 size={10} /> Partner</span>
                      )}
                    </div>
                    <div className="p-4 flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div><p className="font-bold text-slate-900 text-sm">{fc.date}</p><p className="text-xs text-slate-500">{fc.time}</p></div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${supplierColors[fc.supplier || ''] ? supplierColors[fc.supplier || ''] + ' text-white' : 'bg-slate-100 text-slate-700'}`}>{fc.supplier || '—'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Driver</p>
                          <div className="flex items-center gap-1.5">
                            {_driver?.imgUrl ? <img src={_driver.imgUrl} alt="" className="w-5 h-5 rounded-full object-cover" /> : <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center"><User size={10} className="text-slate-500" /></div>}
                            <span className="font-bold text-slate-700 text-xs truncate">{_driver?.name || '—'}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Vehicle</p>
                          <div className="text-xs font-bold text-slate-700 truncate">{_vehicle?.makeModel || '—'}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{_vehicle?.plateNumber}</div>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-600">{fc.liters.toFixed(1)} L</span>
                          <span className="text-xs font-mono text-slate-500">@ Le {fc.costPerLiter.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          {fc.fuelType ? (<span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${fc.fuelType === 'Diesel' ? 'bg-amber-50 text-amber-700 border border-amber-200' : fc.fuelType === 'Premium' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{fc.fuelType}</span>) : <span className="text-[10px] text-slate-400">N/A</span>}
                          <span className="font-black text-slate-900 text-base">Le {(fc.liters * fc.costPerLiter).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${paymentBadge(fc.paymentMethod)}`}>{fc.paymentMethod || '—'}</span>
                      <span className="font-mono text-[10px] text-slate-500 truncate ml-2">#{parseReceipt(fc.receiptNumber).text || '—'}</span>
                    </div>
                    <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex justify-end" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setFuelMenuPos({ x: r.right, y: r.bottom + 4 }); setFuelMenuEntry(fc); setOpenFuelMenuId(fc.id || null); }}
                        className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="More options"
                      ><MoreVertical size={15} /></button>
                    </div>
                  </div>
                );
              })}
              {pagedTx.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed"><Fuel size={32} className="mx-auto mb-3 text-slate-300" /><p className="text-sm">No transactions match your filters.</p></div>
              )}
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date / Time</th>
                  <th className="px-5 py-3 font-semibold">Driver</th>
                  <th className="px-5 py-3 font-semibold">Vehicle</th>
                  <th className="px-5 py-3 font-semibold">Project</th>
                  <th className="px-5 py-3 font-semibold">Station</th>
                  <th className="px-5 py-3 font-semibold">City</th>
                  <th className="px-5 py-3 font-semibold">Fuel Type</th>
                  <th className="px-5 py-3 font-semibold">Litres</th>
                  <th className="px-5 py-3 font-semibold">Cost/L</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Receipt</th>
                  <th className="px-5 py-3 font-semibold">Partner</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedTx.length === 0 && (
                  <tr><td colSpan={12} className="px-5 py-10 text-center text-slate-500">No transactions match your filters.</td></tr>
                )}
                {pagedTx.map(fc => {
                  const driver = drivers.find(d => d.id === fc.driverId);
                  const vehicle = vehicles.find(v => v.id === fc.vehicleId);
                  const isNonPartner = fc.isPartnerStation === false;
                  return (
                    <tr key={fc.id} onClick={() => setViewingFuelCollection(fc)} className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isNonPartner ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-950">{fc.date}</div>
                        {fc.time && <div className="text-xs text-slate-500">{fc.time}</div>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {driver?.imgUrl && <img src={driver.imgUrl} alt="" className="w-6 h-6 rounded-full" />}
                          <span className="font-bold text-slate-800">{driver?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        <div className="text-xs">{vehicle?.makeModel || '—'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{vehicle?.plateNumber}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${supplierColors[fc.supplier || ''] ? supplierColors[fc.supplier || ''] + ' text-white' : 'bg-slate-100 text-slate-700'}`}>
                          {fc.supplier || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700 max-w-[180px]">
                        <div className="font-medium truncate">{fc.stationName}</div>
                        {fc.district && <div className="text-[10px] text-slate-500">{fc.district}</div>}
                      </td>
                      <td className="px-5 py-3 text-slate-700">{fc.location || '—'}</td>
                      <td className="px-5 py-3">
                        {fc.fuelType ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${ fc.fuelType === 'Diesel' ? 'bg-amber-50 text-amber-700 border border-amber-200' : fc.fuelType === 'Premium' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-green-50 text-green-700 border border-green-200' }`}>{fc.fuelType}</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3 font-bold text-blue-700">{fc.liters.toFixed(1)} L</td>
                      <td className="px-5 py-3 text-slate-600 font-mono">Le {fc.costPerLiter.toFixed(2)}</td>
                      <td className="px-5 py-3 font-bold text-slate-800">Le {(fc.liters * fc.costPerLiter).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${paymentBadge(fc.paymentMethod)}`}>
                          {fc.paymentMethod || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">{parseReceipt(fc.receiptNumber).text || '—'}</td>
                      <td className="px-5 py-3">
                        {isNonPartner ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 border border-red-200" title={fc.nonPartnerReason}>
                            <AlertTriangle size={10} /> Non-Partner
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={10} /> Partner
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setFuelMenuPos({ x: r.right, y: r.bottom + 4 }); setFuelMenuEntry(fc); setOpenFuelMenuId(fc.id || null); }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="More options"
                        ><MoreVertical size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Page {fuelPage + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={fuelPage === 0} onClick={() => setFuelPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-bold">← Prev</button>
                <button disabled={fuelPage >= totalPages - 1} onClick={() => setFuelPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-bold">Next →</button>
              </div>
            </div>
          )}
        </div>
        </>) /* end !viewingFuelCollection */}
        </div>
        )}

        {fuelSubTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cities Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" />
                    <h3 className="font-bold text-slate-800">Cities / Locations</h3>
                  </div>
                  <button onClick={() => { setEditingCity({}); setIsCityModalOpen(true); }} className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus size={14} /> Add City
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {fuelCities.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">No cities defined yet.</div>
                  ) : (
                    fuelCities.map(city => (
                      <div key={city.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{city.name}</p>
                          {city.region && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{city.region}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingCity(city); setIsCityModalOpen(true); }} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <PenTool size={14} />
                          </button>
                          <button onClick={() => handleDeleteCity(city.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Stations Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Fuel size={18} className="text-emerald-600" />
                    <h3 className="font-bold text-slate-800">Fuel Stations</h3>
                  </div>
                  <button onClick={() => { setEditingStation({ is_partner: true }); setIsStationModalOpen(true); }} className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus size={14} /> Add Station
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {fuelStations.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">No stations defined yet.</div>
                  ) : (
                    fuelStations.map(station => {
                      const cityName = fuelCities.find(c => c.id === station.city_id)?.name;
                      return (
                        <div key={station.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-800">{station.name}</p>
                              {station.is_partner && <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider">Partner</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-600">
                              {cityName && <span className="flex items-center gap-0.5"><MapPin size={10} /> {cityName}</span>}
                              {station.supplier && <span>• Supplier: {station.supplier}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingStation(station); setIsStationModalOpen(true); }} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <PenTool size={14} />
                            </button>
                            <button onClick={() => handleDeleteStation(station.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  const renderDispatch = () => {
    if (selectedDispatchDetailsId) {
      const activeD = activeDispatches.find(d => d.id === selectedDispatchDetailsId);
      const completedD = completedDispatches.find(d => d.id === selectedDispatchDetailsId);
      const dispatch = activeD || completedD;
      
      if (dispatch) {
        const driver = drivers.find(d => d.id === dispatch.driverId);
        const vehicle = vehicles.find(v => v.id === dispatch.vehicleId);
        // Find triplog if it's completed
        const tripLog = completedD?.tripLogId ? logs.find(l => l.id === completedD.tripLogId) : undefined;

        return (
          <DispatchDetailsView 
            dispatch={dispatch}
            tripLog={tripLog}
            driver={driver}
            vehicle={vehicle}
            clients={clients}
            onBack={() => setSelectedDispatchDetailsId(null)}
            onEdit={() => {
              if (activeD) {
                setEditingDispatch(activeD);
                setDispatchBillingMode(activeD.corporateAccountId ? 'corporate' : 'project');
                setIsDispatchModalOpen(true);
              } else if (completedD) {
                setEditingDispatch(completedD);
                setDispatchBillingMode(completedD.corporateAccountId ? 'corporate' : 'project');
                setIsDispatchModalOpen(true);
              }
            }}
            onDelete={() => {
              if (activeD) {
                if(window.confirm('Are you sure you want to delete this dispatch?')) {
                  setActiveDispatches(prev => prev.filter(d => d.id !== dispatch.id));
                  supabase.from('active_dispatches').delete().eq('id', dispatch.id).then();
                  setVehicles(prev => prev.map(v => v.id === dispatch.vehicleId ? { ...v, status: 'Available' } : v));
                  setSelectedDispatchDetailsId(null);
                }
              } else if (completedD) {
                if(window.confirm('Are you sure you want to delete this completed dispatch?')) {
                  setCompletedDispatches(prev => prev.filter(d => d.id !== dispatch.id));
                  supabase.from('completed_dispatches').delete().eq('id', dispatch.id).then();
                  setSelectedDispatchDetailsId(null);
                }
              }
            }}
            onReturn={activeD ? () => {
              setEditingLog({ 
                driverId: dispatch.driverId, 
                vehicleId: dispatch.vehicleId, 
                date: new Date().toISOString().split('T')[0],
                corporateAccountId: dispatch.corporateAccountId,
                dispatchId: dispatch.id,
              });
              setEditingFuelCollections([]);
              setEditingTripLegs([]);
              setEditingPassengers([]);
              setOdometerWarnings({});
              setReturningDispatchId(dispatch.id);
              setReturningDispatch(activeD);
              setIsLogModalOpen(true);
            } : undefined}
            onEditTripLog={tripLog ? () => {
              setEditingLog(tripLog);
              setEditingFuelCollections(tripLog.fuelCollections || []);
              setEditingTripLegs(tripLog.legs || []);
              setEditingPassengers(tripLog.passengers || []);
              setOdometerWarnings({});
              setIsLogModalOpen(true);
            } : undefined}
            onApprove={tripLog ? (logId) => { setApprovalModalLogId(logId); setApprovalApproverName(tripLog.approvedBy || ''); setApprovalNoteInput(tripLog.approvalNotes || ''); setApprovalSignatureData(tripLog.approvalSignature || null); setApprovalSignatureMode(tripLog.approvalSignature ? 'upload' : 'draw'); } : undefined}
            onFlag={tripLog ? (logId, note) => handleFlagLog(logId, note) : undefined}
          />
        );
      }
    }

    const filterAndSortDispatches = (dispatches: any[], type: 'active' | 'completed') => {
      let result = [...dispatches];

      if (dispatchSearchQuery) {
        const query = dispatchSearchQuery.toLowerCase();
        result = result.filter(d => {
          const driver = drivers.find(drv => drv.id === d.driverId);
          const vehicle = vehicles.find(v => v.id === d.vehicleId);
          const driverName = driver?.name.toLowerCase() || '';
          const vehicleName = `${vehicle?.makeModel} ${vehicle?.plateNumber}`.toLowerCase();
          return driverName.includes(query) || vehicleName.includes(query);
        });
      }

      if (dispatchFilterDriver !== 'All') {
        result = result.filter(d => d.driverId === dispatchFilterDriver);
      }
      
      if (dispatchFilterVehicle !== 'All') {
        result = result.filter(d => d.vehicleId === dispatchFilterVehicle);
      }

      if (dispatchDateFrom) {
        result = result.filter(d => {
          const dDate = type === 'active' ? (d.dispatchTime?.split('T')[0] || '') : (d.completedAt?.split('T')[0] || '');
          return dDate >= dispatchDateFrom;
        });
      }

      if (dispatchDateTo) {
        result = result.filter(d => {
          const dDate = type === 'active' ? (d.dispatchTime?.split('T')[0] || '') : (d.completedAt?.split('T')[0] || '');
          return dDate <= dispatchDateTo;
        });
      }

      if (dispatchFilter === 'overdue' && type === 'active') {
        result = result.filter(d => new Date(d.expectedReturnDate) < new Date(new Date().toDateString()));
      }

      result.sort((a, b) => {
        let valA: any = a[dispatchSortConfig.key];
        let valB: any = b[dispatchSortConfig.key];
        
        if (dispatchSortConfig.key === 'dispatchTime') {
           valA = type === 'active' ? (a.dispatchTime || '') : (a.completedAt || '');
           valB = type === 'active' ? (b.dispatchTime || '') : (b.completedAt || '');
        } else if (dispatchSortConfig.key === 'driverId') {
           valA = drivers.find(d => d.id === a.driverId)?.name || '';
           valB = drivers.find(d => d.id === b.driverId)?.name || '';
        } else if (dispatchSortConfig.key === 'vehicleId') {
           valA = vehicles.find(v => v.id === a.vehicleId)?.makeModel || '';
           valB = vehicles.find(v => v.id === b.vehicleId)?.makeModel || '';
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return dispatchSortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return dispatchSortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });

      return result;
    };

    const filteredActive = filterAndSortDispatches(activeDispatches, 'active');
    const filteredCompleted = filterAndSortDispatches(completedDispatches, 'completed');

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Dispatch Top Header & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">Dispatch Management</h2>
            <p className="text-slate-600 text-sm mt-1">Manage active dispatches and view completed archives</p>
          </div>
          <button 
            onClick={() => { setEditingDispatch(null); setDispatchBillingMode('project'); setIsDispatchModalOpen(true); }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Navigation size={16} /> Dispatch Vehicle
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-6">
          <button
            onClick={() => setDispatchSubTab('active')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              dispatchSubTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-700'
            }`}
          >
            <Navigation size={16} /> Active Dispatches
          </button>
          <button
            onClick={() => setDispatchSubTab('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              dispatchSubTab === 'completed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-700'
            }`}
          >
            <CheckCircle2 size={16} /> Completed Dispatches
          </button>
          <button
            onClick={() => setDispatchSubTab('logs')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              dispatchSubTab === 'logs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-700'
            }`}
          >
            <FileText size={16} /> Trip Logs
          </button>
        </div>

        {/* Search, Filter, Sort UI */}
        {dispatchSubTab !== 'logs' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search date, driver, or vehicle..." 
                value={dispatchSearchQuery}
                onChange={(e) => setDispatchSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const isAct = dispatchSubTab === 'active';
                  const dataToExport = isAct ? filteredActive : filteredCompleted;
                  const headers = ['Ref ID', 'Status', 'Driver', 'Vehicle', 'Client (Project)', 'Corporate Account', 'Dispatch Date', 'Expected Return', 'Odometer Out', 'Fuel Out', 'Condition Out', 'Completed At'];
                  const rows = dataToExport.map(d => {
                    const driver = drivers.find(dr => dr.id === d.driverId);
                    const vehicle = vehicles.find(v => v.id === d.vehicleId);
                    const project = clients?.find(c => c.id === d.projectId)?.name || '-';
                    const client = mockAccounts?.find(ca => ca.id === d.corporateAccountId)?.name || '-';
                    const isComp = 'completedAt' in d;
                    return [
                      d.id.slice(0, 8).toUpperCase(),
                      isComp ? 'Completed' : 'Active',
                      driver?.name || d.driverId,
                      vehicle ? `${vehicle.makeModel} (${vehicle.plateNumber})` : d.vehicleId,
                      project,
                      client,
                      d.dispatchTime ? new Date(d.dispatchTime).toLocaleString() : '-',
                      d.expectedReturnDate ? new Date(d.expectedReturnDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-',
                      d.odometerOut.toString(),
                      d.fuelLevelOut || '-',
                      `"${(d.conditionOut || '').replace(/"/g, '""')}"`,
                      isComp ? new Date((d as CompletedDispatch).completedAt).toLocaleString() : '-'
                    ];
                  });
                  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url;
                  a.download = `${isAct ? 'active' : 'completed'}-dispatches-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click(); URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </button>
              <button
                onClick={() => {
                  const isAct = dispatchSubTab === 'active';
                  const dataToExport = isAct ? filteredActive : filteredCompleted;
                  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
                  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  doc.setFontSize(16); doc.setTextColor(30, 30, 90);
                  doc.text(`BIG - ${isAct ? 'Active' : 'Completed'} Dispatches`, 14, 16);
                  doc.setFontSize(9); doc.setTextColor(100, 100, 120);
                  doc.text(`Generated on: ${today}`, 14, 22);

                  const headers = ['Ref', 'Status', 'Driver', 'Vehicle', 'Client(Project)', 'Corp Account', 'Dispatch Date', 'Return Date', 'Odo Out', 'Fuel Out', 'Completed At'];
                  const rows = dataToExport.map(d => {
                    const driver = drivers.find(dr => dr.id === d.driverId);
                    const vehicle = vehicles.find(v => v.id === d.vehicleId);
                    const project = clients?.find(c => c.id === d.projectId)?.name || '-';
                    const client = mockAccounts?.find(ca => ca.id === d.corporateAccountId)?.name || '-';
                    const isComp = 'completedAt' in d;
                    return [
                      d.id.slice(0, 8).toUpperCase(),
                      isComp ? 'Completed' : 'Active',
                      driver?.name || d.driverId,
                      vehicle ? `${vehicle.makeModel} (${vehicle.plateNumber})` : d.vehicleId,
                      project,
                      client,
                      d.dispatchTime ? new Date(d.dispatchTime).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-',
                      d.expectedReturnDate ? new Date(d.expectedReturnDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-',
                      d.odometerOut.toString(),
                      d.fuelLevelOut || '-',
                      isComp ? new Date((d as CompletedDispatch).completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'
                    ];
                  });

                  autoTable(doc, {
                    head: [headers],
                    body: rows,
                    startY: 28,
                    styles: { fontSize: 7, cellPadding: 2 },
                    headStyles: { fillColor: isAct ? [79, 70, 229] : [16, 185, 129], textColor: 255 },
                    alternateRowStyles: { fillColor: [248, 250, 252] },
                  });

                  doc.save(`${isAct ? 'active' : 'completed'}-dispatches-${new Date().toISOString().split('T')[0]}.pdf`);
                }}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Export PDF
              </button>
              <button 
                onClick={() => setDispatchFiltersOpen(!dispatchFiltersOpen)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors flex items-center gap-2 ${dispatchFiltersOpen ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <Filter size={16} /> Filters { (dispatchFilterDriver !== 'All' || dispatchFilterVehicle !== 'All' || dispatchDateFrom || dispatchDateTo || dispatchFilter !== 'all') && <div className="w-2 h-2 rounded-full bg-blue-500"></div> }
              </button>
            </div>
          </div>
          
          {dispatchFiltersOpen && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in">
              {dispatchSubTab === 'active' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Status</label>
                <select 
                  value={dispatchFilter}
                  onChange={(e) => setDispatchFilter(e.target.value as any)}
                  className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white cursor-pointer"
                >
                  <option value="all">All Dispatches</option>
                  <option value="overdue">Overdue Only</option>
                </select>
              </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Driver</label>
                <select 
                  value={dispatchFilterDriver}
                  onChange={(e) => setDispatchFilterDriver(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white cursor-pointer"
                >
                  <option value="All">All Drivers</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Vehicle</label>
                <select 
                  value={dispatchFilterVehicle}
                  onChange={(e) => setDispatchFilterVehicle(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white cursor-pointer"
                >
                  <option value="All">All Vehicles</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.makeModel} ({v.plateNumber})</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">From Date</label>
                <input type="date" value={dispatchDateFrom} onChange={e => setDispatchDateFrom(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">To Date</label>
                <input type="date" value={dispatchDateTo} onChange={e => setDispatchDateTo(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" />
              </div>
            </div>
          )}
        </div>
        )}

        {dispatchSubTab === 'logs' ? (
          renderLogs(true)
        ) : dispatchSubTab === 'active' ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {filteredActive.length === 0 ? (
              <div className="p-12 text-center text-slate-600">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-blue-500 opacity-50" />
                <p className="font-bold">No Active Dispatches Found</p>
                <p className="text-sm mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="w-full">
                <table className="w-full text-left text-sm block md:table">
                <thead className="hidden md:table-header-group bg-slate-50 text-slate-600 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleDispatchSort('dispatchTime')}>
                      <div className="flex items-center gap-1">Dispatch Time <ArrowUpDown size={12} className={dispatchSortConfig.key === 'dispatchTime' ? 'text-blue-500' : 'text-slate-400'} /></div>
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleDispatchSort('driverId')}>
                      <div className="flex items-center gap-1">Driver <ArrowUpDown size={12} className={dispatchSortConfig.key === 'driverId' ? 'text-blue-500' : 'text-slate-400'} /></div>
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleDispatchSort('vehicleId')}>
                      <div className="flex items-center gap-1">Vehicle <ArrowUpDown size={12} className={dispatchSortConfig.key === 'vehicleId' ? 'text-blue-500' : 'text-slate-400'} /></div>
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleDispatchSort('odometerOut')}>
                      <div className="flex items-center gap-1">Odo Out <ArrowUpDown size={12} className={dispatchSortConfig.key === 'odometerOut' ? 'text-blue-500' : 'text-slate-400'} /></div>
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleDispatchSort('expectedReturnDate')}>
                      <div className="flex items-center gap-1">Expected Return <ArrowUpDown size={12} className={dispatchSortConfig.key === 'expectedReturnDate' ? 'text-blue-500' : 'text-slate-400'} /></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 block md:table-row-group">
                  {filteredActive.map(dispatch => {
                    const driver = drivers.find(d => d.id === dispatch.driverId);
                    const vehicle = vehicles.find(v => v.id === dispatch.vehicleId);
                    return (
                      <tr key={dispatch.id} onClick={() => setSelectedDispatchDetailsId(dispatch.id)} className={`block md:table-row cursor-pointer transition-colors p-4 md:p-0 ${new Date(dispatch.expectedReturnDate) < new Date(new Date().toDateString()) ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-slate-50/50'}`}>
                        <td className="flex justify-between items-center md:table-cell px-0 py-2 md:px-6 md:py-4 font-medium text-slate-950 border-b border-slate-100 md:border-0">
                          <span className="md:hidden text-[10px] font-bold uppercase text-slate-500 tracking-wider">Time</span>
                          {new Date(dispatch.dispatchTime).toLocaleString()}
                        </td>
                        <td className="flex justify-between items-center md:table-cell px-0 py-2 md:px-6 md:py-4 text-slate-700 border-b border-slate-100 md:border-0">
                          <span className="md:hidden text-[10px] font-bold uppercase text-slate-500 tracking-wider">Driver</span>
                          <div className="flex items-center justify-end gap-2 text-right">
                            {driver?.imgUrl && <img src={driver.imgUrl} alt="" className="w-6 h-6 rounded-full" />}
                            <span className="font-bold">{driver?.name}</span>
                          </div>
                        </td>
                        <td className="flex justify-between items-center md:table-cell px-0 py-2 md:px-6 md:py-4 text-slate-700 border-b border-slate-100 md:border-0">
                          <span className="md:hidden text-[10px] font-bold uppercase text-slate-500 tracking-wider">Vehicle</span>
                          <div className="text-right md:text-left">
                            <div className="font-bold">{vehicle?.makeModel}</div>
                            <div className="text-xs text-slate-600">{vehicle?.plateNumber}</div>
                          </div>
                        </td>
                        <td className="flex justify-between items-center md:table-cell px-0 py-2 md:px-6 md:py-4 text-slate-700 font-mono border-b border-slate-100 md:border-0">
                          <span className="md:hidden text-[10px] font-bold uppercase text-slate-500 tracking-wider">Odo Out</span>
                          {dispatch.odometerOut.toLocaleString()} km
                        </td>
                        <td className="flex justify-between items-center md:table-cell px-0 py-2 md:px-6 md:py-4 border-b border-slate-100 md:border-0">
                          <span className="md:hidden text-[10px] font-bold uppercase text-slate-500 tracking-wider">Return</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${new Date(dispatch.expectedReturnDate) < new Date(new Date().toDateString()) ? 'text-red-600' : 'text-amber-600'}`}>
                              {dispatch.expectedReturnDate}
                            </span>
                            {new Date(dispatch.expectedReturnDate) < new Date(new Date().toDateString()) && (
                              <span className="flex items-center gap-0.5 text-[9px] font-black text-red-700 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded-md animate-pulse">
                                <AlertTriangle size={9} /> OVERDUE
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
            {filteredCompleted.length === 0 ? (
              <div className="p-12 text-center text-slate-600">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-slate-400 opacity-50" />
                <p className="font-bold">No Completed Dispatches Found</p>
                <p className="text-sm mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-emerald-50/50">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <h3 className="font-bold text-slate-700 text-sm">Completed Dispatches — Session Archive</h3>
                  <span className="ml-auto text-xs text-slate-500">{filteredCompleted.length} returned this session</span>
                </div>
                <div className="w-full">
                  <table className="w-full text-left text-sm block md:table">
                    <thead className="hidden md:table-header-group bg-slate-50 text-slate-600 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3 font-semibold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleDispatchSort('dispatchTime')}>
                          <div className="flex items-center gap-1">Returned At <ArrowUpDown size={12} className={dispatchSortConfig.key === 'dispatchTime' ? 'text-blue-500' : 'text-slate-400'} /></div>
                        </th>
                        <th className="px-6 py-3 font-semibold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleDispatchSort('driverId')}>
                          <div className="flex items-center gap-1">Driver <ArrowUpDown size={12} className={dispatchSortConfig.key === 'driverId' ? 'text-blue-500' : 'text-slate-400'} /></div>
                        </th>
                        <th className="px-6 py-3 font-semibold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleDispatchSort('vehicleId')}>
                          <div className="flex items-center gap-1">Vehicle <ArrowUpDown size={12} className={dispatchSortConfig.key === 'vehicleId' ? 'text-blue-500' : 'text-slate-400'} /></div>
                        </th>
                        <th className="px-6 py-3 font-semibold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleDispatchSort('odometerOut')}>
                          <div className="flex items-center gap-1">Odo Out <ArrowUpDown size={12} className={dispatchSortConfig.key === 'odometerOut' ? 'text-blue-500' : 'text-slate-400'} /></div>
                        </th>
                        <th className="px-6 py-3 font-semibold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleDispatchSort('fuelLevelOut')}>
                          <div className="flex items-center gap-1">Fuel Level Out <ArrowUpDown size={12} className={dispatchSortConfig.key === 'fuelLevelOut' ? 'text-blue-500' : 'text-slate-400'} /></div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 block md:table-row-group">
                      {filteredCompleted.map(cd => {
                        const cdDriver = drivers.find(d => d.id === cd.driverId);
                        const cdVehicle = vehicles.find(v => v.id === cd.vehicleId);
                        return (
                          <tr key={cd.id} onClick={() => setSelectedDispatchDetailsId(cd.id)} className="block md:table-row cursor-pointer hover:bg-emerald-50/30 p-4 md:p-0">
                            <td className="flex justify-between items-center md:table-cell px-0 py-2 md:px-6 md:py-3 text-slate-600 text-xs border-b border-slate-100 md:border-0">
                              <span className="md:hidden text-[10px] font-bold uppercase text-slate-500 tracking-wider">Returned At</span>
                              {new Date(cd.completedAt).toLocaleString()}
                            </td>
                            <td className="flex justify-between items-center md:table-cell px-0 py-2 md:px-6 md:py-3 font-medium text-slate-700 border-b border-slate-100 md:border-0">
                              <span className="md:hidden text-[10px] font-bold uppercase text-slate-500 tracking-wider">Driver</span>
                              {cdDriver?.name || cd.driverId}
                            </td>
                            <td className="flex justify-between items-center md:table-cell px-0 py-2 md:px-6 md:py-3 text-slate-700 border-b border-slate-100 md:border-0">
                              <span className="md:hidden text-[10px] font-bold uppercase text-slate-500 tracking-wider">Vehicle</span>
                              <div className="text-right md:text-left">
                                <div className="font-bold">{cdVehicle?.makeModel}</div>
                                <div className="text-xs text-slate-500">{cdVehicle?.plateNumber}</div>
                              </div>
                            </td>
                            <td className="flex justify-between items-center md:table-cell px-0 py-2 md:px-6 md:py-3 font-mono text-slate-700 border-b border-slate-100 md:border-0">
                              <span className="md:hidden text-[10px] font-bold uppercase text-slate-500 tracking-wider">Odo Out</span>
                              {cd.odometerOut.toLocaleString()} km
                            </td>
                            <td className="flex justify-between items-center md:table-cell px-0 py-2 md:px-6 md:py-3 text-slate-700 border-b border-slate-100 md:border-0">
                              <span className="md:hidden text-[10px] font-bold uppercase text-slate-500 tracking-wider">Fuel Out</span>
                              {cd.fuelLevelOut}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMaintenance = () => {
    const totalFilteredCost = filteredMaintenanceRecords.reduce((acc, r) => acc + r.cost, 0);

    const maintItemsPerPage = 10;
    const totalMaintPages = Math.max(1, Math.ceil(filteredMaintenanceRecords.length / maintItemsPerPage));
    const clampedMaintPage = Math.min(maintCurrentPage, totalMaintPages);
    const paginatedMaintenanceRecords = filteredMaintenanceRecords.slice((clampedMaintPage - 1) * maintItemsPerPage, clampedMaintPage * maintItemsPerPage);

    const exportMaintenancePDF = () => {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      doc.setFontSize(16); doc.setTextColor(30, 30, 90);
      doc.text('BIG - Fleet Maintenance Logs', 14, 16);
      doc.setFontSize(10); doc.setTextColor(100);
      doc.text(`Generated: ${today}   |   ${filteredMaintenanceRecords.length} records   |   Total Cost: Le ${totalFilteredCost.toLocaleString()}`, 14, 23);
      
      const headers = ['Start Date', 'Return Date', 'Vehicle', 'Driver', 'Issues / Repairs', 'Mechanic/Shop', 'Cost', 'Status'];
      const rows = filteredMaintenanceRecords.map(r => {
        const vehicle = vehicles.find(v => v.id === r.vehicleId);
        const driver = drivers.find(d => d.id === r.driverId);
        return [
          r.startDate,
          r.completionDate || '-',
          vehicle ? `${vehicle.makeModel} (${vehicle.plateNumber})` : '',
          driver ? driver.name : '-',
          r.issuesFound || '-',
          r.mechanicOrShop || '-',
          `Le ${r.cost.toLocaleString()}`,
          r.status
        ];
      });

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });
      doc.save(`maintenance-logs-${new Date().toISOString().split('T')[0]}.pdf`);
    };



    return (
    <div className="space-y-6 animate-fade-in">
      {upcomingMaintenance.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="font-bold text-amber-800 text-sm">Upcoming Scheduled Maintenance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingMaintenance.map((item, i) => (
              <div key={i} className="bg-white p-3 rounded-xl border border-amber-100 flex justify-between items-center shadow-sm cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => { setEditingMaintenance(item.record); setIsMaintenanceModalOpen(true); }}>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{item.vehicle.plateNumber}</p>
                  <p className="font-bold text-slate-800 text-sm">{item.vehicle.makeModel}</p>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${item.days < 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {item.days < 0 ? `Past due ${Math.abs(item.days)}d` : item.days === 0 ? 'Today' : `In ${item.days}d`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Fleet Maintenance Logs</h2>
          <p className="text-slate-600 text-sm mt-1">Track vehicle repairs, costs, and availability</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setEditingMaintenance({ startDate: new Date().toISOString().split('T')[0], status: 'In Progress' });
              setIsMaintenanceModalOpen(true);
            }}
            className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <PenTool size={16} /> Record Maintenance
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search by vehicle or issue..."
              value={maintSearchQuery}
              onChange={e => setMaintSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select value={maintStatusFilter} onChange={e => setMaintStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="all">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Scheduled">Scheduled</option>
            </select>
            <select value={maintSortBy} onChange={e => setMaintSortBy(e.target.value as any)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="cost_desc">Highest Cost</option>
              <option value="cost_asc">Lowest Cost</option>
            </select>
            <input type="date" value={maintDateFrom} onChange={e => setMaintDateFrom(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400" title="From date" />
            <input type="date" value={maintDateTo} onChange={e => setMaintDateTo(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400" title="To date" />
            
            {(maintSearchQuery || maintStatusFilter !== 'all' || maintSortBy !== 'date_desc' || maintDateFrom || maintDateTo) && (
              <button onClick={() => { setMaintSearchQuery(''); setMaintStatusFilter('all'); setMaintSortBy('date_desc'); setMaintDateFrom(''); setMaintDateTo(''); }} className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-100">
                Clear
              </button>
            )}
          </div>
          <button
            onClick={exportMaintenancePDF}
            disabled={filteredMaintenanceRecords.length === 0}
            title="Download as PDF"
            className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-auto"
          >
            <FileText size={14} /> Export PDF
          </button>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-600 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-200/50 p-0.5 rounded-lg border border-slate-200">
              <button onClick={() => setMaintViewMode('grid')} className={`p-1 rounded flex items-center justify-center transition-colors ${maintViewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} title="Grid View"><LayoutGrid size={13} /></button>
              <button onClick={() => setMaintViewMode('list')} className={`p-1 rounded flex items-center justify-center transition-colors ${maintViewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} title="List View"><List size={13} /></button>
            </div>
            <span>Showing <span className="font-bold text-slate-700">{filteredMaintenanceRecords.length}</span> records</span>
          </div>
          <span>Total Filtered Cost: <span className="font-bold text-blue-600">Le {totalFilteredCost.toLocaleString()}</span></span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        {maintViewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {paginatedMaintenanceRecords.map((record) => {
              const _mv = vehicles.find(v => v.id === record.vehicleId);
              const _md = drivers.find(d => d.id === record.driverId);
              const statusColor = record.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : record.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200';
              const headerBg = record.status === 'Completed' ? 'bg-emerald-50/60 border-emerald-100' : record.status === 'Scheduled' ? 'bg-blue-50/60 border-blue-100' : 'bg-amber-50/60 border-amber-100';
              return (
                <div key={record.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
                  <div className={`p-4 border-b flex justify-between items-start gap-2 ${headerBg}`}>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 truncate text-sm">{_mv?.makeModel || '—'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{_mv?.plateNumber}</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColor}`}>{record.status}</span>
                  </div>
                  <div className="p-4 flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Start</p><p className="font-semibold text-slate-700">{record.startDate}</p></div>
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Return</p><p className="font-semibold text-slate-700">{record.completionDate || '—'}</p></div>
                    </div>
                    {_md && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Driver</p>
                        <div className="flex items-center gap-2">
                          {_md.imgUrl ? <img src={_md.imgUrl} alt="" className="w-5 h-5 rounded-full object-cover" /> : <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center"><User size={10} className="text-slate-500" /></div>}
                          <span className="text-xs font-bold text-slate-700 truncate">{_md.name}</span>
                        </div>
                      </div>
                    )}
                    {record.issuesFound && (<div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Issues</p><p className="text-xs text-slate-600 line-clamp-2">{record.issuesFound}</p></div>)}
                  </div>
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-black text-slate-900 text-sm">Le {record.cost.toLocaleString()}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setViewingMaintenance(record)} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors" title="View"><Eye size={13} /></button>
                      <button onClick={() => { setEditingMaintenance(record); setIsMaintenanceModalOpen(true); }} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><PenTool size={13} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
            {paginatedMaintenanceRecords.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed"><PenTool size={32} className="mx-auto mb-3 text-slate-300" /><p className="text-sm">No maintenance records match your filters.</p></div>
            )}
          </div>
        ) : (
        <div>
          <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Start Date</th>
              <th className="px-6 py-4 font-semibold">Return Date</th>
              <th className="px-6 py-4 font-semibold">Vehicle</th>
              <th className="px-6 py-4 font-semibold">Driver</th>
              <th className="px-6 py-4 font-semibold">Cost</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedMaintenanceRecords.map((record, index) => {
              const vehicle = vehicles.find(v => v.id === record.vehicleId);
              const driver = drivers.find(d => d.id === record.driverId);
              return (
                <tr key={record.id} className={`${
                  record.status === 'Completed' ? 'bg-emerald-50/40 hover:bg-emerald-100/50' :
                  record.status === 'Scheduled' ? 'bg-blue-50/40 hover:bg-blue-100/50' :
                  'bg-amber-50/40 hover:bg-amber-100/50'
                }`}>
                  <td className="px-6 py-4 font-medium text-slate-950">{record.startDate}</td>
                  <td className="px-6 py-4 text-slate-700">{record.completionDate || '-'}</td>
                  <td className="px-6 py-4 text-slate-700">
                    <div className="font-bold">{vehicle?.makeModel}</div>
                    <div className="text-xs text-slate-600">{vehicle?.plateNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <div className="font-bold">{driver?.name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-950">Le {record.cost.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      id={`maint-btn-${record.id}`}
                      onClick={() => setActiveMaintenanceMenu(activeMaintenanceMenu === record.id ? null : record.id)}
                      className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMaintenanceMenu === record.id && (() => {
                      const btn = document.getElementById(`maint-btn-${record.id}`);
                      const rect = btn?.getBoundingClientRect();
                      const spaceBelow = rect ? window.innerHeight - rect.bottom : 999;
                      const menuH = 195;
                      const topPos = rect ? (spaceBelow < menuH ? rect.top - menuH : rect.bottom + 4) : 0;
                      const rightPos = rect ? window.innerWidth - rect.right : 0;
                      return (
                        <>
                          <div className="fixed inset-0 z-[9998]" onClick={() => setActiveMaintenanceMenu(null)} />
                          <div style={{ position: 'fixed', top: topPos, right: rightPos, zIndex: 9999 }} className="w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 overflow-hidden">
                            <button onClick={() => { setActiveMaintenanceMenu(null); setViewingMaintenance(record); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left">
                              <FileText size={14} className="text-slate-600" /> View Record
                            </button>
                            <button onClick={() => { setActiveMaintenanceMenu(null); setEditingMaintenance(record); setIsMaintenanceModalOpen(true); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left">
                              <PenTool size={14} className="text-blue-500" /> Edit Record
                            </button>
                            {record.status === 'In Progress' && (
                              <button onClick={() => { setActiveMaintenanceMenu(null); setMaintenanceRecords(prev => prev.map(m => m.id === record.id ? { ...m, status: 'Completed', completionDate: new Date().toISOString().split('T')[0] } : m)); setVehicles(prev => prev.map(v => v.id === record.vehicleId ? { ...v, status: 'Available' } : v)); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left">
                                <CheckCircle2 size={14} className="text-emerald-500" /> Mark Completed
                              </button>
                            )}
                            <button onClick={async () => { if (window.confirm('Are you sure you want to delete this maintenance record?')) { setActiveMaintenanceMenu(null); setMaintenanceRecords(prev => prev.filter(m => m.id !== record.id)); await supabase.from('maintenance_records').delete().eq('id', record.id); } }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left border-t border-slate-100">
                              <Trash2 size={14} /> Delete Record
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        )}
        {totalMaintPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Page {clampedMaintPage} of {totalMaintPages}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setMaintCurrentPage(p => Math.max(1, p - 1))}
                disabled={clampedMaintPage === 1}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setMaintCurrentPage(p => Math.min(totalMaintPages, p + 1))}
                disabled={clampedMaintPage === totalMaintPages}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  };

  return (
    <div className="animate-fade-in">

      {/* Responsive Tab Bar */}
      <div className="overflow-x-auto pb-1 mb-6">
        <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl min-w-max">
        {[
          { id: 'dashboard', label: 'Overview', icon: TrendingUp },
          { id: 'dispatch', label: 'Dispatch', icon: Navigation },
          { id: 'maintenance', label: 'Maintenance', icon: PenTool },
          { id: 'fuel', label: 'Fuel', icon: Fuel },
          { id: 'drivers', label: 'Drivers', icon: User },
          { id: 'vehicles', label: 'Vehicles', icon: Car },
          { id: 'leaderboard', label: 'Performance & Awards', icon: Trophy },
        // Filter tabs by role: maintenance_logs only sees Maintenance
        ].filter(tab => userRole === 'maintenance_logs' ? tab.id === 'maintenance' : true).map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Icon size={14} /> <span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
        </div>
      </div>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'dispatch' && renderDispatch()}
      {activeTab === 'maintenance' && renderMaintenance()}
      {activeTab === 'fuel' && renderFuel()}
      {activeTab === 'drivers' && renderDrivers()}
      {activeTab === 'driver_details' && renderDriverDetails()}
      { activeTab === 'vehicles' && renderVehicles() }
      { activeTab === 'leaderboard' && renderLeaderboard() }


      {/* Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-blue-600 sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-black text-white">{editingLog ? 'Edit Trip Log' : 'Record Trip Log'}</h2>
                <p className="text-blue-200 text-xs mt-0.5">Enter trip details, distance, and performance metrics.</p>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="text-blue-200 hover:text-white bg-blue-500 hover:bg-blue-400 rounded-lg p-1.5 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const tripId = editingLog?.id ? editingLog.id : uuidv4();
              const data: Partial<TripLog> = {
                date: fd.get('date') as string,
                driverId: fd.get('driverId') as string,
                vehicleId: fd.get('vehicleId') as string,
                district: fd.get('district') as string || undefined,
                distanceTraveledKm: Number(fd.get('distanceTraveledKm')),
                fuelConsumedLiters: Number(fd.get('fuelConsumedLiters')),
                incidents: Number(fd.get('incidents')),
                speedingEvents: Number(fd.get('speedingEvents')),
                harshBraking: Number(fd.get('harshBraking')),
                idlingTimeHours: Number(fd.get('idlingTimeHours')),
                routeDeviations: Number(fd.get('routeDeviations')),
                policyViolations: Number(fd.get('policyViolations')),
                maintenanceIssuesLogged: fd.get('maintenanceIssuesLogged') === 'true',
                notes: (fd.get('notes') as string) || '',
                corporateAccountId: fd.get('corporateAccountId') as string || undefined,
                projectCode: (fd.get('projectCode') as string) || undefined,
                fuelCollections: editingFuelCollections as FuelCollection[],
                legs: editingTripLegs as TripLeg[],
                passengers: editingPassengers as Passenger[],
                dispatchId: returningDispatchId || editingLog?.dispatchId,
                approvalStatus: editingLog?.approvalStatus || 'Pending',
                approvedBy: editingLog?.approvedBy,
                approvedAt: editingLog?.approvedAt,
                approvalNotes: editingLog?.approvalNotes,
              };
              if (editingLog?.id) {
                setLogs(prev => prev.map(l => l.id === editingLog.id ? { ...l, ...data } : l));
                
                // Sync project change back to the dispatch if linked
                if (data.dispatchId && data.projectCode !== undefined) {
                  // Try to update in completed_dispatches first (most likely scenario for a trip log edit)
                  setCompletedDispatches(prev => {
                    if (prev.some(d => d.originalDispatchId === data.dispatchId || d.id === data.dispatchId)) {
                      supabase.from('completed_dispatches').update({ project_id: data.projectCode })
                        .or(`original_dispatch_id.eq.${data.dispatchId},id.eq.${data.dispatchId}`).then();
                      return prev.map(d => (d.originalDispatchId === data.dispatchId || d.id === data.dispatchId) ? { ...d, projectId: data.projectCode } : d);
                    }
                    return prev;
                  });
                  // Also try active_dispatches just in case
                  setActiveDispatches(prev => {
                    if (prev.some(d => d.id === data.dispatchId)) {
                      supabase.from('active_dispatches').update({ project_id: data.projectCode })
                        .eq('id', data.dispatchId).then();
                      return prev.map(d => d.id === data.dispatchId ? { ...d, projectId: data.projectCode } : d);
                    }
                    return prev;
                  });
                }
              } else {
                setLogs(prev => [{ ...data, id: tripId } as TripLog, ...prev]);
                if (editingFuelCollections && editingFuelCollections.length > 0) {
                  const newFuels = editingFuelCollections.map(fc => ({
                    id: fc.id || uuidv4(),
                    trip_log_id: tripId,
                    station_name: fc.stationName,
                    supplier: fc.supplier,
                    is_partner_station: fc.isPartnerStation,
                    location: fc.location,
                    district: fc.district,
                    region: fc.region,
                    liters: fc.liters,
                    cost_per_liter: fc.costPerLiter,
                    total_amount: fc.totalAmount,
                    fuel_type: fc.fuelType,
                    payment_method: fc.paymentMethod,
                    receipt_number: fc.receiptNumber,
                    date: fc.date,
                    time: fc.time,
                    non_partner_reason: fc.nonPartnerReason,
                    remarks: fc.remarks,
                    driver_id: data.driverId,
                    vehicle_id: data.vehicleId
                  }));
                  supabase.from('fuel_collections').insert(newFuels).then(({ error }) => {
                    if (error) console.warn('[Fuel Collections Insert]', error.message);
                  });
                }
              }

              // #6 Update vehicle odometer from trip distance
              if (data.vehicleId && data.distanceTraveledKm) {
                setVehicles(prev => prev.map(v =>
                  v.id === data.vehicleId
                    ? { ...v, odometer: v.odometer + (data.distanceTraveledKm || 0) }
                    : v
                ));
                // Persist to Supabase silently
                const vehicle = vehicles.find(v => v.id === data.vehicleId);
                if (vehicle) {
                  supabase.from('vehicles').update({ odometer: vehicle.odometer + (data.distanceTraveledKm || 0) })
                    .eq('id', data.vehicleId)
                    .then(({ error }) => { if (error) console.warn('[Odometer] Update failed:', error.message); });
                }
              }

              // ── Gap 1: Archive the dispatch instead of just deleting ─────────
              if (returningDispatchId && returningDispatch) {
                const archived: CompletedDispatch = {
                  id: uuidv4(),
                  originalDispatchId: returningDispatch.id,
                  driverId: returningDispatch.driverId,
                  vehicleId: returningDispatch.vehicleId,
                  dispatchTime: returningDispatch.dispatchTime,
                  odometerOut: returningDispatch.odometerOut,
                  fuelLevelOut: returningDispatch.fuelLevelOut,
                  conditionOut: returningDispatch.conditionOut,
                  corporateAccountId: returningDispatch.corporateAccountId,
                  projectId: returningDispatch.projectId,
                  expectedReturnDate: returningDispatch.expectedReturnDate,
                  completedAt: new Date().toISOString(),
                  tripLogId: tripId,
                };
                // Update local state immediately
                setCompletedDispatches(prev => [archived, ...prev]);
                setActiveDispatches(prev => prev.filter(d => d.id !== returningDispatchId));
                // Persist archive in background (silently fails if table not yet created)
                supabase.from('completed_dispatches').insert({
                  id: archived.id,
                  original_dispatch_id: archived.originalDispatchId,
                  driver_id: archived.driverId,
                  vehicle_id: archived.vehicleId,
                  dispatch_time: archived.dispatchTime,
                  odometer_out: archived.odometerOut,
                  fuel_level_out: archived.fuelLevelOut,
                  condition_out: archived.conditionOut,
                  corporate_account_id: archived.corporateAccountId,
                  project_id: archived.projectId,
                  expected_return_date: archived.expectedReturnDate,
                  trip_log_id: tripId,
                }).then(({ error }) => {
                  if (error) console.warn('[Dispatch Archive] Insert failed (table may not exist yet):', error.message);
                });
                setReturningDispatchId(null);
                setReturningDispatch(null);
              }
              setIsLogModalOpen(false);
              setEditingFuelCollections([]);
              setEditingTripLegs([]);
              setEditingPassengers([]);
              setOdometerWarnings({});
            }} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Date</label>
                <input type="date" name="date" required defaultValue={editingLog?.date || new Date().toISOString().split('T')[0]} className="w-full p-2 border border-slate-200 rounded-xl" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-1.5">
                  <Briefcase size={12} /> Project
                </label>
                <select
                  name="projectCode"
                  defaultValue={editingLog?.projectCode || returningDispatch?.projectId || ''}
                  className="w-full p-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white"
                >
                  <option value="">None / Internal</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Driver</label>
                <select name="driverId" required defaultValue={editingLog?.driverId} className="w-full p-2 border border-slate-200 rounded-xl">
                  <option value="">Select Driver</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Vehicle</label>
                <select name="vehicleId" required defaultValue={editingLog?.vehicleId} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white">
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.makeModel} ({v.plateNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Destination District</label>
                <select name="district" defaultValue={editingLog?.district} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white">
                  <option value="">Select District</option>
                  {["Bo", "Bombali", "Bonthe", "Falaba", "Kailahun", "Kambia", "Karene", "Kenema", "Koinadugu", "Kono", "Moyamba", "Port Loko", "Pujehun", "Tonkolili", "Western Area Rural", "Western Area Urban"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Distance (km)</label>
                {editingTripLegs.length > 0 ? (
                  <div className="w-full p-2 border border-slate-200 rounded-xl bg-slate-100 text-slate-600 cursor-not-allowed">
                    {editingTripLegs.reduce((sum, leg) => sum + Math.max(0, (leg.odometerEnd || 0) - (leg.odometerStart || 0)), 0)} (Calculated from legs)
                    <input type="hidden" name="distanceTraveledKm" value={editingTripLegs.reduce((sum, leg) => sum + Math.max(0, (leg.odometerEnd || 0) - (leg.odometerStart || 0)), 0)} />
                  </div>
                ) : (
                  <input type="number" name="distanceTraveledKm" required defaultValue={editingLog?.distanceTraveledKm || 0} className="w-full p-2 border border-slate-200 rounded-xl" />
                )}
              </div>

              {/* ⛽ Fuel Reminder Banner */}
              <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <Fuel size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-800">Record Fuel on the Fuel Page</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Fuel fill-ups for this trip are recorded separately. Go to the{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogModalOpen(false);
                          setActiveTab('fuel');
                          setStandaloneFuelEntry({
                            id: uuidv4(),
                            stationName: '', supplier: 'NP', isPartnerStation: true, location: '',
                            liters: 0, costPerLiter: 15.5, paymentMethod: 'Fuel Card',
                            date: editingLog?.date || new Date().toISOString().split('T')[0], time: '',
                            fuelType: 'Diesel',
                          });
                          setStandaloneFuelDriverId(editingLog?.driverId || '');
                          setStandaloneFuelVehicleId(editingLog?.vehicleId || '');
                          setStandaloneFuelTripLogId(editingLog?.id || '');
                          setStandaloneFuelReceiptFile(null); setIsStandaloneFuelModalOpen(true);
                        }}
                        className="font-bold underline hover:text-blue-800 transition-colors"
                      >
                        ⛽ Fuel Page → Record Fuel Fill-Up
                      </button>
                      {' '}to log fuel stops linked to this trip.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Total Litres (Fuel Consumed)</label>
                <input type="number" step="0.1" name="fuelConsumedLiters" required value={editingLog?.fuelConsumedLiters ?? 0} onChange={e => setEditingLog(prev => prev ? { ...prev, fuelConsumedLiters: Number(e.target.value) } : prev)} className="w-full p-2 border border-slate-200 rounded-xl" />
              </div>

              <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                <h3 className="text-sm font-bold text-slate-950 mb-4">Behavior & Compliance</h3>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Incidents</label>
                <input type="number" name="incidents" defaultValue={editingLog?.incidents || 0} className="w-full p-2 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Speeding Events</label>
                <input type="number" name="speedingEvents" defaultValue={editingLog?.speedingEvents || 0} className="w-full p-2 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Harsh Braking</label>
                <input type="number" name="harshBraking" defaultValue={editingLog?.harshBraking || 0} className="w-full p-2 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Idling Time (Hrs)</label>
                <input type="number" step="0.1" name="idlingTimeHours" defaultValue={editingLog?.idlingTimeHours || 0} className="w-full p-2 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Route Deviations</label>
                <input type="number" name="routeDeviations" defaultValue={editingLog?.routeDeviations || 0} className="w-full p-2 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Policy Violations</label>
                <input type="number" name="policyViolations" defaultValue={editingLog?.policyViolations || 0} className="w-full p-2 border border-slate-200 rounded-xl" />
              </div>
              

              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" name="maintenanceIssuesLogged" value="true" defaultChecked={editingLog?.maintenanceIssuesLogged} className="w-4 h-4 rounded text-blue-600" />
                  Vehicle breakdown or maintenance issue logged on this trip
                </label>
              </div>
              
              {/* #18 Notes field */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Trip Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingLog?.notes || ''}
                  placeholder="Any observations, route details, client feedback..."
                  className="w-full p-2 border border-slate-200 rounded-xl resize-none text-sm"
                />
              </div>

              {/* ── Multi-Leg Route Tracking ── */}
              <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                <div className="flex justify-between items-center mb-3">
                  <div className="cursor-pointer flex items-center gap-2 select-none" onClick={() => setIsTripLegsExpanded(!isTripLegsExpanded)}>
                    {isTripLegsExpanded ? <ChevronDown size={18} className="text-slate-500" /> : <ChevronRight size={18} className="text-slate-500" />}
                    <div>
                      <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5"><Navigation size={14} className="text-blue-500" /> Trip Legs (Route Log)</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Record each stop with departure, destination, times, and odometer.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTripLegs(prev => [...prev, {
                        id: `leg-${Date.now()}`,
                        departurePoint: '',
                        departureTime: '',
                        destinationPoint: '',
                        arrivalTime: '',
                        odometerStart: prev.length > 0 ? (prev[prev.length - 1].odometerEnd || 0) : 0,
                        odometerEnd: 0,
                        purposeOfTrip: '',
                      }]);
                      setIsTripLegsExpanded(true);
                    }}
                    className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Leg
                  </button>
                </div>

                {isTripLegsExpanded && (
                  <>
                    {editingTripLegs.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-2 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">No legs recorded. Use a single Distance field above, or add legs for detailed route tracking.</p>
                    )}

                    <div className="space-y-3">
                  {editingTripLegs.map((leg, i) => {
                    const isMin = minimizedTripLegs[leg.id || i];
                    return (
                    <div key={leg.id || i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setMinimizedTripLegs(prev => ({ ...prev, [leg.id || i]: !prev[leg.id || i] }))}>
                        <div className="flex items-center gap-2">
                           {isMin ? <ChevronRight size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Leg {i + 1} {leg.departurePoint && leg.destinationPoint ? `- ${leg.departurePoint} to ${leg.destinationPoint}` : ''}</span>
                        </div>
                        <button type="button" onClick={(e) => {
                          e.stopPropagation();
                          setEditingTripLegs(prev => prev.filter((_, idx) => idx !== i));
                          setOdometerWarnings(prev => { const n = { ...prev }; delete n[i]; return n; });
                        }} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1 rounded-md transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                      {!isMin && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Date of Leg</label>
                          <input type="date" value={leg.date || editingLog?.date || new Date().toISOString().split('T')[0]} onChange={e => setEditingTripLegs(prev => { const n = [...prev]; n[i] = { ...n[i], date: e.target.value }; return n; })} className="w-full p-1.5 text-xs border border-slate-200 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">From</label>
                          <input type="text" placeholder="Departure point" value={leg.departurePoint || ''} onChange={e => setEditingTripLegs(prev => { const n = [...prev]; n[i] = { ...n[i], departurePoint: e.target.value }; return n; })} className="w-full p-1.5 text-xs border border-slate-200 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Depart Time</label>
                          <input type="time" value={leg.departureTime || ''} onChange={e => setEditingTripLegs(prev => { const n = [...prev]; n[i] = { ...n[i], departureTime: e.target.value }; return n; })} className="w-full p-1.5 text-xs border border-slate-200 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">To</label>
                          <input type="text" placeholder="Destination point" value={leg.destinationPoint || ''} onChange={e => setEditingTripLegs(prev => { const n = [...prev]; n[i] = { ...n[i], destinationPoint: e.target.value }; return n; })} className="w-full p-1.5 text-xs border border-slate-200 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Arrival Time</label>
                          <input type="time" value={leg.arrivalTime || ''} onChange={e => setEditingTripLegs(prev => { const n = [...prev]; n[i] = { ...n[i], arrivalTime: e.target.value }; return n; })} className="w-full p-1.5 text-xs border border-slate-200 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Odo Start (km)</label>
                          <input type="number" value={leg.odometerStart || ''} onChange={e => setEditingTripLegs(prev => { const n = [...prev]; n[i] = { ...n[i], odometerStart: Number(e.target.value) }; return n; })} className="w-full p-1.5 text-xs border border-slate-200 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Odo End (km)</label>
                          <input
                            type="number"
                            value={leg.odometerEnd || ''}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setEditingTripLegs(prev => { const n = [...prev]; n[i] = { ...n[i], odometerEnd: val }; return n; });
                            }}
                            onBlur={e => {
                              const val = Number(e.target.value);
                              const warnings: Record<number, string> = { ...odometerWarnings };
                              // Validate end > start
                              if (val <= (leg.odometerStart || 0)) {
                                warnings[i] = `Odo End must be greater than Odo Start (${leg.odometerStart} km)`;
                              } else {
                                delete warnings[i];
                              }
                              // Validate continuity with next leg
                              const nextLeg = editingTripLegs[i + 1];
                              if (nextLeg && nextLeg.odometerStart && nextLeg.odometerStart !== val) {
                                warnings[i] = `⚠ Gap of ${Math.abs(val - (nextLeg.odometerStart || 0))} km — Odo End doesn't match Leg ${i + 2} start.`;
                              }
                              setOdometerWarnings(warnings);
                            }}
                            className={`w-full p-1.5 text-xs border rounded-lg ${odometerWarnings[i] ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}
                          />
                          {odometerWarnings[i] && <p className="text-[10px] text-amber-600 mt-1">{odometerWarnings[i]}</p>}
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Purpose of Trip</label>
                          <input type="text" placeholder="e.g. Site visit, Patient transport, Resupply..." value={leg.purposeOfTrip || ''} onChange={e => setEditingTripLegs(prev => { const n = [...prev]; n[i] = { ...n[i], purposeOfTrip: e.target.value }; return n; })} className="w-full p-1.5 text-xs border border-slate-200 rounded-lg" />
                        </div>
                      </div>
                      )}
                    </div>
                  )})}
                </div>

                {editingTripLegs.length > 0 && (
                  <div className="mt-2 text-xs text-slate-600 bg-blue-50 p-2 rounded-lg border border-blue-100">
                    Auto-calculated distance: <span className="font-bold text-blue-700">
                      {editingTripLegs.reduce((sum, l) => sum + Math.max(0, (l.odometerEnd || 0) - (l.odometerStart || 0)), 0).toLocaleString()} km
                    </span> from {editingTripLegs.length} leg(s).
                  </div>
                )}
                </>
                )}
              </div>

              {/* ── Passenger Manifest ── */}
              <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5"><Users size={14} className="text-blue-500" /> Passenger Manifest</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Record all passengers travelling on this trip for accountability.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingPassengers(prev => [...prev, { id: `pax-${Date.now()}`, name: '' }])}
                    className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Passenger
                  </button>
                </div>

                {editingPassengers.length === 0 && (
                  <p className="text-xs text-slate-500 italic py-2 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">No passengers recorded.</p>
                )}

                <div className="space-y-2">
                  {editingPassengers.map((pax, i) => (
                    <div key={pax.id || i} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">{i + 1}</div>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={pax.name || ''}
                        onChange={e => setEditingPassengers(prev => { const n = [...prev]; n[i] = { ...n[i], name: e.target.value }; return n; })}
                        className="flex-1 p-2 text-sm border border-slate-200 rounded-xl"
                      />
                      <button type="button" onClick={() => setEditingPassengers(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 flex justify-end mt-4">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Modal - Tabbed Form */}
      {isDriverModalOpen && (
        <DriverModal
          editingDriver={editingDriver}
          allStatusLogs={allStatusLogs}
          onClose={() => setIsDriverModalOpen(false)}
          onSave={async (driverData) => {
            const isEditing = !!editingDriver?.id;
            const prevStatus = editingDriver?.status;
            const newStatus = driverData.status;
            const statusChanged = isEditing && prevStatus && newStatus && prevStatus !== newStatus;
            const shouldLog = statusChanged || (!isEditing && newStatus && newStatus !== 'Active');
            const targetId = isEditing ? editingDriver!.id! : uuidv4();

            // ── 1. Update driver in state immediately ──────────────────
            if (isEditing) {
              setDrivers(prev => prev.map(d => d.id === editingDriver!.id ? { ...d, ...driverData } : d));
            } else {
              setDrivers(prev => [{ ...driverData, id: targetId, awards: [] } as Driver, ...prev]);
            }

            // ── 2. Optimistically add status log to the UI right away ───────
            if (shouldLog) {
              const tempId = uuidv4();
              const optimisticLog: DriverStatusLog = {
                id: tempId,
                driverId: targetId,
                status: newStatus!,
                reason: driverData.statusReason || '',
                recordedBy: undefined,
                createdAt: new Date().toISOString(),
              };

              setAllStatusLogs(prev => [optimisticLog, ...prev]);
              setDrivers(prev => prev.map(d => {
                if (d.id !== targetId) return d;
                const updatedLogs = [optimisticLog, ...(d.statusLogs || [])];
                return {
                  ...d,
                  statusLogs: updatedLogs,
                  suspensionCount: updatedLogs.filter(l => l.status === 'Suspended').length,
                };
              }));

              // ── 3. Persist to Supabase in the background ──────────────
              supabase.from('driver_status_logs').insert({
                driver_id: targetId,
                status: newStatus!,
                reason: driverData.statusReason || '',
                recorded_by: null,
              }).select().single().then(({ data: saved, error }) => {
                if (error) {
                  console.error('[Status Log] Insert failed:', error.message);
                  return;
                }
                // Swap temp UUID for real DB-assigned UUID
                if (saved) {
                  const realLog: DriverStatusLog = {
                    id: saved.id,
                    driverId: saved.driver_id,
                    status: saved.status,
                    reason: saved.reason,
                    recordedBy: saved.recorded_by,
                    createdAt: saved.created_at,
                  };
                  setAllStatusLogs(prev => prev.map(l => l.id === tempId ? realLog : l));
                  setDrivers(prev => prev.map(d => {
                    if (d.id !== targetId) return d;
                    return {
                      ...d,
                      statusLogs: (d.statusLogs || []).map(l => l.id === tempId ? realLog : l),
                    };
                  }));
                }
              });
            }

            // Note: modal is closed by DriverModal's onClose() after documents finish uploading
            return targetId;
          }}
        />
      )}

      {isVehicleModalOpen && (
        <VehicleModal
          editingVehicle={editingVehicle as Vehicle | null}
          onClose={() => setIsVehicleModalOpen(false)}
          onSave={(data) => {
            // VehicleModal handles all Supabase inserts/updates directly.
            // Use _setVehicles here to update LOCAL STATE ONLY — no secondary sync.
            if (editingVehicle?.id) {
              _setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? { ...v, ...data } : v));
              if (viewingVehicle?.id === editingVehicle.id) {
                setViewingVehicle(prev => prev ? { ...prev, ...data } as Vehicle : null);
              }
            } else {
              // New vehicle: VehicleModal already inserted it and put the real ID in data.id
              _setVehicles(prev => [{ ...data, id: data.id! } as Vehicle, ...prev]);
            }
            setIsVehicleModalOpen(false);
          }}
        />
      )}
      {/* Delete Vehicle Confirmation */}
      {deletingVehicle && (
        <div className="fixed inset-0 bg-slate-900/60 z-[250] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up border border-slate-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Vehicle</h3>
              <p className="text-slate-500 text-sm">
                Are you sure you want to delete the <span className="font-bold text-slate-700">{deletingVehicle.makeModel}</span> ({deletingVehicle.plateNumber})? This action cannot be undone.
              </p>
            </div>
            <div className="flex bg-slate-50 p-4 gap-3 border-t border-slate-100">
              <button
                onClick={() => setDeletingVehicle(null)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setVehicles(prev => prev.filter(v => v.id !== deletingVehicle.id));
                  setDeletingVehicle(null);
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Driver Scorecard Modal */}
      {selectedDriverScorecard && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {(() => {
              const ds = driverScores.find(d => d.driver.id === selectedDriverScorecard);
              if (!ds) return null;
              
              return (
                <div>
                  <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-blue-600 text-white rounded-t-2xl relative overflow-hidden">
                    <div className="relative z-10 flex gap-4 items-center">
                      <img src={ds.driver.imgUrl} alt={ds.driver.name} className="w-16 h-16 rounded-full border-4 border-blue-400" />
                      <div>
                        <h2 className="text-2xl font-black">{ds.driver.name}</h2>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs font-bold uppercase tracking-wider bg-blue-500 px-2 py-1 rounded-md">{ds.driver.status}</span>
                          <span className="text-xs font-bold uppercase tracking-wider bg-amber-500 px-2 py-1 rounded-md flex items-center gap-1"><Trophy size={12} /> {ds.driver.awards?.length || 0} Awards</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative z-10 text-right">
                      <div className="text-4xl font-black">{ds.score}</div>
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-200">Performance Score</div>
                    </div>
                    {/* Background decoration */}
                    <Trophy className="absolute -right-4 -bottom-4 text-blue-500 opacity-20" size={120} />
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-black text-slate-950">{ds.trips}</div>
                        <div className="text-xs font-bold text-slate-600 uppercase">Trips Logged</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-black text-slate-950">{ds.totalDistance} <span className="text-sm">km</span></div>
                        <div className="text-xs font-bold text-slate-600 uppercase">Total Distance</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-black text-slate-950">{ds.efficiency} <span className="text-sm">km/L</span></div>
                        <div className="text-xs font-bold text-slate-600 uppercase">Avg Efficiency</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider mb-3 flex items-center gap-2"><AlertTriangle className="text-amber-500" size={16} /> Infractions & Behaviors</h3>
                      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                        <div className="flex justify-between items-center p-3">
                          <span className="text-sm font-semibold text-slate-700">Fuel Variance Warnings (Theft Suspicion)</span>
                          <span className={`text-sm font-black ${ds.varianceWarnings > 0 ? 'text-red-600' : 'text-emerald-500'}`}>{ds.varianceWarnings}</span>
                        </div>
                        <div className="flex justify-between items-center p-3">
                          <span className="text-sm font-semibold text-slate-700">Accidents / Incidents</span>
                          <span className={`text-sm font-black ${ds.incidents > 0 ? 'text-red-600' : 'text-emerald-500'}`}>{ds.incidents}</span>
                        </div>
                        <div className="flex justify-between items-center p-3">
                          <span className="text-sm font-semibold text-slate-700">Policy Violations</span>
                          <span className={`text-sm font-black ${ds.policyViolations > 0 ? 'text-amber-600' : 'text-emerald-500'}`}>{ds.policyViolations}</span>
                        </div>
                        <div className="flex justify-between items-center p-3">
                          <span className="text-sm font-semibold text-slate-700">Route Deviations</span>
                          <span className={`text-sm font-black ${ds.routeDeviations > 0 ? 'text-amber-600' : 'text-emerald-500'}`}>{ds.routeDeviations}</span>
                        </div>
                        <div className="flex justify-between items-center p-3">
                          <span className="text-sm font-semibold text-slate-700">Speeding Events</span>
                          <span className={`text-sm font-black ${ds.speeding > 0 ? 'text-amber-600' : 'text-emerald-500'}`}>{ds.speeding}</span>
                        </div>
                        <div className="flex justify-between items-center p-3">
                          <span className="text-sm font-semibold text-slate-700">Total Idling Time</span>
                          <span className={`text-sm font-black ${ds.idling > 5 ? 'text-amber-600' : 'text-slate-700'}`}>{ds.idling} hrs</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-4">
                      <Trophy className="text-emerald-600 mt-1" size={24} />
                      <div>
                        <h4 className="font-bold text-emerald-900">Award Driver</h4>
                        <p className="text-sm text-emerald-700 mt-1">Has this driver performed exceptionally well this month? Add a Driver of the Month award to their profile.</p>
                        <button 
                          onClick={() => {
                            setDrivers(prev => prev.map(d => d.id === ds.driver.id ? { ...d, awards: [...(d.awards || []), `Driver of the Month - ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`] } : d));
                            alert('Award added successfully!');
                          }}
                          className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors"
                        >
                          Issue Award
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-slate-100 flex justify-end">
                    <button onClick={() => setSelectedDriverScorecard(null)} className="px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">Close</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-blue-600 sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-black text-white">{editingDispatch ? 'Edit Dispatch' : 'Digital Dispatch Checklist'}</h2>
                <p className="text-blue-200 text-xs mt-0.5">Assign or manage a driver and vehicle for dispatch.</p>
              </div>
              <button onClick={() => { setIsDispatchModalOpen(false); setEditingDispatch(null); }} className="text-blue-200 hover:text-white bg-blue-500 hover:bg-blue-400 rounded-lg p-1.5 transition-colors"><X size={18} /></button>
            </div>
            <form key={editingDispatch?.id || 'new'} onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const driverId = fd.get('driverId') as string;
              const vehicleId = fd.get('vehicleId') as string;

              if (!driverId || !vehicleId) {
                alert('Please select both a driver and a vehicle.');
                return;
              }

              const isEditingCompleted = editingDispatch && 'completedAt' in editingDispatch;

              // Gap #7 and #8: Prevent dispatching if already active (only for active dispatches)
              if (!isEditingCompleted) {
                const isDriverActive = activeDispatches.some(d => d.driverId === driverId && d.id !== editingDispatch?.id);
                const isVehicleActive = activeDispatches.some(d => d.vehicleId === vehicleId && d.id !== editingDispatch?.id);

                if (isDriverActive) {
                  alert('This driver is currently assigned to an active dispatch and cannot be dispatched again until returned.');
                  return;
                }
                if (isVehicleActive) {
                  alert('This vehicle is currently assigned to an active dispatch and cannot be dispatched again until returned.');
                  return;
                }
              }

              const data: Partial<ActiveDispatch | CompletedDispatch> = {
                id: editingDispatch ? editingDispatch.id! : uuidv4(),
                driverId,
                vehicleId,
                dispatchTime: new Date(fd.get('dispatchTime') as string).toISOString(),
                odometerOut: Number(fd.get('odometerOut')),
                fuelLevelOut: fd.get('fuelLevelOut') as string,
                conditionOut: fd.get('conditionOut') as string,
                corporateAccountId: fd.get('corporateAccountId') as string || undefined,
                projectId: fd.get('projectId') as string || undefined,
                expectedReturnDate: fd.get('expectedReturnDate') as string,
              };
              if (editingDispatch) {
                if ('completedAt' in editingDispatch) {
                  setCompletedDispatches(prev => prev.map(d => d.id === editingDispatch.id ? { ...d, ...data } as CompletedDispatch : d));
                  supabase.from('completed_dispatches').update({
                    driver_id: data.driverId,
                    vehicle_id: data.vehicleId,
                    odometer_out: data.odometerOut,
                    fuel_level_out: data.fuelLevelOut,
                    condition_out: data.conditionOut,
                    corporate_account_id: data.corporateAccountId,
                    project_id: data.projectId,
                    expected_return_date: data.expectedReturnDate,
                  }).eq('id', editingDispatch.id).then();
                  
                  // Also update the linked trip log's project code if it exists
                  const compDispatch = editingDispatch as CompletedDispatch;
                  setLogs(prev => {
                    const linkedLog = prev.find(l => l.id === compDispatch.tripLogId || l.dispatchId === compDispatch.id || l.dispatchId === compDispatch.originalDispatchId);
                    if (linkedLog && linkedLog.projectCode !== data.projectId) {
                      supabase.from('trip_logs').update({
                        project_code: data.projectId
                      }).eq('id', linkedLog.id).then();
                      return prev.map(l => l.id === linkedLog.id ? { ...l, projectCode: data.projectId } : l);
                    }
                    return prev;
                  });
                } else {
                  setActiveDispatches(prev => prev.map(d => d.id === editingDispatch.id ? { ...d, ...data } as ActiveDispatch : d));
                  supabase.from('active_dispatches').update({
                    driver_id: data.driverId,
                    vehicle_id: data.vehicleId,
                    odometer_out: data.odometerOut,
                    fuel_level_out: data.fuelLevelOut,
                    condition_out: data.conditionOut,
                    corporate_account_id: data.corporateAccountId,
                    project_id: data.projectId,
                    expected_return_date: data.expectedReturnDate,
                  }).eq('id', editingDispatch.id).then();
                }
              } else {
                setActiveDispatches(prev => [data as ActiveDispatch, ...prev]);
                // Ensure active status changes
                setVehicles(prev => prev.map(v => v.id === data.vehicleId ? { ...v, status: 'Active Dispatch' } : v));
                // Persist to DB
                supabase.from('active_dispatches').insert({
                  id: data.id,
                  driver_id: data.driverId,
                  vehicle_id: data.vehicleId,
                  dispatch_time: data.dispatchTime,
                  odometer_out: data.odometerOut,
                  fuel_level_out: data.fuelLevelOut,
                  condition_out: data.conditionOut,
                  corporate_account_id: data.corporateAccountId,
                  project_id: data.projectId,
                  expected_return_date: data.expectedReturnDate,
                }).then(({ error }) => {
                  if (error) console.warn('[Dispatch Insert] Failed:', error.message);
                });
              }
              setIsDispatchModalOpen(false);
              setEditingDispatch(null);
            }} className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Driver *</label>
                <Select
                  name="driverId"
                  options={drivers.filter(d => {
                    const isActiveElsewhere = activeDispatches.some(ad => ad.driverId === d.id && ad.id !== editingDispatch?.id);
                    return !isActiveElsewhere || d.id === editingDispatch?.driverId;
                  }).map(d => ({ value: d.id, label: d.name }))}
                  defaultValue={editingDispatch?.driverId ? { value: editingDispatch.driverId, label: drivers.find(d => d.id === editingDispatch.driverId)?.name } : null}
                  placeholder="Select Driver..."
                  className="text-sm"
                  menuPosition="fixed"
                  styles={{ control: (base) => ({ ...base, borderRadius: '0.75rem', borderColor: '#e2e8f0', backgroundColor: '#f8fafc', padding: '2px' }) }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Vehicle *</label>
                <Select
                  name="vehicleId"
                  options={vehicles.filter(v => v.status === 'Available' || v.id === editingDispatch?.vehicleId).map(v => ({ value: v.id, label: `${v.makeModel} (${v.plateNumber || 'N/A'})` }))}
                  defaultValue={editingDispatch?.vehicleId ? { value: editingDispatch.vehicleId, label: (() => { const v = vehicles.find(v => v.id === editingDispatch.vehicleId); return v ? `${v.makeModel} (${v.plateNumber || 'N/A'})` : ''; })() } : null}
                  placeholder="Select Vehicle..."
                  className="text-sm"
                  menuPosition="fixed"
                  styles={{ control: (base) => ({ ...base, borderRadius: '0.75rem', borderColor: '#e2e8f0', backgroundColor: '#f8fafc', padding: '2px' }) }}
                />
              </div>

              {/* ── Billing Section ──────────────────────────────── */}
              <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    Billing
                  </label>
                  {/* Toggle */}
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setDispatchBillingMode('project')}
                      className={`px-3 py-1 rounded-md transition-all ${dispatchBillingMode === 'project' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Bill to Client / Project
                    </button>
                    <button
                      type="button"
                      onClick={() => setDispatchBillingMode('corporate')}
                      className={`px-3 py-1 rounded-md transition-all ${dispatchBillingMode === 'corporate' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Separate Corporate A/C
                    </button>
                  </div>
                </div>

                {/* Client / Project selector — always visible */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Client / Project</label>
                  <Select
                    name="projectId"
                    options={[{ value: '', label: 'None / Internal' }, ...clients.map(c => ({ value: c.id, label: c.name }))]}
                    defaultValue={editingDispatch?.projectId ? { value: editingDispatch.projectId, label: clients.find(c => c.id === editingDispatch.projectId)?.name || 'None / Internal' } : { value: '', label: 'None / Internal' }}
                    placeholder="Search Client/Project..."
                    className="text-sm"
                    menuPosition="fixed"
                    styles={{ control: (base) => ({ ...base, borderRadius: '0.75rem', borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: '0px' }) }}
                  />
                  {dispatchBillingMode === 'project' && (
                    <p className="text-[10px] text-blue-500 mt-1 font-medium">✓ Billing will be assigned to the selected client / project above.</p>
                  )}
                </div>

                {/* Corporate A/C — only shown when mode is 'corporate' */}
                {dispatchBillingMode === 'corporate' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Corporate Account</label>
                    <Select
                      name="corporateAccountId"
                      options={[{ value: '', label: 'None / Default' }, ...mockAccounts.map((a: any) => ({ value: a.id, label: a.name }))]}
                      defaultValue={editingDispatch?.corporateAccountId ? { value: editingDispatch.corporateAccountId, label: (() => { const a = mockAccounts.find((a: any) => a.id === editingDispatch.corporateAccountId); return a ? a.name : 'None / Default'; })() } : { value: '', label: 'None / Default' }}
                      placeholder="Search Corporate Account..."
                      className="text-sm"
                      menuPosition="fixed"
                      styles={{ control: (base) => ({ ...base, borderRadius: '0.75rem', borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: '0px' }) }}
                    />
                    <p className="text-[10px] text-amber-600 mt-1 font-medium">⚠ Billing will be routed to this corporate account instead of the client/project.</p>
                  </div>
                )}
                {/* Hidden input to clear corporateAccountId when mode is project */}
                {dispatchBillingMode === 'project' && (
                  <input type="hidden" name="corporateAccountId" value="" />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Odometer Out</label>
                <input type="number" name="odometerOut" defaultValue={editingDispatch?.odometerOut || ''} required className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Fuel Level OUT</label>
                <select name="fuelLevelOut" defaultValue={editingDispatch?.fuelLevelOut || '100'} required className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white">
                  <option value="100">100% — Full</option>
                  <option value="90">90%</option>
                  <option value="80">80%</option>
                  <option value="70">70%</option>
                  <option value="60">60%</option>
                  <option value="50">50% — Half</option>
                  <option value="40">40%</option>
                  <option value="30">30%</option>
                  <option value="20">20%</option>
                  <option value="10">10%</option>
                  <option value="Empty">Empty (Reserve)</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Visual Condition / Notes</label>
                <textarea name="conditionOut" defaultValue={editingDispatch?.conditionOut || ''} placeholder="e.g. Clean, scratch on left door" required rows={2} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Dispatch Date</label>
                <input type="datetime-local" name="dispatchTime" required
                  defaultValue={editingDispatch?.dispatchTime ? new Date(new Date(editingDispatch.dispatchTime).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Expected Return Date</label>
                {/* #25: Default to tomorrow, not today */}
                <input type="date" name="expectedReturnDate" required
                  defaultValue={editingDispatch?.expectedReturnDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
              </div>
              <div className="col-span-2 flex justify-end mt-4">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700">Confirm & Dispatch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-blue-600 sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-black text-white">Record Vehicle Maintenance</h2>
                {maintenanceFromTripLog ? (
                  <p className="text-xs text-amber-200 font-bold mt-1 flex items-center gap-1">
                    <AlertTriangle size={11} /> Linked from trip log - vehicle pre-filled
                  </p>
                ) : (
                  <p className="text-blue-200 text-xs mt-0.5">Log maintenance records and repair costs.</p>
                )}
              </div>
              <button type="button" onClick={() => { setIsMaintenanceModalOpen(false); setMaintenanceFromTripLog(null); }} className="text-blue-200 hover:text-white bg-blue-500 hover:bg-blue-400 rounded-lg p-1.5 transition-colors"><X size={18}/></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const isNew = !editingMaintenance?.id;
              const data: MaintenanceRecord = {
                id: isNew ? uuidv4() : editingMaintenance.id!,
                vehicleId: fd.get('vehicleId') as string,
                driverId: fd.get('driverId') as string || undefined,
                startDate: fd.get('startDate') as string,
                expectedCompletionDate: fd.get('completionDate') as string,
                completionDate: fd.get('completionDate') as string,
                issuesFound: fd.get('issuesFound') as string,
                cost: Number(fd.get('cost')),
                status: fd.get('status') as any,
                mechanicOrShop: fd.get('mechanicOrShop') as string,
                mechanicContact: fd.get('mechanicContact') as string,
                mechanicAddress: fd.get('mechanicAddress') as string
              };
              
              if (isNew) {
                setMaintenanceRecords(prev => [data, ...prev]);
                if (data.status === 'In Progress') {
                  setVehicles(prev => prev.map(v => v.id === data.vehicleId ? { ...v, status: 'Maintenance' } : v));
                } else if (data.status === 'Completed') {
                  setVehicles(prev => prev.map(v => v.id === data.vehicleId ? { ...v, status: 'Available' } : v));
                }
              } else {
                setMaintenanceRecords(prev => prev.map(m => m.id === data.id ? data : m));
                if (data.status === 'Completed') {
                  setVehicles(prev => prev.map(v => v.id === data.vehicleId ? { ...v, status: 'Available' } : v));
                } else if (data.status === 'In Progress') {
                  setVehicles(prev => prev.map(v => v.id === data.vehicleId ? { ...v, status: 'Maintenance' } : v));
                }
              }
              // ── Gap 2: Link maintenanceRecordId back to originating trip log ────
              if (maintenanceFromTripLog) {
                setLogs(prev => prev.map(l => l.id === maintenanceFromTripLog.tripLogId ? { ...l, maintenanceRecordId: data.id } : l));
                setMaintenanceFromTripLog(null);
              }

              setIsMaintenanceModalOpen(false);
            }} className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Vehicle</label>
                <select name="vehicleId" required defaultValue={editingMaintenance?.vehicleId} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white">
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.makeModel} ({v.plateNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Driver (Optional)</label>
                <select name="driverId" defaultValue={editingMaintenance?.driverId} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white">
                  <option value="">Select Driver</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Status</label>
                <select name="status" required defaultValue={editingMaintenance?.status} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white">
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress (Out of Service)</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Start Date</label>
                <input type="date" name="startDate" required defaultValue={editingMaintenance?.startDate} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Return Date</label>
                <input type="date" name="completionDate" defaultValue={editingMaintenance?.completionDate || editingMaintenance?.expectedCompletionDate} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Issues & Repairs Performed</label>
                <textarea name="issuesFound" required defaultValue={editingMaintenance?.issuesFound} rows={3} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" placeholder="e.g. Oil change, brakes replaced, scratched bumper fixed"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Mechanic / Shop Name</label>
                <input type="text" name="mechanicOrShop" defaultValue={editingMaintenance?.mechanicOrShop} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Mechanic Contact</label>
                <input type="text" name="mechanicContact" defaultValue={editingMaintenance?.mechanicContact} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Mechanic Address</label>
                <input type="text" name="mechanicAddress" defaultValue={editingMaintenance?.mechanicAddress} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Total Cost (Le)</label>
                <input type="number" name="cost" required defaultValue={editingMaintenance?.cost} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
              </div>
              <div className="col-span-2 flex justify-end mt-4">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MAINTENANCE MODAL */}
      {viewingMaintenance && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-slate-200 p-2 rounded-xl text-slate-700">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">Maintenance Record Details</h3>
                  <p className="text-slate-600 text-xs mt-0.5">View details for the selected log.</p>
                </div>
              </div>
              <button type="button" onClick={() => setViewingMaintenance(null)} className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg p-1.5 transition-colors"><X size={18}/></button>
            </div>
            
            <div className="p-6">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Vehicle</p>
                    <p className="font-bold text-slate-800">{vehicles.find(v => v.id === viewingMaintenance.vehicleId)?.makeModel || 'N/A'}</p>
                    <p className="text-sm text-slate-600">{vehicles.find(v => v.id === viewingMaintenance.vehicleId)?.plateNumber || ''}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Driver</p>
                    <p className="font-bold text-slate-800">{drivers.find(d => d.id === viewingMaintenance.driverId)?.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Start Date</p>
                    <p className="font-medium text-slate-800">{viewingMaintenance.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Return Date</p>
                    <p className="font-medium text-slate-800">{viewingMaintenance.completionDate || viewingMaintenance.expectedCompletionDate || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-100 pb-2 mb-3">Issue & Cost</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Issues Found</p>
                    <div className="bg-slate-50 rounded-lg p-3 text-slate-700 text-sm whitespace-pre-wrap min-h-[60px] border border-slate-100">
                      {viewingMaintenance.issuesFound || 'None specified.'}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Cost</p>
                    <p className="font-black text-lg text-emerald-600">Le {viewingMaintenance.cost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      viewingMaintenance.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      viewingMaintenance.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {viewingMaintenance.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-100 pb-2 mb-3">Mechanic Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Mechanic / Shop</p>
                    <p className="font-medium text-slate-800">{viewingMaintenance.mechanicOrShop || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Contact</p>
                    <p className="font-medium text-slate-800">{viewingMaintenance.mechanicContact || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Address</p>
                    <p className="font-medium text-slate-800">{viewingMaintenance.mechanicAddress || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setViewingMaintenance(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-950 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TRIP LOG MODAL */}
      {viewingLog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-slate-200 p-2 rounded-xl text-slate-700">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">Trip Log Details</h3>
                  <p className="text-slate-600 text-xs mt-0.5">View details for the selected trip log.</p>
                </div>
              </div>
              <button type="button" onClick={() => setViewingLog(null)} className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg p-1.5 transition-colors"><X size={18}/></button>
            </div>
            
            <div className="p-6">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Vehicle</p>
                    <p className="font-bold text-slate-800">{vehicles.find(v => v.id === viewingLog.vehicleId)?.makeModel || 'N/A'}</p>
                    <p className="text-sm text-slate-600">{vehicles.find(v => v.id === viewingLog.vehicleId)?.plateNumber || ''}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Driver</p>
                    <p className="font-bold text-slate-800">{drivers.find(d => d.id === viewingLog.driverId)?.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Start Date</p>
                    <p className="font-medium text-slate-800">{viewingLog.date}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Return Date</p>
                    <p className="font-medium text-slate-800">{viewingLog.returnDate || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-100 pb-2 mb-3">Trip Performance</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Distance</p>
                    <p className="font-black text-lg text-slate-700">{viewingLog.distanceTraveledKm} <span className="text-sm font-bold text-slate-600">km</span></p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Fuel Consumed</p>
                    <p className="font-black text-lg text-slate-700">{viewingLog.fuelConsumedLiters} <span className="text-sm font-bold text-slate-600">L</span></p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Incidents</p>
                    <p className="font-black text-lg text-slate-700">{viewingLog.incidents}</p>
                  </div>
                  <div className="col-span-3 mt-2">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Trip Notes</p>
                    <div className="bg-slate-50 rounded-lg p-3 text-slate-700 text-sm whitespace-pre-wrap min-h-[60px] border border-slate-100">
                      {viewingLog.notes || 'None specified.'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-100 pb-2 mb-3">Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Approval</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      viewingLog.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      viewingLog.approvalStatus === 'Flagged' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {viewingLog.approvalStatus || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      viewingLog.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      viewingLog.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {viewingLog.status}
                    </span>
                  </div>
                  {viewingLog.approvalStatus === 'Flagged' && viewingLog.approvalNotes && (
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Flag Reason</p>
                      <p className="font-medium text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">{viewingLog.approvalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setViewingLog(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-950 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Approval Modal â”€â”€ */}
      {approvalModalLogId && (() => {
        const logForApproval = logs.find(l => l.id === approvalModalLogId);
        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="px-6 py-5 bg-emerald-600 flex justify-between items-center sticky top-0 z-20">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2"><CheckCircle2 size={20} /> {logForApproval?.approvalStatus === 'Approved' ? 'Update Approval Notes' : 'Trip Approval'}</h2>
                  <p className="text-emerald-100 text-xs mt-0.5">{logForApproval?.approvalStatus === 'Approved' ? 'Update the approval notes for this already-approved trip.' : 'Confirm your identity and sign to approve this trip log.'}</p>
                </div>
                <button onClick={() => setApprovalModalLogId(null)} className="text-emerald-200 hover:text-white bg-emerald-500 hover:bg-emerald-400 rounded-lg p-1.5 transition-colors"><X size={18} /></button>
              </div>

              {/* Trip summary */}
              {logForApproval && (() => {
                const driver = drivers.find(d => d.id === logForApproval.driverId);
                const vehicle = vehicles.find(v => v.id === logForApproval.vehicleId);
                return (
                  <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 flex flex-wrap gap-4 text-xs text-emerald-800">
                    <span><span className="font-bold">Date:</span> {logForApproval.date}</span>
                    <span><span className="font-bold">Driver:</span> {driver?.name || 'â€”'}</span>
                    <span><span className="font-bold">Vehicle:</span> {vehicle?.makeModel || 'â€”'}</span>
                    <span><span className="font-bold">Distance:</span> {logForApproval.distanceTraveledKm} km</span>
                  </div>
                );
              })()}

              <div className="p-6 space-y-5">
                {/* Approver Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Approver Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={approvalApproverName}
                    onChange={e => setApprovalApproverName(e.target.value)}
                    placeholder="Enter your full name..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-400 text-sm"
                    autoFocus
                  />
                </div>

                {/* Date (auto) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Approval Date</label>
                  <div className="w-full p-2.5 border border-slate-100 rounded-xl bg-slate-50 text-sm text-slate-700 font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-slate-500" /> {today} <span className="text-xs text-slate-500 ml-1">(auto-set by system)</span>
                  </div>
                </div>

                {/* Approval Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Approval Notes <span className="text-slate-500 font-normal">(optional)</span></label>
                  <textarea
                    value={approvalNoteInput}
                    onChange={e => setApprovalNoteInput(e.target.value)}
                    rows={2}
                    placeholder="Any remarks or conditions for approval..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-400 text-sm resize-none"
                  />
                </div>

                {/* Signature Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-600 uppercase">Signature <span className="text-red-500">*</span></label>
                    <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                      <button type="button" onClick={() => { setApprovalSignatureMode('draw'); setApprovalSignatureData(null); }} className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all ${approvalSignatureMode === 'draw' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'}`}><PenTool size={14} /> Draw</button>
                      <button type="button" onClick={() => { setApprovalSignatureMode('upload'); clearApprovalCanvas(); }} className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all ${approvalSignatureMode === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600'}`}><Upload size={14} /> Upload</button>
                    </div>
                  </div>

                  {approvalSignatureMode === 'draw' ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative">
                      <canvas
                        ref={approvalCanvasRef}
                        width={600}
                        height={150}
                        className="w-full touch-none cursor-crosshair"
                        style={{ display: 'block' }}
                        onMouseDown={startApprovalDraw}
                        onMouseMove={continueApprovalDraw}
                        onMouseUp={endApprovalDraw}
                        onMouseLeave={endApprovalDraw}
                        onTouchStart={startApprovalDraw}
                        onTouchMove={continueApprovalDraw}
                        onTouchEnd={endApprovalDraw}
                      />
                      <div className="absolute bottom-2 right-2 flex gap-2">
                        <button type="button" onClick={clearApprovalCanvas} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors">Clear</button>
                      </div>
                      {!approvalSignatureData && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <p className="text-xs text-slate-500">Sign here using your finger or mouse</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50">
                      {approvalSignatureData ? (
                        <div className="flex items-center gap-4">
                          <div className="relative border border-slate-200 rounded-lg overflow-hidden" style={{background: 'repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%) 0 0 / 12px 12px'}}>
                            <img src={approvalSignatureData} alt="Uploaded signature" className="h-16 object-contain px-2 relative z-10" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Background removed</span>
                            <button type="button" onClick={() => setApprovalSignatureData(null)} className="text-xs text-red-500 hover:text-red-700 font-bold text-left">Remove</button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-2 cursor-pointer">
                          <Upload size={20} className="text-slate-500" />
                          <span className="text-xs text-slate-600 font-medium">Click to upload signature image</span>
                          <span className="text-[10px] text-slate-500">PNG, JPG, SVG supported</span>
                          <input type="file" accept="image/*" className="hidden" onChange={e => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const reader = new FileReader();
                            reader.onload = ev => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext('2d');
                                if (!ctx) return setApprovalSignatureData(ev.target?.result as string);
                                
                                ctx.drawImage(img, 0, 0);
                                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                const data = imageData.data;
                                
                                // Remove white/light background
                                for (let i = 0; i < data.length; i += 4) {
                                  const r = data[i];
                                  const g = data[i + 1];
                                  const b = data[i + 2];
                                  // If pixel is near white, make it transparent
                                  if (r > 200 && g > 200 && b > 200) {
                                    data[i + 3] = 0;
                                  }
                                }
                                
                                ctx.putImageData(imageData, 0, 0);
                                setApprovalSignatureData(canvas.toDataURL('image/png'));
                              };
                              img.src = ev.target?.result as string;
                            };
                            reader.readAsDataURL(f);
                          }} />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setApprovalModalLogId(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors text-sm">Cancel</button>
                <button
                  disabled={!approvalApproverName.trim() || (logForApproval?.approvalStatus !== 'Approved' && !approvalSignatureData)}
                  onClick={() => handleApproveLog(approvalModalLogId!, approvalApproverName.trim(), approvalNoteInput.trim(), approvalSignatureData)}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Confirm Approval
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* City Modal */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">{editingCity.id ? 'Edit City' : 'Add New City'}</h3>
              <button onClick={() => setIsCityModalOpen(false)} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveCity} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">City Name</label>
                <input type="text" value={editingCity.name || ''} onChange={e => setEditingCity({ ...editingCity, name: e.target.value })} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-400" required placeholder="e.g. Freetown" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Region (Optional)</label>
                <input type="text" value={editingCity.region || ''} onChange={e => setEditingCity({ ...editingCity, region: e.target.value })} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-400" placeholder="e.g. Western Area" />
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors">Save City</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Station Modal */}
      {isStationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">{editingStation.id ? 'Edit Station' : 'Add New Station'}</h3>
              <button onClick={() => setIsStationModalOpen(false)} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveStation} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Station Name</label>
                <input type="text" value={editingStation.name || ''} onChange={e => setEditingStation({ ...editingStation, name: e.target.value })} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-400" required placeholder="e.g. NP Main Street" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Supplier Brand</label>
                <select value={editingStation.supplier || ''} onChange={e => setEditingStation({ ...editingStation, supplier: e.target.value || undefined })} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-400">
                  <option value="">None / Other</option>
                  <option value="NP">NP</option>
                  <option value="TotalEnergies">TotalEnergies</option>
                  <option value="Malado">Malado</option>
                </select>
              </div>
              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" id="isPartnerCheck" checked={!!editingStation.is_partner} onChange={e => setEditingStation({ ...editingStation, is_partner: e.target.checked })} className="w-5 h-5 rounded text-blue-600 border-slate-300 focus:ring-blue-500" />
                <label htmlFor="isPartnerCheck" className="text-sm font-medium text-slate-700">Official Partner Station</label>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors">Save Station</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Standalone Fuel Fill-Up Modal ── */}
      {isStandaloneFuelModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-blue-600 sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2"><Fuel size={18} /> Record Fuel Fill-Up</h2>
                <p className="text-blue-200 text-xs mt-0.5">Log a fuel fill-up independently of a trip return.</p>
              </div>
              <button onClick={() => setIsStandaloneFuelModalOpen(false)} className="text-blue-200 hover:text-white bg-blue-500 hover:bg-blue-400 rounded-lg p-1.5 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Driver + Vehicle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Driver</label>
                  <SearchableSelect 
                    value={standaloneFuelDriverId} 
                    onChange={(v: any) => setStandaloneFuelDriverId(v)} 
                    options={[
                      {value: '', label: 'Select Driver...'},
                      ...drivers.map(d => ({value: d.id, label: d.name}))
                    ]} 
                    placeholder="Select Driver..." 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Vehicle</label>
                  <SearchableSelect 
                    value={standaloneFuelVehicleId} 
                    onChange={(v: any) => setStandaloneFuelVehicleId(v)} 
                    options={[
                      {value: '', label: 'Select Vehicle...'},
                      ...vehicles.map(v => ({value: v.id, label: `${v.makeModel} (${v.plateNumber})`}))
                    ]} 
                    placeholder="Select Vehicle..." 
                  />
                </div>
              </div>
              {/* Link to Trip Log (optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Link to Trip Log <span className="font-normal text-slate-400 normal-case">(optional)</span></label>
                <SearchableSelect 
                    value={standaloneFuelTripLogId} 
                    onChange={(v: any) => {
                      setStandaloneFuelTripLogId(v);
                      if (v) {
                        const selectedLog = logs.find(l => l.id === v);
                        if (selectedLog) {
                          if (selectedLog.driverId) setStandaloneFuelDriverId(selectedLog.driverId);
                          if (selectedLog.vehicleId) setStandaloneFuelVehicleId(selectedLog.vehicleId);
                          if (selectedLog.date) {
                            setStandaloneFuelEntry((prev: any) => ({ ...prev, date: selectedLog.date }));
                          }
                        }
                      }
                    }} 
                    options={[
                      {value: '', label: 'No linked trip (Standalone)'},
                      ...logs.filter(l => !standaloneFuelDriverId || l.driverId === standaloneFuelDriverId).slice(0, 30).map(l => {
                        const drv = drivers.find(d => d.id === l.driverId)?.name || 'Unknown Driver';
                        const veh = vehicles.find(v => v.id === l.vehicleId)?.name || 'Unknown Vehicle';
                        const dest = l.district ? ` to ${l.district}` : '';
                        return {
                          value: l.id, 
                          label: `${l.date}: Trip${dest} (${drv} • ${veh})`
                        };
                      })
                    ]} 
                    placeholder="No linked trip (Standalone)" 
                  />
              </div>
              {/* Station + Supplier */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Station Name</label>
                  <SearchableSelect 
                    value={standaloneFuelEntry.stationName || ''} 
                    onChange={(v: any) => {
                      const st = fuelStations.find(s => s.name === v);
                      setStandaloneFuelEntry((prev: any) => ({
                        ...prev,
                        stationName: v,
                        isPartnerStation: st ? (st.is_partner ?? false) : prev.isPartnerStation
                      }));
                    }} 
                    options={[
                      {value: '', label: 'Select Station...'},
                      ...fuelStations.map(s => ({value: s.name, label: s.name + (s.is_partner ? ' ★' : '')}))
                    ]} 
                    placeholder="Select Station..." 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Partner / Client</label>
                  <SearchableSelect 
                    value={standaloneFuelEntry.supplier || ''} 
                    onChange={(v: any) => {
                      setStandaloneFuelEntry((prev: any) => ({ ...prev, supplier: v }));
                    }} 
                    options={[
                      {value: '', label: 'Select Partner / Client...'},
                      ...clients.map((c: any) => ({value: c.name, label: c.name + (c.isPartner ? ' ★' : '')}))
                    ]} 
                    placeholder="Select Partner / Client..." 
                  />
                </div>
              </div>
              {/* City + District */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">City</label>
                  <SearchableSelect 
                    value={standaloneFuelEntry.location || ''} 
                    onChange={(v: any) => setStandaloneFuelEntry((prev: any) => ({ ...prev, location: v }))} 
                    options={[
                      {value: '', label: 'Select City...'},
                      ...(fuelCities.length > 0 ? fuelCities.map(c => ({value: c.name, label: c.name})) : slCities.map(c => ({value: c, label: c})))
                    ]} 
                    placeholder="Select City..." 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">District</label>
                  <SearchableSelect 
                    value={standaloneFuelEntry.district || ''} 
                    onChange={(v: any) => setStandaloneFuelEntry((prev: any) => ({ ...prev, district: v }))} 
                    options={[
                      {value: '', label: 'Select District...'},
                      ...slDistricts.map(d => ({value: d, label: d}))
                    ]} 
                    placeholder="Select District..." 
                  />
                </div>
              </div>
              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Date</label>
                  <input type="date" value={standaloneFuelEntry.date || ''} onChange={e => setStandaloneFuelEntry(prev => ({ ...prev, date: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Time</label>
                  <input type="time" value={standaloneFuelEntry.time || ''} onChange={e => setStandaloneFuelEntry(prev => ({ ...prev, time: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              {/* Fuel Type */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Fuel Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Petrol', 'Diesel', 'Premium'] as const).map(ft => (
                    <label key={ft} className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border-2 cursor-pointer text-xs font-bold transition-all ${standaloneFuelEntry.fuelType === ft ? ft === 'Diesel' ? 'border-amber-400 bg-amber-50 text-amber-700' : ft === 'Premium' ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-green-400 bg-green-50 text-green-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                      <input type="radio" checked={standaloneFuelEntry.fuelType === ft} onChange={() => setStandaloneFuelEntry(prev => ({ ...prev, fuelType: ft }))} className="hidden" />
                      {ft}
                    </label>
                  ))}
                </div>
              </div>
              {/* Litres + Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Litres</label>
                  <input type="number" step="0.1" min="0" value={standaloneFuelEntry.liters || ''} onChange={e => setStandaloneFuelEntry(prev => ({ ...prev, liters: Number(e.target.value) }))} className="w-full p-2 border border-slate-200 rounded-xl text-sm" placeholder="0.0" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Cost / Litre (Le)</label>
                  <input type="number" step="0.01" min="0" value={standaloneFuelEntry.costPerLiter || ''} onChange={e => setStandaloneFuelEntry(prev => ({ ...prev, costPerLiter: Number(e.target.value) }))} className="w-full p-2 border border-slate-200 rounded-xl text-sm" placeholder="0.00" />
                </div>
              </div>
              {/* Auto-calc total */}
              {(standaloneFuelEntry.liters || 0) > 0 && (standaloneFuelEntry.costPerLiter || 0) > 0 && (
                <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <span className="text-xs font-bold text-blue-600 uppercase">Total Cost</span>
                  <span className="font-black text-blue-700 text-lg">Le {((standaloneFuelEntry.liters || 0) * (standaloneFuelEntry.costPerLiter || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              {/* Payment + Receipt */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Payment Method</label>
                  <SearchableSelect 
                    value={standaloneFuelEntry.paymentMethod || 'Fuel Card'} 
                    onChange={(v: any) => setStandaloneFuelEntry((prev: any) => ({ ...prev, paymentMethod: v as any }))} 
                    options={[
                      {value: 'Fuel Card', label: 'Fuel Card'},
                      {value: 'Voucher', label: 'Voucher'},
                      {value: 'Mobile Money', label: 'Mobile Money'},
                      {value: 'Cash', label: 'Cash'}
                    ]} 
                    placeholder="Payment Method" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Receipt / Ref #</label>
                  <div className="flex flex-col gap-2">
                    <input type="text" value={parseReceipt(standaloneFuelEntry.receiptNumber).text} onChange={e => {
                      const newText = e.target.value;
                      const existingUrl = parseReceipt(standaloneFuelEntry.receiptNumber).url;
                      setStandaloneFuelEntry(prev => ({ ...prev, receiptNumber: existingUrl ? `${newText}|URL:${existingUrl}` : newText }));
                    }} placeholder="e.g. REC-1234" className="w-full p-2 border border-slate-200 rounded-xl text-sm" />
                    <div className="relative w-full">
                      <input type="file" accept="image/*" onChange={e => setStandaloneFuelReceiptFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="w-full px-3 py-2 flex items-center justify-between border border-slate-200 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        {standaloneFuelReceiptFile ? (
                          <div className="flex items-center gap-2">
                            <img src={URL.createObjectURL(standaloneFuelReceiptFile)} alt="Preview" className="w-8 h-8 object-cover rounded shadow-sm" />
                            <span className="text-xs font-medium text-slate-600 truncate">{standaloneFuelReceiptFile.name}</span>
                          </div>
                        ) : parseReceipt(standaloneFuelEntry.receiptNumber).url ? (
                          <div className="flex items-center gap-2">
                            <img src={parseReceipt(standaloneFuelEntry.receiptNumber).url} alt="Existing" className="w-8 h-8 object-cover rounded shadow-sm" />
                            <span className="text-xs font-medium text-slate-600 truncate">Replace Image (Optional)</span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-600 truncate">Attach Receipt Image (Optional)</span>
                        )}
                        <Upload size={14} className="text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Partner Station */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="standalonePartner" checked={standaloneFuelEntry.isPartnerStation !== false} onChange={e => setStandaloneFuelEntry(prev => ({ ...prev, isPartnerStation: e.target.checked }))} className="w-4 h-4 rounded text-blue-600" />
                <label htmlFor="standalonePartner" className="text-sm font-bold text-slate-700 cursor-pointer">Partner Station</label>
              </div>
              {standaloneFuelEntry.isPartnerStation === false && (
                <div>
                  <label className="block text-xs font-bold text-amber-600 uppercase mb-1.5">⚠ Reason for Non-Partner Station</label>
                  <input type="text" value={standaloneFuelEntry.nonPartnerReason || ''} onChange={e => setStandaloneFuelEntry(prev => ({ ...prev, nonPartnerReason: e.target.value }))} placeholder="e.g. No partner station available in area" className="w-full p-2 border border-amber-300 bg-amber-50 rounded-xl text-sm" />
                </div>
              )}
              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Remarks</label>
                <input type="text" value={standaloneFuelEntry.remarks || ''} onChange={e => setStandaloneFuelEntry(prev => ({ ...prev, remarks: e.target.value }))} placeholder="Optional notes..." className="w-full p-2 border border-slate-200 rounded-xl text-sm" />
              </div>
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsStandaloneFuelModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button
                  type="button"
                  disabled={isUploadingFuel}
                  onClick={async () => {
                    if (!standaloneFuelDriverId || !standaloneFuelVehicleId) {
                      alert('Please select a driver and vehicle.');
                      return;
                    }
                    if (!standaloneFuelEntry.stationName || !(standaloneFuelEntry.liters || 0) || !(standaloneFuelEntry.costPerLiter || 0)) {
                      alert('Please fill in Station, Litres, and Cost per Litre.');
                      return;
                    }
                    if (standaloneFuelReceiptFile) {
                      setIsUploadingFuel(true);
                      const fileExt = standaloneFuelReceiptFile.name.split('.').pop();
                      const fileName = `fuel-receipt-${Date.now()}.${fileExt}`;
                      const { error: upErr } = await supabase.storage
                        .from('vehicle-documents')
                        .upload(`receipts/${fileName}`, standaloneFuelReceiptFile, { upsert: true });
                      
                      if (upErr) {
                        alert(`Receipt upload failed: ${upErr.message}`);
                        setIsUploadingFuel(false);
                        return;
                      }
                      
                      const { data: urlData } = supabase.storage.from('vehicle-documents').getPublicUrl(`receipts/${fileName}`);
                      const currentReceipt = standaloneFuelEntry.receiptNumber || '';
                      standaloneFuelEntry.receiptNumber = currentReceipt ? `${currentReceipt}|URL:${urlData.publicUrl}` : `URL:${urlData.publicUrl}`;
                      setIsUploadingFuel(false);
                    }

                    const entryId = standaloneFuelEntry.id || uuidv4();
                    const isEditing = logs.some(l => (l.fuelCollections || []).some(fc => fc.id === entryId));
                    const newEntry: FuelCollection = {
                      ...standaloneFuelEntry as FuelCollection,
                      id: entryId,
                      driverId: standaloneFuelDriverId,
                      vehicleId: standaloneFuelVehicleId,
                      tripLogId: standaloneFuelTripLogId || undefined,
                    };

                    // ── Persist to Supabase ──────────────────────────────
                    const buildFuelRow = (e: FuelCollection, logId?: string) => ({
                      id: e.id,
                      trip_log_id: logId || e.tripLogId || null,
                      driver_id: e.driverId || null,
                      vehicle_id: e.vehicleId || null,
                      station_name: e.stationName,
                      location: e.location || 'Juba',
                      date: e.date || new Date().toISOString().split('T')[0],
                      time: e.time || null,
                      supplier: e.supplier || null,
                      is_partner_station: e.isPartnerStation ?? true,
                      district: e.district || null,
                      liters: e.liters || 0,
                      cost_per_liter: e.costPerLiter || 0,
                      total_cost: e.totalAmount || (e.liters * e.costPerLiter) || null,
                      fuel_type: e.fuelType || null,
                      payment_method: e.paymentMethod || null,
                      receipt_number: e.receiptNumber || null,
                      notes: e.nonPartnerReason || null,
                      remarks: e.remarks || null,
                    });

                    if (isEditing) {
                      // Update in state
                      setLogs(prev => prev.map(l => ({
                        ...l,
                        fuelCollections: (l.fuelCollections || []).map(fc => fc.id === entryId ? newEntry : fc),
                      })));
                      setViewingFuelCollection(newEntry);
                      // Persist update to Supabase
                      supabase.from('fuel_collections').update(buildFuelRow(newEntry)).eq('id', entryId)
                        .then(({ error }) => { if (error) console.warn('[Fuel Update]', error.message); });
                    } else if (standaloneFuelTripLogId) {
                      setLogs(prev => prev.map(l => l.id === standaloneFuelTripLogId
                        ? { ...l, fuelCollections: [...(l.fuelCollections || []), newEntry] }
                        : l
                      ));
                      // Persist to Supabase linked to existing trip log
                      supabase.from('fuel_collections').insert(buildFuelRow(newEntry, standaloneFuelTripLogId))
                        .then(({ error }) => { if (error) console.warn('[Fuel Insert (linked)]', error.message); });
                    } else {
                      // Standalone entry — create a synthetic trip log + linked fuel_collection
                      const syntheticLogId = uuidv4();
                      const entryDate = newEntry.date || new Date().toISOString().split('T')[0];
                      const syntheticLog: TripLog = {
                        id: syntheticLogId,
                        date: entryDate,
                        driverId: standaloneFuelDriverId,
                        vehicleId: standaloneFuelVehicleId,
                        distanceTraveledKm: 0,
                        fuelConsumedLiters: newEntry.liters || 0,
                        fuelIssuedLiters: newEntry.liters || 0,
                        fuelCostPerLiter: newEntry.costPerLiter || 0,
                        incidents: 0, speedingEvents: 0, harshBraking: 0,
                        idlingTimeHours: 0, routeDeviations: 0, policyViolations: 0,
                        maintenanceIssuesLogged: false,
                        fuelCollections: [{ ...newEntry, tripLogId: syntheticLogId }],
                        notes: 'Standalone fuel entry',
                        approvalStatus: 'Pending',
                      };
                      _setLogs(prev => [syntheticLog, ...prev]); // Bypasses handleSupabaseSync to prevent race condition
                      // Persist: trip log first, then fuel collection
                      supabase.from('trip_logs').insert({
                        id: syntheticLogId,
                        date: entryDate,
                        driver_id: standaloneFuelDriverId,
                        vehicle_id: standaloneFuelVehicleId,
                        distance_traveled_km: 0,
                        fuel_consumed_liters: newEntry.liters || 0,
                        fuel_issued_liters: newEntry.liters || 0,
                        fuel_cost_per_liter: newEntry.costPerLiter || 0,
                        incidents: 0, speeding_events: 0, harsh_braking: 0,
                        idling_time_hours: 0, route_deviations: 0, policy_violations: 0,
                        maintenance_issues_logged: false,
                        notes: 'Standalone fuel entry',
                        approval_status: 'Pending',
                      }).then(({ error: logErr }) => {
                        if (logErr) { console.warn('[Fuel SyntheticLog Insert]', logErr.message); return; }
                        supabase.from('fuel_collections').insert(buildFuelRow({ ...newEntry, tripLogId: syntheticLogId }, syntheticLogId))
                          .then(({ error: fcErr }) => { if (fcErr) console.warn('[Fuel Insert (standalone)]', fcErr.message); });
                      });
                    }
                    setIsStandaloneFuelModalOpen(false);
                    // Switch to Fuel Logs subtab so admin can see the new entry
                    setFuelSubTab('fuel');
                  }}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploadingFuel ? <Loader2 size={14} className="animate-spin" /> : <Fuel size={14} />} 
                  {isUploadingFuel ? 'Uploading...' : 'Save Fuel Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Global Fuel Three-Dot Menu (fixed position, always on top) ── */}
      {openFuelMenuId && fuelMenuEntry && fuelMenuPos && (
        <>
          {/* Invisible backdrop to close menu on outside click */}
          <div
            className="fixed inset-0 z-[190]"
            onClick={() => { setOpenFuelMenuId(null); setFuelMenuEntry(null); setFuelMenuPos(null); }}
          />
          <div
            className="fixed z-[200] w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-1 animate-fade-in"
            style={{ top: fuelMenuPos.y, right: window.innerWidth - fuelMenuPos.x }}
          >
            <button
              onClick={() => { setViewingFuelCollection(fuelMenuEntry); setOpenFuelMenuId(null); setFuelMenuEntry(null); setFuelMenuPos(null); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            ><Eye size={14} className="text-blue-500" /> View Details</button>
            <button
              onClick={() => { setStandaloneFuelEntry({ ...fuelMenuEntry }); setStandaloneFuelDriverId(fuelMenuEntry.driverId || ''); setStandaloneFuelVehicleId(fuelMenuEntry.vehicleId || ''); setStandaloneFuelTripLogId(fuelMenuEntry.tripLogId || ''); setStandaloneFuelReceiptFile(null); setIsStandaloneFuelModalOpen(true); setOpenFuelMenuId(null); setFuelMenuEntry(null); setFuelMenuPos(null); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            ><Pencil size={14} className="text-amber-500" /> Edit Entry</button>
            <div className="border-t border-slate-100 my-1" />
            <button
              onClick={() => { setDeletingFuelCollection(fuelMenuEntry); setOpenFuelMenuId(null); setFuelMenuEntry(null); setFuelMenuPos(null); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            ><Trash2 size={14} /> Delete Entry</button>
          </div>
        </>
      )}

      {/* ── Delete Fuel Entry Confirmation ── */}
      {deletingFuelCollection && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-red-50">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0"><Trash2 size={18} className="text-red-600" /></div>
              <div>
                <h2 className="text-base font-black text-slate-900">Delete Fuel Entry?</h2>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-5">
                <p className="text-sm font-bold text-slate-800">{deletingFuelCollection.stationName || 'Unknown Station'}</p>
                <p className="text-xs text-slate-500 mt-1">{deletingFuelCollection.date} · {(deletingFuelCollection.liters || 0).toFixed(1)} L · Le {((deletingFuelCollection.liters || 0) * (deletingFuelCollection.costPerLiter || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-slate-500 mt-0.5">{drivers.find(d => d.id === deletingFuelCollection.driverId)?.name || '—'} · {vehicles.find(v => v.id === deletingFuelCollection.vehicleId)?.plateNumber || '—'}</p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingFuelCollection(null)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >Cancel</button>
                <button
                  onClick={() => {
                    const idToDelete = deletingFuelCollection.id;
                    // Find the parent log to detect synthetic logs that will become empty
                    const parentLog = logs.find(l => (l.fuelCollections || []).some(fc => fc.id === idToDelete));
                    const parentBecomesEmpty = parentLog && (parentLog.fuelCollections || []).length === 1;
                    const isSyntheticLog = parentLog?.id?.startsWith('log-');
                    setLogs(prev => prev
                      .map(l => ({
                        ...l,
                        fuelCollections: (l.fuelCollections || []).filter(fc => fc.id !== idToDelete),
                      }))
                      .filter(l => l.id !== parentLog?.id || !isSyntheticLog || !parentBecomesEmpty)
                    );
                    // Delete fuel_collection from Supabase
                    supabase.from('fuel_collections').delete().eq('id', idToDelete)
                      .then(({ error }) => { if (error) console.warn('[Fuel Delete]', error.message); });
                    // If the synthetic parent trip log becomes empty, delete it too
                    if (parentLog && isSyntheticLog && parentBecomesEmpty) {
                      supabase.from('trip_logs').delete().eq('id', parentLog.id)
                        .then(({ error }) => { if (error) console.warn('[Fuel SyntheticLog Delete]', error.message); });
                    }
                    setDeletingFuelCollection(null);
                    // If we were viewing the deleted entry, go back to list
                    if (viewingFuelCollection?.id === idToDelete) setViewingFuelCollection(null);
                  }}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                ><Trash2 size={14} /> Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAuditModalOpen && (
        <DriverAuditModal
          drivers={drivers}
          driverScores={driverScores}
          onClose={() => setIsAuditModalOpen(false)}
          onUpdateStatus={handleAuditStatusUpdate}
          onEditProfile={(d) => {
            setEditingDriver(d);
            setIsDriverModalOpen(true);
          }}
        />
      )}
    </div>
  );
};



