import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { MaintenanceRecord, SparesPurchase, SparesItem, Supplier, Vehicle, Driver } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit, Trash2, Search, Wrench, Store, Settings,
  Car, Calendar, DollarSign, FileText, ChevronDown, CheckCircle, XCircle,
  LayoutGrid, List, Download, ArrowUpDown, MoreVertical, Eye
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const MaintenanceSection: React.FC = () => { 
  const [activeTab, setActiveTab] = useState<'maintenance' | 'spares' | 'suppliers'>('maintenance');

  // Fleet Maintenance state (maintenance_records table)
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);

  // Spares & Parts state (spares_purchases + spares_items tables)
  const [sparesPurchases, setSparesPurchases] = useState<SparesPurchase[]>([]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Shared filter/sort/view state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'cost-desc' | 'cost-asc'>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Fleet Maintenance modal state
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);
  const [isMaintenanceViewOnly, setIsMaintenanceViewOnly] = useState(false);

  // Spares modal state
  const [showSparesModal, setShowSparesModal] = useState(false);
  const [editingSpares, setEditingSpares] = useState<SparesPurchase | null>(null);
  const [isSparesViewOnly, setIsSparesViewOnly] = useState(false);

  // Supplier modal state
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string;
    confirmText: string; confirmStyle: 'danger' | 'success'; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', confirmText: '', confirmStyle: 'danger', onConfirm: () => {} });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recordsRes, sparesRes, suppliersRes, vehiclesRes, driversRes] = await Promise.all([
        supabase.from('maintenance_records')
          .select('*, supplier:suppliers(*), vehicle:vehicles(*), driver:drivers(*), spares:maintenance_spares(*)')
          .order('created_at', { ascending: false }),
        supabase.from('spares_purchases')
          .select('*, vehicle:vehicles(*), supplier:suppliers(*), items:spares_items(*)')
          .order('created_at', { ascending: false }),
        supabase.from('suppliers').select('*').order('name'),
        supabase.from('vehicles').select('*').order('make_model'),
        supabase.from('drivers').select('*').order('name'),
      ]);
      if (recordsRes.data) setMaintenanceRecords(recordsRes.data);
      if (sparesRes.data) setSparesPurchases(sparesRes.data);
      if (suppliersRes.data) setSuppliers(suppliersRes.data);
      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (driversRes.data) setDrivers(driversRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Filtered & Sorted Maintenance Records ──────────────────────────────────

  const filteredMaintenanceRecords = maintenanceRecords.filter(record => {
    if (statusFilter !== 'All' && record.status !== statusFilter) return false;
    const recordDate = record.start_date || record.service_date || record.created_at?.split('T')[0];
    if (dateFrom && recordDate && recordDate < dateFrom) return false;
    if (dateTo && recordDate && recordDate > dateTo) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!record.vehicle?.make_model?.toLowerCase().includes(q) &&
          !record.vehicle?.plate_number?.toLowerCase().includes(q) &&
          !record.driver?.name?.toLowerCase().includes(q) &&
          !record.mechanic_or_shop?.toLowerCase().includes(q) &&
          !record.issues_found?.toLowerCase().includes(q) &&
          !record.notes?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime();
    if (sortBy === 'date-asc') return new Date(a.start_date || 0).getTime() - new Date(b.start_date || 0).getTime();
    if (sortBy === 'cost-desc') return (b.cost || 0) - (a.cost || 0);
    if (sortBy === 'cost-asc') return (a.cost || 0) - (b.cost || 0);
    return 0;
  });

  // ── Filtered & Sorted Spares Purchases ─────────────────────────────────────

  const filteredSparesPurchases = sparesPurchases.filter(purchase => {
    if (statusFilter !== 'All' && purchase.status !== statusFilter) return false;
    if (supplierFilter !== 'All' && purchase.supplier_id !== supplierFilter) return false;
    const purchaseDate = purchase.purchase_date || purchase.created_at?.split('T')[0];
    if (dateFrom && purchaseDate && purchaseDate < dateFrom) return false;
    if (dateTo && purchaseDate && purchaseDate > dateTo) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!purchase.vehicle?.make_model?.toLowerCase().includes(q) &&
          !purchase.vehicle?.plate_number?.toLowerCase().includes(q) &&
          !purchase.supplier?.name?.toLowerCase().includes(q) &&
          !purchase.items?.some(i => i.description.toLowerCase().includes(q)) &&
          !purchase.notes?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    const da = new Date(a.purchase_date || 0).getTime();
    const db = new Date(b.purchase_date || 0).getTime();
    if (sortBy === 'date-desc') return db - da;
    if (sortBy === 'date-asc') return da - db;
    if (sortBy === 'cost-desc') return (b.cost || 0) - (a.cost || 0);
    if (sortBy === 'cost-asc') return (a.cost || 0) - (b.cost || 0);
    return 0;
  });

  // ── PDF Exports ─────────────────────────────────────────────────────────────

  const exportMaintenancePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(30, 58, 138);
    doc.text('Fleet Maintenance Log Report', 14, 22);
    doc.setFontSize(10); doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    if (searchQuery || statusFilter !== 'All' || dateFrom || dateTo) {
      const dr = (dateFrom || dateTo) ? ` | Date: ${dateFrom || '...'} → ${dateTo || '...'}` : '';
      doc.text(`Filters — Status: ${statusFilter}${dr} | Search: "${searchQuery}"`, 14, 36);
    }
    const tableData = filteredMaintenanceRecords.map(r => [
      r.start_date || '-',
      r.vehicle ? `${r.vehicle.make_model} (${r.vehicle.plate_number})` : 'Unknown',
      r.driver?.name || '-',
      r.status || '-',
      r.mechanic_or_shop || '-',
      r.issues_found || '-',
      `Le ${(r.cost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    ]);
    const total = filteredMaintenanceRecords.reduce((s, r) => s + (r.cost || 0), 0);
    autoTable(doc, {
      startY: 42,
      head: [['Date', 'Vehicle', 'Driver', 'Status', 'Mechanic/Shop', 'Issue & Repairs', 'Labour Cost']],
      body: tableData, theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, styles: { fontSize: 8 },
      columnStyles: { 6: { halign: 'right' } },
      foot: [['', '', '', '', '', 'Grand Total:', `Le ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`]],
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
    });
    doc.save('Fleet_Maintenance_Log.pdf');
  };

  const exportSparesPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(30, 58, 138);
    doc.text('Maintenance & Spares Report', 14, 22);
    doc.setFontSize(10); doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    if (searchQuery || statusFilter !== 'All' || supplierFilter !== 'All' || dateFrom || dateTo) {
      const sn = supplierFilter !== 'All' ? suppliers.find(s => s.id === supplierFilter)?.name || supplierFilter : 'All';
      const dr = (dateFrom || dateTo) ? ` | Date: ${dateFrom || '...'} → ${dateTo || '...'}` : '';
      doc.text(`Filters — Status: ${statusFilter} | Supplier: ${sn}${dr} | Search: "${searchQuery}"`, 14, 36);
    }
    const tableData = filteredSparesPurchases.map(p => [
      p.purchase_date || '-',
      p.vehicle ? `${p.vehicle.make_model} (${p.vehicle.plate_number})` : 'Unknown',
      p.supplier?.name || '-',
      p.status || '-',
      p.items && p.items.length > 0 ? p.items.map(i => `${i.quantity}x ${i.description}`).join(', ') : '-',
      `Le ${(p.cost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    ]);
    const total = filteredSparesPurchases.reduce((s, p) => s + (p.cost || 0), 0);
    autoTable(doc, {
      startY: 42,
      head: [['Date', 'Vehicle', 'Supplier', 'Status', 'Spare Parts', 'Total Cost']],
      body: tableData, theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, styles: { fontSize: 8 },
      columnStyles: { 5: { halign: 'right' } },
      foot: [['', '', '', '', 'Grand Total:', `Le ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`]],
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
    });
    doc.save('Maintenance_Spares_Report.pdf');
  };

  // ── Handlers — Maintenance ──────────────────────────────────────────────────

  const handleDeleteMaintenance = (id: string) => {
    setConfirmModal({
      isOpen: true, title: 'Delete Maintenance Record',
      message: 'Are you sure you want to delete this maintenance record? This action cannot be undone.',
      confirmText: 'Delete Record', confirmStyle: 'danger',
      onConfirm: async () => {
        try {
          await supabase.from('maintenance_records').delete().eq('id', id);
          setMaintenanceRecords(prev => prev.filter(r => r.id !== id));
        } catch (error) { console.error(error); }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleMarkMaintenanceCompleted = (id: string) => {
    setConfirmModal({
      isOpen: true, title: 'Confirm Payment & Completion',
      message: 'Are you sure? Marking this as completed means the payment has been made.',
      confirmText: 'Mark Completed (Paid)', confirmStyle: 'success',
      onConfirm: async () => {
        try {
          await supabase.from('maintenance_records').update({ status: 'Completed' }).eq('id', id);
          setMaintenanceRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'Completed' } : r));
        } catch (error) { console.error(error); }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ── Handlers — Spares ──────────────────────────────────────────────────────

  const handleDeleteSpares = (id: string) => {
    setConfirmModal({
      isOpen: true, title: 'Delete Spares Record',
      message: 'Are you sure you want to delete this spares record? This action cannot be undone.',
      confirmText: 'Delete Record', confirmStyle: 'danger',
      onConfirm: async () => {
        try {
          await supabase.from('spares_purchases').delete().eq('id', id);
          setSparesPurchases(prev => prev.filter(p => p.id !== id));
        } catch (error) { console.error(error); }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleMarkSparesCompleted = (id: string) => {
    setConfirmModal({
      isOpen: true, title: 'Confirm Payment & Completion',
      message: 'Are you sure? Marking this as completed means the payment has been made to the supplier.',
      confirmText: 'Mark Completed (Paid)', confirmStyle: 'success',
      onConfirm: async () => {
        try {
          await supabase.from('spares_purchases').update({ status: 'Completed' }).eq('id', id);
          setSparesPurchases(prev => prev.map(p => p.id === id ? { ...p, status: 'Completed' } : p));
        } catch (error) { console.error(error); }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ── Handlers — Suppliers ───────────────────────────────────────────────────

  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await supabase.from('suppliers').delete().eq('id', id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (error) { console.error(error); }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────

  const totalMaintenanceCost = maintenanceRecords.reduce((s, r) => s + (r.cost || 0), 0);
  const totalSparesCost = sparesPurchases.reduce((s, p) => s + (p.cost || 0), 0);

  // ── Status badge helper ────────────────────────────────────────────────────

  const statusBadge = (status?: string) => {
    const cls = status === 'Completed' ? 'bg-emerald-100 text-emerald-700'
      : status === 'In Progress' ? 'bg-amber-100 text-amber-700'
      : 'bg-slate-100 text-slate-700';
    return <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cls}`}>{status || '—'}</span>;
  };

  // ── Shared Filter Bar ──────────────────────────────────────────────────────

  const FilterBar = ({ showSupplierFilter }: { showSupplierFilter: boolean }) => (
    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search vehicle, driver, supplier, parts..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none appearance-none cursor-pointer">
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          {showSupplierFilter && (
            <select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none appearance-none cursor-pointer">
              <option value="All">All Suppliers</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none appearance-none cursor-pointer">
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="cost-desc">Highest Cost</option>
            <option value="cost-asc">Lowest Cost</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Calendar size={14} /><span>From:</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <span>To:</span>
          <input type="date" value={dateTo} min={dateFrom} onChange={e => setDateTo(e.target.value)} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
        </div>
        {(searchQuery || statusFilter !== 'All' || supplierFilter !== 'All' || dateFrom || dateTo) && (
          <button onClick={() => { setSearchQuery(''); setStatusFilter('All'); setSupplierFilter('All'); setDateFrom(''); setDateTo(''); }}
            className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">
            Clear Filters
          </button>
        )}
        <div className="ml-auto flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={16} /></button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List size={16} /></button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Wrench size={40} className="text-blue-600" /></div>
          <div className="flex items-center gap-2 text-slate-500 mb-2"><div className="p-1.5 bg-blue-100 rounded-lg"><Wrench size={16} className="text-blue-600" /></div><h3 className="font-semibold text-xs uppercase tracking-wider">Maintenance Jobs</h3></div>
          <p className="text-3xl font-black text-slate-800">{maintenanceRecords.length}</p>
          <p className="text-xs text-slate-400 mt-1">Le {totalMaintenanceCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} total</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Settings size={40} className="text-blue-600" /></div>
          <div className="flex items-center gap-2 text-slate-500 mb-2"><div className="p-1.5 bg-blue-100 rounded-lg"><Settings size={16} className="text-blue-600" /></div><h3 className="font-semibold text-xs uppercase tracking-wider">Spares Purchases</h3></div>
          <p className="text-3xl font-black text-slate-800">{sparesPurchases.length}</p>
          <p className="text-xs text-slate-400 mt-1">Le {totalSparesCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} total</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg shadow-blue-500/20 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign size={40} /></div>
          <div className="flex items-center gap-2 text-blue-100 mb-2"><div className="p-1.5 bg-white/20 rounded-lg"><DollarSign size={16} className="text-white" /></div><h3 className="font-semibold text-xs uppercase tracking-wider">Total Expenses</h3></div>
          <p className="text-3xl font-black">Le {(totalMaintenanceCost + totalSparesCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-blue-200 mt-1">Maintenance + Spares combined</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Store size={40} className="text-emerald-600" /></div>
          <div className="flex items-center gap-2 text-slate-500 mb-2"><div className="p-1.5 bg-emerald-100 rounded-lg"><Store size={16} className="text-emerald-600" /></div><h3 className="font-semibold text-xs uppercase tracking-wider">Active Suppliers</h3></div>
          <p className="text-3xl font-black text-slate-800">{suppliers.length}</p>
          <p className="text-xs text-slate-400 mt-1">In the supplier directory</p>
        </motion.div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit gap-1">
        <button onClick={() => setActiveTab('maintenance')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'maintenance' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
          <Wrench size={16} /> Fleet Maintenance
        </button>
        <button onClick={() => setActiveTab('spares')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'spares' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
          <Settings size={16} /> Maintenance & Spares
        </button>
        <button onClick={() => setActiveTab('suppliers')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'suppliers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
          <Store size={16} /> Suppliers
        </button>
      </div>

      {/* ── Content Panel ── */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">

        {/* ── Fleet Maintenance Tab ── */}
        {activeTab === 'maintenance' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[650px]">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Wrench className="text-blue-500" /> Fleet Maintenance Log</h2>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={exportMaintenancePDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                  <Download size={16} className="text-blue-600" /> Export PDF
                </button>
                <button onClick={() => { setEditingMaintenance(null); setIsMaintenanceViewOnly(false); setShowMaintenanceModal(true); }}
                  className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-blue-500/20">
                  <Plus size={16} /> Log Maintenance
                </button>
              </div>
            </div>
            <FilterBar showSupplierFilter={false} />
            <div className="flex-1 overflow-auto">
              {filteredMaintenanceRecords.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                  <Search size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-semibold text-lg">No maintenance records found.</p>
                  <p className="text-sm">Try adjusting your filters.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredMaintenanceRecords.map(record => (
                    <div key={record.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"></div>
                      <div className="flex justify-between items-start mb-3">
                        {statusBadge(record.status)}
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Calendar size={12} /> {record.start_date || record.service_date || record.created_at?.split('T')[0]}</span>
                          {record.expected_completion_date && <span className="text-[10px] text-slate-400">↳ Ret: {record.expected_completion_date}</span>}
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5 mb-1">
                        <Car size={16} className="text-blue-500 shrink-0" /> {record.vehicle?.make_model || 'Unknown Vehicle'}
                      </h3>
                      {record.vehicle?.plate_number && <span className="text-[10px] font-mono text-slate-400 ml-5 bg-slate-100 px-1.5 py-0.5 rounded mb-1">{record.vehicle.plate_number}</span>}
                      {record.driver && <p className="text-sm text-slate-500 flex items-center gap-1.5 ml-5"><div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold">{record.driver.name.charAt(0)}</div> {record.driver.name}</p>}
                      {record.mechanic_or_shop && <p className="text-xs text-blue-600 mt-1 flex items-center gap-1.5"><Wrench size={11} className="shrink-0" /> {record.mechanic_or_shop}</p>}
                      <div className="bg-slate-50 rounded-xl p-3 my-3 flex-1 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Issue & Repairs</p>
                        <p className="text-xs text-slate-600 line-clamp-3">{record.issues_found || <span className="italic text-slate-400">None recorded</span>}</p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Labour Cost</span>
                          <span className="text-lg font-black text-slate-800">Le {(record.cost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                        <ActionsDropdown
                          recordStatus={record.status}
                          onView={() => { setEditingMaintenance(record); setIsMaintenanceViewOnly(true); setShowMaintenanceModal(true); }}
                          onEdit={() => { setEditingMaintenance(record); setIsMaintenanceViewOnly(false); setShowMaintenanceModal(true); }}
                          onMarkComplete={() => handleMarkMaintenanceCompleted(record.id)}
                          onDelete={() => handleDeleteMaintenance(record.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="w-full text-left border-collapse bg-white">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      {['Date', 'Vehicle & Driver', 'Mechanic/Shop', 'Status', 'Issue & Repairs', 'Labour Cost', 'Actions'].map(h => (
                        <th key={h} className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 last:text-center">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMaintenanceRecords.map(record => (
                      <tr key={record.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="py-4 px-5 text-sm text-slate-700 font-medium">
                          <div className="flex flex-col gap-0.5">
                            <span>{record.start_date || record.service_date || record.created_at?.split('T')[0]}</span>
                            {record.expected_completion_date && <span className="text-xs text-slate-400">↳ Ret: {record.expected_completion_date}</span>}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-sm">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5"><Car size={13} className="text-slate-400" /> {record.vehicle?.make_model || 'Unknown'}</span>
                          {record.driver && <span className="text-xs text-slate-500 pl-5">{record.driver.name}</span>}
                        </td>
                        <td className="py-4 px-5 text-sm text-slate-600">{record.mechanic_or_shop || '—'}</td>
                        <td className="py-4 px-5">{statusBadge(record.status)}</td>
                        <td className="py-4 px-5 text-sm text-slate-600 max-w-[220px]"><span className="line-clamp-2">{record.issues_found || '—'}</span></td>
                        <td className="py-4 px-5 text-sm text-right font-bold text-slate-800">Le {(record.cost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="py-4 px-5 text-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                            <ActionsDropdown
                              recordStatus={record.status}
                              onView={() => { setEditingMaintenance(record); setIsMaintenanceViewOnly(true); setShowMaintenanceModal(true); }}
                              onEdit={() => { setEditingMaintenance(record); setIsMaintenanceViewOnly(false); setShowMaintenanceModal(true); }}
                              onMarkComplete={() => handleMarkMaintenanceCompleted(record.id)}
                              onDelete={() => handleDeleteMaintenance(record.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Maintenance & Spares Tab ── */}
        {activeTab === 'spares' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[650px]">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Settings className="text-blue-500" /> Maintenance & Spares</h2>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={exportSparesPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                  <Download size={16} className="text-blue-600" /> Export PDF
                </button>
                <button onClick={() => { setEditingSpares(null); setIsSparesViewOnly(false); setShowSparesModal(true); }}
                  className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-blue-500/20">
                  <Plus size={16} /> Log Spares
                </button>
              </div>
            </div>
            <FilterBar showSupplierFilter={true} />
            <div className="flex-1 overflow-auto">
              {filteredSparesPurchases.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                  <Search size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-semibold text-lg">No spares records found.</p>
                  <p className="text-sm">Try adjusting your filters.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredSparesPurchases.map(purchase => (
                    <div key={purchase.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"></div>
                      <div className="flex justify-between items-start mb-3">
                        {statusBadge(purchase.status)}
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Calendar size={12} /> {purchase.purchase_date || purchase.created_at?.split('T')[0]}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5 mb-1">
                        <Car size={16} className="text-blue-500 shrink-0" /> {purchase.vehicle?.make_model || 'Unknown Vehicle'}
                      </h3>
                      {purchase.vehicle?.plate_number && <span className="text-[10px] font-mono text-slate-400 ml-5 bg-slate-100 px-1.5 py-0.5 rounded mb-1">{purchase.vehicle.plate_number}</span>}
                      {purchase.supplier && <p className="text-xs text-blue-600 mt-1 flex items-center gap-1.5"><Store size={11} className="shrink-0" /> {purchase.supplier.name}</p>}
                      <div className="bg-blue-50/50 rounded-xl p-3 my-3 flex-1 border border-blue-100">
                        <p className="text-xs font-semibold text-blue-700 mb-1.5 flex items-center gap-1"><Settings size={11} /> Spare Parts</p>
                        {purchase.items && purchase.items.length > 0 ? (
                          <ul className="space-y-1">
                            {purchase.items.map((item, i) => (
                              <li key={i} className="text-xs text-slate-600 flex justify-between bg-white px-2 py-1.5 rounded-lg border border-blue-100">
                                <span className="font-medium truncate pr-2">{item.description}</span>
                                <span className="text-slate-400 whitespace-nowrap font-mono">{item.quantity}x Le {Number(item.unit_cost).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                              </li>
                            ))}
                          </ul>
                        ) : <p className="text-xs text-slate-400 italic">No parts listed</p>}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Total Cost</span>
                          <span className="text-lg font-black text-slate-800">Le {(purchase.cost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                        <ActionsDropdown
                          recordStatus={purchase.status}
                          onView={() => { setEditingSpares(purchase); setIsSparesViewOnly(true); setShowSparesModal(true); }}
                          onEdit={() => { setEditingSpares(purchase); setIsSparesViewOnly(false); setShowSparesModal(true); }}
                          onMarkComplete={() => handleMarkSparesCompleted(purchase.id)}
                          onDelete={() => handleDeleteSpares(purchase.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="w-full text-left border-collapse bg-white">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      {['Date', 'Vehicle', 'Supplier', 'Status', 'Spare Parts', 'Total Cost', 'Actions'].map(h => (
                        <th key={h} className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 last:text-center">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSparesPurchases.map(purchase => (
                      <tr key={purchase.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="py-4 px-5 text-sm text-slate-700 font-medium">{purchase.purchase_date || purchase.created_at?.split('T')[0]}</td>
                        <td className="py-4 px-5 text-sm">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5"><Car size={13} className="text-slate-400" /> {purchase.vehicle?.make_model || 'Unknown'}</span>
                          {purchase.vehicle?.plate_number && <span className="text-xs text-slate-400 pl-5 font-mono">{purchase.vehicle.plate_number}</span>}
                        </td>
                        <td className="py-4 px-5 text-sm text-slate-600">{purchase.supplier?.name || '—'}</td>
                        <td className="py-4 px-5">{statusBadge(purchase.status)}</td>
                        <td className="py-4 px-5 text-sm text-slate-600 max-w-[220px]">
                          <div className="flex flex-col gap-0.5">
                            {purchase.items && purchase.items.length > 0
                              ? purchase.items.map((item, i) => <span key={i} className="truncate">• {item.description}</span>)
                              : <span className="text-slate-400">—</span>}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-sm text-right">
                          <span className="font-bold text-slate-800">Le {(purchase.cost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                          {purchase.items && purchase.items.length > 0 && (
                            <div className="flex flex-col items-end gap-0.5 mt-1 pt-1 border-t border-slate-100">
                              {purchase.items.map((item, i) => (
                                <span key={i} className="text-[10px] text-slate-400 font-mono">{item.quantity}x Le {Number(item.unit_cost).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                            <ActionsDropdown
                              recordStatus={purchase.status}
                              onView={() => { setEditingSpares(purchase); setIsSparesViewOnly(true); setShowSparesModal(true); }}
                              onEdit={() => { setEditingSpares(purchase); setIsSparesViewOnly(false); setShowSparesModal(true); }}
                              onMarkComplete={() => handleMarkSparesCompleted(purchase.id)}
                              onDelete={() => handleDeleteSpares(purchase.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Suppliers Tab ── */}
        {activeTab === 'suppliers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[650px]">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Store className="text-blue-500" /> Supplier Directory</h2>
              <button onClick={() => { setEditingSupplier(null); setShowSupplierModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-blue-500/20">
                <Plus size={16} /> Add Supplier
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {suppliers.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                  <Store size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-semibold text-lg">No suppliers yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
                  {suppliers.map(supplier => (
                    <motion.div key={supplier.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2.5 bg-blue-100 rounded-xl"><Store size={20} className="text-blue-600" /></div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingSupplier(supplier); setShowSupplierModal(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={14} /></button>
                          <button onClick={() => handleDeleteSupplier(supplier.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base mb-1">{supplier.name}</h3>
                      {supplier.contact_person && <p className="text-sm text-slate-500">{supplier.contact_person}</p>}
                      {supplier.phone && <p className="text-sm text-slate-500 mt-1">{supplier.phone}</p>}
                      {supplier.email && <p className="text-sm text-slate-500">{supplier.email}</p>}
                      {supplier.address && <p className="text-sm text-slate-500 mt-2 p-2 bg-slate-50 rounded-lg">{supplier.address}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showSupplierModal && (
          <SupplierFormModal supplier={editingSupplier} onClose={() => setShowSupplierModal(false)} onSaved={() => { setShowSupplierModal(false); fetchData(); }} />
        )}
        {showMaintenanceModal && (
          <MaintenanceLogModal
            record={editingMaintenance} isViewOnly={isMaintenanceViewOnly}
            vehicles={vehicles} drivers={drivers}
            onClose={() => setShowMaintenanceModal(false)}
            onSaved={() => { setShowMaintenanceModal(false); fetchData(); }}
          />
        )}
        {showSparesModal && (
          <SparesLogModal
            purchase={editingSpares} isViewOnly={isSparesViewOnly}
            vehicles={vehicles} suppliers={suppliers}
            onClose={() => setShowSparesModal(false)}
            onSaved={() => { setShowSparesModal(false); fetchData(); }}
          />
        )}
        {confirmModal.isOpen && (
          <ConfirmModal
            title={confirmModal.title} message={confirmModal.message}
            confirmText={confirmModal.confirmText} confirmStyle={confirmModal.confirmStyle}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SearchableSelect
// ─────────────────────────────────────────────────────────────────────────────

type SelectOption = { value: string; label: string };

const SearchableSelect = ({ value, onChange, options, placeholder, required = false, label }: {
  value: string; onChange: (val: string) => void; options: SelectOption[];
  placeholder: string; required?: boolean; label?: string;
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  const selected = options.find(o => o.value === value);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQuery(''); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1">{label}{required && ' *'}</label>}
      <button type="button" onClick={() => { setOpen(v => !v); setQuery(''); }}
        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg outline-none transition-all flex items-center justify-between text-sm text-left ${open ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'} ${!value ? 'text-slate-400' : 'text-slate-800'}`}>
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Type to search..." className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {!required && (
              <button type="button" onClick={() => { onChange(''); setOpen(false); setQuery(''); }}
                className={`w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-50 ${value === '' ? 'bg-blue-50 font-semibold text-blue-600' : ''}`}>
                {placeholder}
              </button>
            )}
            {filtered.length === 0
              ? <p className="px-4 py-3 text-sm text-slate-400 text-center">No results found</p>
              : filtered.map(o => (
                <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); setQuery(''); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 ${o.value === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}>
                  {o.label}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SupplierFormModal
// ─────────────────────────────────────────────────────────────────────────────

const SupplierFormModal = ({ supplier, onClose, onSaved }: { supplier: Supplier | null, onClose: () => void, onSaved: () => void }) => {
  const [formData, setFormData] = useState({ name: supplier?.name || '', contact_person: supplier?.contact_person || '', phone: supplier?.phone || '', email: supplier?.email || '', address: supplier?.address || '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    try {
      if (supplier) { await supabase.from('suppliers').update(formData).eq('id', supplier.id); }
      else { await supabase.from('suppliers').insert(formData); }
      onSaved();
    } catch (error) { console.error(error); alert('Failed to save supplier.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">{supplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"><XCircle size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Company / Supplier Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. AutoParts Inc." /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Contact Person</label>
            <input type="text" value={formData.contact_person} onChange={e => setFormData({ ...formData, contact_person: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. John Doe" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+1..." /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="contact@..." /></div>
          </div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
            <textarea rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 123 Main St, City, Country" /></div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 rounded-lg shadow-md shadow-blue-500/20">
              {isSaving ? 'Saving...' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MaintenanceLogModal — Fleet Maintenance (maintenance_records table)
// ─────────────────────────────────────────────────────────────────────────────

const MaintenanceLogModal = ({ record, isViewOnly, vehicles, drivers, onClose, onSaved }: {
  record: MaintenanceRecord | null; isViewOnly?: boolean;
  vehicles: Vehicle[]; drivers: Driver[]; onClose: () => void; onSaved: () => void;
}) => {
  const [formData, setFormData] = useState({
    vehicle_id: record?.vehicle_id || '',
    driver_id: record?.driver_id || '',
    start_date: record?.start_date || record?.service_date || new Date().toISOString().split('T')[0],
    expected_completion_date: record?.expected_completion_date || '',
    status: record?.status || 'Scheduled',
    issues_found: record?.issues_found || '',
    mechanic_or_shop: record?.mechanic_or_shop || '',
    mechanic_contact: record?.mechanic_contact || '',
    mechanic_address: record?.mechanic_address || '',
    labour_cost: record?.cost || '',
    notes: record?.notes || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    try {
      const payload = {
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id || null,
        start_date: formData.start_date,
        service_date: formData.start_date,
        expected_completion_date: formData.expected_completion_date || null,
        status: formData.status,
        issues_found: formData.issues_found || null,
        mechanic_or_shop: formData.mechanic_or_shop || null,
        mechanic_contact: formData.mechanic_contact || null,
        mechanic_address: formData.mechanic_address || null,
        cost: Number(formData.labour_cost) || 0,
        notes: formData.notes || null,
      };
      if (record) {
        await supabase.from('maintenance_records').update(payload).eq('id', record.id);
      } else {
        const { error } = await supabase.from('maintenance_records').insert(payload);
        if (error) throw error;
      }
      onSaved();
    } catch (error) { console.error(error); alert('Failed to save record.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-blue-600 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black text-white">{isViewOnly ? 'View Maintenance Record' : record ? 'Edit Maintenance Record' : 'Record Vehicle Maintenance'}</h2>
            <p className="text-blue-200 text-xs mt-0.5">Log maintenance records and repair costs.</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white bg-blue-500 hover:bg-blue-400 rounded-lg p-1.5 transition-colors"><XCircle size={18} /></button>
        </div>
        <form id="maintenance-form" onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <fieldset disabled={isViewOnly} className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <SearchableSelect label="VEHICLE" required value={formData.vehicle_id} onChange={val => setFormData({ ...formData, vehicle_id: val })}
                options={vehicles.map(v => ({ value: v.id, label: `${v.make_model} (${v.plate_number})` }))} placeholder="Select Vehicle" />
            </div>
            <div>
              <SearchableSelect label="DRIVER (OPTIONAL)" value={formData.driver_id} onChange={val => setFormData({ ...formData, driver_id: val })}
                options={drivers.map(d => ({ value: d.id, label: d.name }))} placeholder="Select Driver" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Status</label>
              <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white appearance-none">
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress (Out of Service)</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            {/* Empty div for layout if needed, or re-arrange. Actually let's put Start Date next to Status */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Start Date</label>
              <input required type="date" value={formData.start_date} onChange={e => {
                const d = e.target.value;
                setFormData(prev => ({ ...prev, start_date: d, expected_completion_date: (prev.expected_completion_date && prev.expected_completion_date < d) ? '' : prev.expected_completion_date }));
              }} className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Return Date</label>
              <input type="date" min={formData.start_date} value={formData.expected_completion_date} onChange={e => setFormData({ ...formData, expected_completion_date: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Total Cost (Le)</label>
              <input required type="number" step="1" min="0" value={formData.labour_cost}
                onChange={e => setFormData({ ...formData, labour_cost: e.target.value ? Number(e.target.value) : '' })}
                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono" placeholder="0" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Issues & Repairs Performed</label>
              <textarea rows={3} value={formData.issues_found} onChange={e => setFormData({ ...formData, issues_found: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                placeholder="e.g. Oil change, brakes replaced, scratched bumper fixed" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Mechanic / Shop Name</label>
              <input type="text" value={formData.mechanic_or_shop} onChange={e => setFormData({ ...formData, mechanic_or_shop: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Mechanic Contact</label>
              <input type="text" value={formData.mechanic_contact} onChange={e => setFormData({ ...formData, mechanic_contact: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Mechanic Address</label>
              <input type="text" value={formData.mechanic_address} onChange={e => setFormData({ ...formData, mechanic_address: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" />
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Additional Notes</label>
              <textarea rows={2} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white" placeholder="Any extra information..." />
            </div>
          </fieldset>
          
          <div className="col-span-2 flex justify-end mt-4 gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
              {isViewOnly ? 'Close' : 'Cancel'}
            </button>
            {!isViewOnly && (
              <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 disabled:opacity-70">
                {isSaving ? 'Saving...' : 'Save Record'}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SparesLogModal — Maintenance & Spares (spares_purchases + spares_items tables)
// ─────────────────────────────────────────────────────────────────────────────

const SparesLogModal = ({ purchase, isViewOnly, vehicles, suppliers, onClose, onSaved }: {
  purchase: SparesPurchase | null; isViewOnly?: boolean;
  vehicles: Vehicle[]; suppliers: Supplier[]; onClose: () => void; onSaved: () => void;
}) => {
  const [formData, setFormData] = useState({
    vehicle_id: purchase?.vehicle_id || '',
    supplier_id: purchase?.supplier_id || '',
    purchase_date: purchase?.purchase_date || new Date().toISOString().split('T')[0],
    status: purchase?.status || 'Completed',
    notes: purchase?.notes || '',
  });

  const [items, setItems] = useState<{ id?: string; description: string; quantity: number; unit_cost: number | '' }[]>(() => {
    if (purchase?.items && purchase.items.length > 0) return purchase.items.map(i => ({ ...i, unit_cost: i.unit_cost || '' }));
    return [{ description: '', quantity: 1, unit_cost: '' }];
  });

  const [isSaving, setIsSaving] = useState(false);

  const totalCost = items.reduce((sum, i) => sum + (Number(i.unit_cost) || 0) * (i.quantity || 1), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    try {
      const payload = {
        vehicle_id: formData.vehicle_id,
        supplier_id: formData.supplier_id || null,
        purchase_date: formData.purchase_date,
        status: formData.status,
        notes: formData.notes || null,
        cost: totalCost,
      };

      let purchaseId = purchase?.id;
      if (purchase) {
        await supabase.from('spares_purchases').update(payload).eq('id', purchase.id);
      } else {
        const { data, error } = await supabase.from('spares_purchases').insert(payload).select();
        if (error) throw error;
        purchaseId = data[0].id;
      }

      if (purchaseId) {
        await supabase.from('spares_items').delete().eq('spares_purchase_id', purchaseId);
        const validItems = items.filter(i => i.description.trim() !== '');
        if (validItems.length > 0) {
          const { error } = await supabase.from('spares_items').insert(
            validItems.map(i => ({ spares_purchase_id: purchaseId, description: i.description, quantity: i.quantity || 1, unit_cost: Number(i.unit_cost) || 0 }))
          );
          if (error) throw error;
        }
      }
      onSaved();
    } catch (error) { console.error(error); alert('Failed to save spares record.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings size={20} className="text-blue-500" />
            {isViewOnly ? 'View Spares Record' : purchase ? 'Edit Spares Record' : 'Log Maintenance & Spares'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"><XCircle size={20} /></button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto">
          <form id="spares-form" onSubmit={handleSubmit} className="space-y-5">
            <fieldset disabled={isViewOnly} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SearchableSelect label="Vehicle" required value={formData.vehicle_id} onChange={val => setFormData({ ...formData, vehicle_id: val })}
                  options={vehicles.map(v => ({ value: v.id, label: `${v.make_model} (${v.plate_number})` }))} placeholder="Select Vehicle..." />
                <SearchableSelect label="Supplier" value={formData.supplier_id} onChange={val => setFormData({ ...formData, supplier_id: val })}
                  options={suppliers.map(s => ({ value: s.id, label: s.name }))} placeholder="Select Supplier..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Purchase Date *</label>
                  <input required type="date" value={formData.purchase_date} onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status *</label>
                  <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                    <option value="Scheduled">Ordered / Pending</option>
                    <option value="In Progress">Partially Received</option>
                    <option value="Completed">Received & Paid</option>
                  </select>
                </div>
              </div>
              {/* Spare Parts Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-700">Spare Parts</label>
                  <button type="button" onClick={() => setItems([...items, { description: '', quantity: 1, unit_cost: '' }])}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={14} /> Add Part</button>
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100 relative group">
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-semibold text-blue-900 mb-1">Description *</label>
                      <input required type="text" value={item.description} onChange={e => { const n = [...items]; n[idx].description = e.target.value; setItems(n); }}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. Oil Filter" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-blue-900 mb-1">Qty *</label>
                      <input required type="number" min="1" value={item.quantity} onChange={e => { const n = [...items]; n[idx].quantity = parseInt(e.target.value) || 1; setItems(n); }}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-blue-900 mb-1">Unit Cost (Le)</label>
                      <input required type="number" step="1" min="0" value={item.unit_cost} onChange={e => { const n = [...items]; n[idx].unit_cost = e.target.value ? Number(e.target.value) : ''; setItems(n); }}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" placeholder="0" />
                    </div>
                    <div className="sm:col-span-2 flex items-end pb-2">
                      <div className="text-sm font-bold text-slate-700 w-full text-right">
                        Le {((Number(item.unit_cost) || 0) * (item.quantity || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-200"><XCircle size={14} /></button>
                    )}
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <div className="text-sm font-bold text-slate-800 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                    Total Parts Cost: <span className="font-mono text-blue-600 ml-2">Le {totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Additional Notes</label>
                <textarea rows={2} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Any extra information..." />
              </div>
            </fieldset>
          </form>
        </div>
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg">
            {isViewOnly ? 'Close' : 'Cancel'}
          </button>
          {!isViewOnly && (
            <button type="submit" form="spares-form" disabled={isSaving}
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 rounded-lg shadow-md shadow-blue-500/20">
              {isSaving ? 'Saving...' : purchase ? 'Save Changes' : 'Log Spares'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ActionsDropdown
// ─────────────────────────────────────────────────────────────────────────────

const ActionsDropdown = ({ recordStatus, onView, onEdit, onMarkComplete, onDelete }: {
  recordStatus?: string; onView: () => void; onEdit: () => void; onMarkComplete: () => void; onDelete: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({});

  const toggleOpen = (e: React.MouseEvent) => {
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      let top = rect.bottom + 4;
      const right = window.innerWidth - rect.right;
      if (top + 180 > window.innerHeight) top = rect.top - 184;
      setMenuStyles({ position: 'fixed', top: `${top}px`, right: `${right}px`, zIndex: 9999 });
    }
    setIsOpen(prev => !prev);
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    const scrollHandler = () => setIsOpen(false);
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler);
      window.addEventListener('scroll', scrollHandler, true);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', scrollHandler, true);
    };
  }, [isOpen]);

  return (
    <div ref={triggerRef} className="inline-block text-left">
      <button onClick={toggleOpen} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"><MoreVertical size={16} /></button>
      {isOpen && createPortal(
        <div ref={menuRef} style={menuStyles} className="w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 overflow-hidden">
          <button onClick={() => { setIsOpen(false); onView(); }} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"><Eye size={14} className="text-slate-400" /> View Record</button>
          <button onClick={() => { setIsOpen(false); onEdit(); }} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"><Edit size={14} className="text-slate-400" /> Edit Record</button>
          {recordStatus !== 'Completed' && (
            <button onClick={() => { setIsOpen(false); onMarkComplete(); }} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Mark Completed (Paid)</button>
          )}
          <div className="h-px bg-slate-100 my-1 mx-2"></div>
          <button onClick={() => { setIsOpen(false); onDelete(); }} className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} className="text-red-500" /> Delete Record</button>
        </div>,
        document.body
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ConfirmModal
// ─────────────────────────────────────────────────────────────────────────────

const ConfirmModal = ({ title, message, confirmText, confirmStyle, onConfirm, onCancel }: {
  title: string; message: string; confirmText: string; confirmStyle: 'danger' | 'success'; onConfirm: () => void; onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
      <div className={`p-5 sm:p-6 border-b border-slate-100 ${confirmStyle === 'danger' ? 'bg-red-50/50' : 'bg-emerald-50/50'}`}>
        <div className="flex items-center gap-3">
          {confirmStyle === 'danger'
            ? <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0"><Trash2 size={20} /></div>
            : <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full shrink-0"><CheckCircle size={20} /></div>}
          <h3 className="text-lg font-bold text-slate-800 leading-tight">{title}</h3>
        </div>
      </div>
      <div className="p-5 sm:p-6"><p className="text-sm text-slate-600 leading-relaxed">{message}</p></div>
      <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg">Cancel</button>
        <button type="button" onClick={onConfirm} className={`px-5 py-2 text-sm font-bold text-white rounded-lg shadow-md ${confirmStyle === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}>
          {confirmText}
        </button>
      </div>
    </motion.div>
  </div>
);
