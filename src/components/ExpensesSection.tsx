import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { Expense, DriverPayroll } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Search, Download, DollarSign, CheckCircle, Clock, XCircle,
  List, User, Car, FileText, Calendar, ChevronDown, Trash2, Edit,
  Wallet, TrendingUp, AlertCircle, MoreVertical, X, Eye
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SearchableSelect } from './SearchableSelect';

const EXPENSE_CATEGORIES = [
  'Driver Stipend',
  'Per Diem',
  'Fuel Advance',
  'Petty Cash',
  'Maintenance Payment',
  'Spare Parts Payment',
  'Other',
];

const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Bank Transfer'];

interface ExpensesSectionProps {
  userEmail: string;
  userRole?: string;
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({ userEmail, userRole }) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'payroll'>('expenses');

  // ── Data ──────────────────────────────────────────────────────────────────
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payrolls, setPayrolls] = useState<DriverPayroll[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const [vehicles, setVehicles] = useState<{ id: string; make_model: string; plate_number: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [payrollMonthFrom, setPayrollMonthFrom] = useState('');
  const [payrollMonthTo, setPayrollMonthTo] = useState('');
  const [payrollSearchQuery, setPayrollSearchQuery] = useState('');
  const [payrollStatusFilter, setPayrollStatusFilter] = useState('All');
  const [payrollSortBy, setPayrollSortBy] = useState('Net Pay (High to Low)');

  // ── Expense Modal ─────────────────────────────────────────────────────────
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Driver Stipend',
    amount: '',
    description: '',
    driver_id: '',
    vehicle_id: '',
    payment_method: 'Cash',
    expense_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);

  // ── Payroll Modal ─────────────────────────────────────────────────────────
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<DriverPayroll | null>(null);
  const [payrollForm, setPayrollForm] = useState({
    driver_id: '',
    month: new Date().toISOString().slice(0, 7),
    base_salary: '',
    allowances: '0',
    deductions: '0',
    payment_method: 'Mobile Money',
    notes: '',
  });
  const [payrollError, setPayrollError] = useState<string | null>(null);

  // ── Confirm Modal ─────────────────────────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string;
    confirmText: string; confirmStyle: 'danger' | 'success'; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', confirmText: '', confirmStyle: 'danger', onConfirm: () => {} });

  // ── Active action menu ────────────────────────────────────────────────────
  const [activeMenu, setActiveMenu] = useState<{ id: string, rect: DOMRect } | null>(null);

  useEffect(() => {
    const handleScroll = () => setActiveMenu(null);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [expRes, payRes, drRes, vhRes] = await Promise.all([
        supabase.from('expenses')
          .select('*, driver:drivers(id, name), vehicle:vehicles(id, make_model, plate_number)')
          .order('expense_date', { ascending: false }),
        supabase.from('driver_payroll')
          .select('*, driver:drivers(id, name)')
          .order('month', { ascending: false }),
        supabase.from('drivers').select('id, name').order('name'),
        supabase.from('vehicles').select('id, make_model, plate_number').order('make_model'),
      ]);
      if (expRes.data) setExpenses(expRes.data as Expense[]);
      if (payRes.data) setPayrolls(payRes.data as DriverPayroll[]);
      if (drRes.data) setDrivers(drRes.data);
      if (vhRes.data) setVehicles(vhRes.data);
    } catch (err) {
      console.error('Error fetching expenses data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Filtered expenses ─────────────────────────────────────────────────────
  const filteredExpenses = expenses.filter(e => {
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && e.category !== categoryFilter) return false;
    if (dateFrom && e.expense_date < dateFrom) return false;
    if (dateTo && e.expense_date > dateTo) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!e.category.toLowerCase().includes(q) &&
          !e.description?.toLowerCase().includes(q) &&
          !e.driver?.name?.toLowerCase().includes(q) &&
          !e.logged_by?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // ── Filtered payrolls ─────────────────────────────────────────────────────
  const filteredPayrolls = payrolls
    .filter(p => {
      if (payrollMonthFrom && p.month < payrollMonthFrom) return false;
      if (payrollMonthTo && p.month > payrollMonthTo) return false;
      if (payrollStatusFilter !== 'All' && p.status !== payrollStatusFilter) return false;
      if (payrollSearchQuery) {
        const q = payrollSearchQuery.toLowerCase();
        if (!p.driver?.name?.toLowerCase().includes(q) &&
            !p.notes?.toLowerCase().includes(q) &&
            !p.payment_method?.toLowerCase().includes(q) &&
            !p.logged_by?.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (payrollSortBy === 'Driver Name (A-Z)') return (a.driver?.name || '').localeCompare(b.driver?.name || '');
      if (payrollSortBy === 'Base Salary (High to Low)') return (b.base_salary || 0) - (a.base_salary || 0);
      if (payrollSortBy === 'Net Pay (High to Low)') return (b.net_pay || 0) - (a.net_pay || 0);
      return 0;
    });

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthExpenses = expenses.filter(e => e.expense_date.startsWith(currentMonth));
  const totalMonth = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const pendingCount = expenses.filter(e => e.status === 'Pending').length;
  const approvedCount = expenses.filter(e => e.status === 'Approved').length;
  const totalPayroll = filteredPayrolls.reduce((s, p) => s + (p.net_pay || 0), 0);

  // ── Expense handlers ──────────────────────────────────────────────────────
  const openAddExpense = () => {
    setIsViewOnly(false);
    setEditingExpense(null);
    setExpenseForm({
      category: 'Driver Stipend', amount: '', description: '',
      driver_id: '', vehicle_id: '', payment_method: 'Cash',
      expense_date: new Date().toISOString().split('T')[0], notes: '',
    });
    setShowExpenseModal(true);
  };

  const openEditExpense = (e: Expense) => {
    setIsViewOnly(false);
    setEditingExpense(e);
    setExpenseForm({
      category: e.category, amount: String(e.amount),
      description: e.description || '', driver_id: e.driver_id || '',
      vehicle_id: e.vehicle_id || '', payment_method: e.payment_method || 'Cash',
      expense_date: e.expense_date, notes: e.notes || '',
    });
    setShowExpenseModal(true);
  };

  const openViewExpense = (e: Expense) => {
    openEditExpense(e);
    setIsViewOnly(true);
  };

  const saveExpense = async () => {
    if (!expenseForm.category || !expenseForm.amount || !expenseForm.expense_date) return;
    setIsSaving(true);
    try {
      const isAutoApprove = userRole === 'super_admin' || userRole === 'admin';
      const payload: any = {
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description || null,
        driver_id: expenseForm.driver_id || null,
        vehicle_id: expenseForm.vehicle_id || null,
        payment_method: expenseForm.payment_method,
        expense_date: expenseForm.expense_date,
        notes: expenseForm.notes || null,
        logged_by: userEmail,
        status: isAutoApprove ? 'Approved' : 'Pending',
      };
      if (isAutoApprove) {
        payload.approved_by = userEmail;
      }
      if (editingExpense) {
        const { error } = await supabase.from('expenses').update(payload).eq('id', editingExpense.id);
        if (error) { alert(`Error updating expense: ${error.message}`); console.error(error); }
        else await fetchData();
      } else {
        const { error } = await supabase.from('expenses').insert(payload);
        if (error) { alert(`Error inserting expense: ${error.message}`); console.error(error); }
        else await fetchData();
      }
      setShowExpenseModal(false);
    } catch (err) { console.error(err); alert(`Catch Error: ${err}`); }
    finally { setIsSaving(false); }
  };

  const approveExpense = async (exp: Expense) => {
    const isAutoApprove = userRole === 'super_admin' || userRole === 'admin';
    if (!isAutoApprove && exp.logged_by === userEmail) return; // self-approval blocked for normal users
    const { error } = await supabase.from('expenses')
      .update({ status: 'Approved', approved_by: userEmail })
      .eq('id', exp.id);
    if (!error) setExpenses(prev => prev.map(e => e.id === exp.id ? { ...e, status: 'Approved', approved_by: userEmail } : e));
  };

  const markExpensePaid = async (exp: Expense) => {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('expenses')
      .update({ status: 'Paid', paid_date: today })
      .eq('id', exp.id);
    if (!error) setExpenses(prev => prev.map(e => e.id === exp.id ? { ...e, status: 'Paid', paid_date: today } : e));
  };

  const deleteExpense = (id: string) => {
    setConfirmModal({
      isOpen: true, title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense record? This cannot be undone.',
      confirmText: 'Delete', confirmStyle: 'danger',
      onConfirm: async () => {
        await supabase.from('expenses').delete().eq('id', id);
        setExpenses(prev => prev.filter(e => e.id !== id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ── Payroll handlers ──────────────────────────────────────────────────────
  const openAddPayroll = () => {
    setIsViewOnly(false);
    setEditingPayroll(null);
    setPayrollError(null);
    setPayrollForm({
      driver_id: '', month: new Date().toISOString().slice(0, 7),
      base_salary: '', allowances: '0', deductions: '0',
      payment_method: 'Mobile Money', notes: '',
    });
    setShowPayrollModal(true);
  };

  const openEditPayroll = (p: DriverPayroll) => {
    setIsViewOnly(false);
    setEditingPayroll(p);
    setPayrollError(null);
    setPayrollForm({
      driver_id: p.driver_id, month: p.month,
      base_salary: String(p.base_salary), allowances: String(p.allowances),
      deductions: String(p.deductions), payment_method: p.payment_method || 'Mobile Money',
      notes: p.notes || '',
    });
    setShowPayrollModal(true);
  };

  const openViewPayroll = (p: DriverPayroll) => {
    openEditPayroll(p);
    setIsViewOnly(true);
  };

  const savePayroll = async () => {
    if (!payrollForm.driver_id || !payrollForm.base_salary) return;
    
    // Prevent duplicate driver payroll in the same month
    const isDuplicate = payrolls.some(p => 
      p.driver_id === payrollForm.driver_id && 
      p.month === payrollForm.month && 
      p.id !== editingPayroll?.id
    );
    
    if (isDuplicate) {
      setPayrollError('A payroll record already exists for this driver in the selected month.');
      return;
    }

    setIsSaving(true);
    try {
      const isAutoApprove = userRole === 'super_admin' || userRole === 'admin';
      const payload: any = {
        driver_id: payrollForm.driver_id,
        month: payrollForm.month,
        base_salary: parseFloat(payrollForm.base_salary),
        allowances: parseFloat(payrollForm.allowances) || 0,
        deductions: parseFloat(payrollForm.deductions) || 0,
        payment_method: payrollForm.payment_method,
        notes: payrollForm.notes || null,
        logged_by: userEmail,
        status: isAutoApprove ? 'Approved' : 'Pending',
      };
      if (isAutoApprove) {
        payload.approved_by = userEmail;
      }
      if (editingPayroll) {
        const { error } = await supabase.from('driver_payroll').update(payload).eq('id', editingPayroll.id);
        if (error) { alert(`Error updating payroll: ${error.message}`); console.error(error); }
        else await fetchData();
      } else {
        const { error } = await supabase.from('driver_payroll').insert(payload);
        if (error) { alert(`Error inserting payroll: ${error.message}`); console.error(error); }
        else await fetchData();
      }
      setShowPayrollModal(false);
    } catch (err) { console.error(err); alert(`Catch Error: ${err}`); }
    finally { setIsSaving(false); }
  };

  const approvePayroll = async (p: DriverPayroll) => {
    const isAutoApprove = userRole === 'super_admin' || userRole === 'admin';
    if (!isAutoApprove && p.logged_by === userEmail) return; // self-approval blocked for normal users
    const { error } = await supabase.from('driver_payroll')
      .update({ status: 'Approved', approved_by: userEmail })
      .eq('id', p.id);
    if (!error) setPayrolls(prev => prev.map(pr => pr.id === p.id ? { ...pr, status: 'Approved', approved_by: userEmail } : pr));
  };

  const markPayrollPaid = async (p: DriverPayroll) => {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('driver_payroll')
      .update({ status: 'Paid', paid_date: today })
      .eq('id', p.id);
    if (!error) setPayrolls(prev => prev.map(pr => pr.id === p.id ? { ...pr, status: 'Paid', paid_date: today } : pr));
  };

  const deletePayroll = (id: string) => {
    setConfirmModal({
      isOpen: true, title: 'Delete Payroll Record',
      message: 'Are you sure you want to delete this payroll entry?',
      confirmText: 'Delete', confirmStyle: 'danger',
      onConfirm: async () => {
        await supabase.from('driver_payroll').delete().eq('id', id);
        setPayrolls(prev => prev.filter(p => p.id !== id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ── PDF Exports ───────────────────────────────────────────────────────────
  const exportExpensesPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const today = new Date().toLocaleDateString('en-GB');
    doc.setFontSize(16); doc.setTextColor(30, 58, 138);
    doc.text('BIG — Expenses Report', 14, 16);
    doc.setFontSize(9); doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${today}  |  ${filteredExpenses.length} records  |  Total: Le ${filteredExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 14, 23);
    autoTable(doc, {
      startY: 28,
      head: [['Date', 'Category', 'Description', 'Driver', 'Amount (Le)', 'Payment', 'Status', 'Logged By', 'Approved By']],
      body: filteredExpenses.map(e => [
        e.expense_date, e.category, e.description || '-',
        e.driver?.name || '-',
        e.amount.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        e.payment_method || '-', e.status, e.logged_by || '-', e.approved_by || '-',
      ]),
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      bodyStyles: { fontSize: 7, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      margin: { left: 14, right: 14 },
    });
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7); doc.setTextColor(150);
      doc.text(`BIG Fleet Management — Confidential   |   Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 6);
    }
    doc.save(`BIG_Expenses_${today.replace(/\//g, '-')}.pdf`);
  };

  const exportPayrollPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const today = new Date().toLocaleDateString('en-GB');
    doc.setFontSize(16); doc.setTextColor(30, 58, 138);
    doc.text(`BIG — Driver Payroll: ${payrollMonthFrom && payrollMonthTo ? `${payrollMonthFrom} to ${payrollMonthTo}` : payrollMonthFrom || payrollMonthTo || 'All Time'}`, 14, 16);
    doc.setFontSize(9); doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${today}  |  ${filteredPayrolls.length} drivers  |  Total Net Pay: Le ${totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 14, 23);
    autoTable(doc, {
      startY: 28,
      head: [['Driver', 'Base Salary', 'Allowances', 'Deductions', 'Net Pay (Le)', 'Payment Method', 'Status', 'Logged By', 'Approved By']],
      body: filteredPayrolls.map(p => [
        p.driver?.name || '-',
        (p.base_salary || 0).toLocaleString(undefined, { maximumFractionDigits: 0 }),
        (p.allowances || 0).toLocaleString(undefined, { maximumFractionDigits: 0 }),
        (p.deductions || 0).toLocaleString(undefined, { maximumFractionDigits: 0 }),
        (p.net_pay || 0).toLocaleString(undefined, { maximumFractionDigits: 0 }),
        p.payment_method || '-', p.status, p.logged_by || '-', p.approved_by || '-',
      ]),
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      foot: [['TOTAL', '', '', '', totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 }), '', '', '', '']],
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
    });
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7); doc.setTextColor(150);
      doc.text(`BIG Fleet Management — Confidential   |   Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 6);
    }
    doc.save(`BIG_Payroll_Export.pdf`);
  };

  // ── Status badge ──────────────────────────────────────────────────────────
  const statusBadge = (status: string) => {
    const cls = status === 'Paid'
      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      : status === 'Approved'
      ? 'bg-blue-100 text-blue-700 border border-blue-200'
      : 'bg-amber-100 text-amber-700 border border-amber-200';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${cls}`}>
        {status === 'Paid' ? <CheckCircle size={10} /> : status === 'Approved' ? <CheckCircle size={10} /> : <Clock size={10} />}
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Loading expenses data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Expenses & Payroll</h2>
          <p className="text-slate-500 text-sm mt-0.5">Finance-controlled payments, stipends and monthly driver payroll</p>
        </div>
        <button
          onClick={activeTab === 'expenses' ? openAddExpense : openAddPayroll}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} />
          {activeTab === 'expenses' ? 'Record Expense' : 'Add Payroll Entry'}
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'This Month', value: `Le ${totalMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'bg-blue-50 text-blue-600', badge: '' },
          { label: 'Pending', value: pendingCount, icon: Clock, color: 'bg-amber-50 text-amber-600', badge: pendingCount > 0 ? '!' : '' },
          { label: 'Approved', value: approvedCount, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600', badge: '' },
          { label: `Payroll (${payrollMonthFrom && payrollMonthTo ? `${payrollMonthFrom} to ${payrollMonthTo}` : payrollMonthFrom || payrollMonthTo || 'All Time'})`, value: `Le ${totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Wallet, color: 'bg-slate-50 text-slate-600', badge: '' },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className={`inline-flex p-2 rounded-xl mb-3 ${kpi.color}`}>
              <kpi.icon size={18} />
            </div>
            <p className="text-2xl font-black text-slate-950">{kpi.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-2 bg-slate-100/80 p-2 rounded-2xl w-fit border border-slate-200/60 shadow-inner">
        {[
          { id: 'expenses', label: 'Expenses Log', icon: FileText },
          { id: 'payroll', label: 'Driver Payroll', icon: Wallet },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
                isActive ? 'bg-white text-blue-700 shadow-md ring-1 ring-slate-900/5 scale-[1.02]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}>
              <Icon size={15} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Expenses Log Tab ── */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search expenses…"
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-48 transition-all" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700">
                <option value="All">All Statuses</option>
                <option>Pending</option><option>Approved</option><option>Paid</option>
              </select>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700">
                <option value="All">All Categories</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700" />
              <span className="text-slate-400 text-xs">→</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700" />
            </div>
            <button onClick={exportExpensesPDF}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap">
              <Download size={15} className="text-blue-600" /> Export PDF
            </button>
          </div>

          {/* Table */}
          {filteredExpenses.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <DollarSign size={40} className="mb-3 opacity-20" />
              <p className="font-semibold">No expenses found</p>
              <p className="text-sm">Adjust filters or add a new expense.</p>
            </div>
          ) : (
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Description</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Driver</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Amount</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Logged By</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Approved By</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((exp, index) => (
                    <tr key={exp.id} onClick={() => openViewExpense(exp)} className="hover:bg-slate-50/60 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5 text-slate-700 font-medium whitespace-nowrap">{exp.expense_date}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-[200px] truncate">{exp.description || <span className="italic text-slate-400">—</span>}</td>
                      <td className="px-5 py-3.5 text-slate-700">{exp.driver?.name || <span className="italic text-slate-400">—</span>}</td>
                      <td className="px-5 py-3.5 text-right font-black text-slate-950">Le {exp.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-5 py-3.5">{statusBadge(exp.status)}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{exp.logged_by || '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{exp.approved_by || <span className="italic text-slate-400">—</span>}</td>
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          <button onClick={(e) => setActiveMenu(activeMenu?.id === exp.id ? null : { id: exp.id, rect: e.currentTarget.getBoundingClientRect() })}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical size={15} />
                          </button>
                          {activeMenu?.id === exp.id && createPortal(
                            <>
                              <div className="fixed inset-0 z-[998]" onClick={() => setActiveMenu(null)} />
                              <div className="fixed w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-[999] overflow-hidden"
                                style={{
                                  left: activeMenu.rect.right - 176,
                                  ...(window.innerHeight - activeMenu.rect.bottom < 200 
                                       ? { bottom: window.innerHeight - activeMenu.rect.top + 4 }
                                       : { top: activeMenu.rect.bottom + 4 })
                                }}>
                                <button onClick={() => { setActiveMenu(null); openViewExpense(exp); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                  <Eye size={14} /> View Details
                                </button>
                                <button onClick={() => { setActiveMenu(null); openEditExpense(exp); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                  <Edit size={14} /> Edit
                                </button>
                                {exp.status === 'Pending' && (userRole === 'super_admin' || userRole === 'admin' || exp.logged_by !== userEmail) && (
                                  <button onClick={() => { setActiveMenu(null); approveExpense(exp); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
                                    <CheckCircle size={14} /> Approve
                                  </button>
                                )}
                                {exp.status === 'Pending' && (userRole !== 'super_admin' && userRole !== 'admin' && exp.logged_by === userEmail) && (
                                  <div className="px-4 py-2 text-xs text-slate-400 italic flex items-center gap-1">
                                    <AlertCircle size={11} /> Self-approval not allowed
                                  </div>
                                )}
                                {exp.status === 'Approved' && (
                                  <button onClick={() => { setActiveMenu(null); markExpensePaid(exp); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50">
                                    <CheckCircle size={14} /> Mark as Paid
                                  </button>
                                )}
                                <div className="h-px bg-slate-100 my-1" />
                                <button onClick={() => { setActiveMenu(null); deleteExpense(exp.id); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>, document.body
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50/80">
                    <td colSpan={4} className="px-5 py-3 text-sm font-bold text-slate-700">
                      {filteredExpenses.length} record{filteredExpenses.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3 text-right font-black text-blue-700">
                      Le {filteredExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td colSpan={4} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Driver Payroll Tab ── */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={payrollSearchQuery} onChange={e => setPayrollSearchQuery(e.target.value)}
                  placeholder="Search payrolls…"
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-48 transition-all" />
              </div>
              <select value={payrollStatusFilter} onChange={e => setPayrollStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700">
                <option value="All">All Statuses</option>
                <option>Pending</option><option>Approved</option><option>Paid</option>
              </select>
              <select value={payrollSortBy} onChange={e => setPayrollSortBy(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-700">
                <option>Net Pay (High to Low)</option>
                <option>Base Salary (High to Low)</option>
                <option>Driver Name (A-Z)</option>
              </select>
              <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
                <input type="month" value={payrollMonthFrom} onChange={e => setPayrollMonthFrom(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20" />
                <span className="text-slate-400 text-xs">→</span>
                <input type="month" value={payrollMonthTo} onChange={e => setPayrollMonthTo(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg font-medium ml-1">
                {filteredPayrolls.length} entries · Le {totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <button onClick={exportPayrollPDF}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap">
              <Download size={15} className="text-blue-600" /> Export PDF
            </button>
          </div>

          {/* Payroll Table */}
          {filteredPayrolls.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <Wallet size={40} className="mb-3 opacity-20" />
              <p className="font-semibold">No payroll records match your search criteria</p>
              <p className="text-sm">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Month</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Driver</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Base Salary</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Allowances</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Deductions</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Net Pay</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Payment</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Logged By</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Approved By</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayrolls.map((p, index) => (
                    <tr key={p.id} onClick={() => openViewPayroll(p)} className="hover:bg-slate-50/60 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5 text-slate-700 font-bold whitespace-nowrap">{p.month}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-black">
                            {p.driver?.name?.charAt(0) || '?'}
                          </div>
                          {p.driver?.name || '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-700">Le {(p.base_salary || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-5 py-3.5 text-right text-emerald-600">+ Le {(p.allowances || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-5 py-3.5 text-right text-red-500">- Le {(p.deductions || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-5 py-3.5 text-right font-black text-slate-950">Le {(p.net_pay || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">{p.payment_method || '—'}</td>
                      <td className="px-5 py-3.5">{statusBadge(p.status)}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{p.logged_by || '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{p.approved_by || <span className="italic text-slate-400">—</span>}</td>
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          <button onClick={(e) => setActiveMenu(activeMenu?.id === p.id ? null : { id: p.id, rect: e.currentTarget.getBoundingClientRect() })}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical size={15} />
                          </button>
                          {activeMenu?.id === p.id && createPortal(
                            <>
                              <div className="fixed inset-0 z-[998]" onClick={() => setActiveMenu(null)} />
                              <div className="fixed w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-[999] overflow-hidden"
                                style={{
                                  left: activeMenu.rect.right - 176,
                                  ...(window.innerHeight - activeMenu.rect.bottom < 200 
                                       ? { bottom: window.innerHeight - activeMenu.rect.top + 4 }
                                       : { top: activeMenu.rect.bottom + 4 })
                                }}>
                                <button onClick={() => { setActiveMenu(null); openViewPayroll(p); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                  <Eye size={14} /> View Details
                                </button>
                                <button onClick={() => { setActiveMenu(null); openEditPayroll(p); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                  <Edit size={14} /> Edit
                                </button>
                                {p.status === 'Pending' && (userRole === 'super_admin' || userRole === 'admin' || p.logged_by !== userEmail) && (
                                  <button onClick={() => { setActiveMenu(null); approvePayroll(p); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50">
                                    <CheckCircle size={14} /> Approve
                                  </button>
                                )}
                                {p.status === 'Pending' && (userRole !== 'super_admin' && userRole !== 'admin' && p.logged_by === userEmail) && (
                                  <div className="px-4 py-2 text-xs text-slate-400 italic flex items-center gap-1">
                                    <AlertCircle size={11} /> Self-approval not allowed
                                  </div>
                                )}
                                {p.status === 'Approved' && (
                                  <button onClick={() => { setActiveMenu(null); markPayrollPaid(p); }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50">
                                    <CheckCircle size={14} /> Mark as Paid
                                  </button>
                                )}
                                <div className="h-px bg-slate-100 my-1" />
                                <button onClick={() => { setActiveMenu(null); deletePayroll(p.id); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>, document.body
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50/80">
                    <td colSpan={5} className="px-5 py-3 text-sm font-bold text-slate-700">
                      {filteredPayrolls.length} record{filteredPayrolls.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-600">Le {filteredPayrolls.reduce((s, p) => s + p.base_salary, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-5 py-3 text-right font-bold text-emerald-600">+ Le {filteredPayrolls.reduce((s, p) => s + p.allowances, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-5 py-3 text-right font-bold text-red-500">- Le {filteredPayrolls.reduce((s, p) => s + p.deductions, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-5 py-3 text-right font-black text-blue-700">Le {totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td colSpan={5} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Add/Edit Expense Modal ── */}
      {showExpenseModal && createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-blue-600 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black text-white">{isViewOnly ? 'View Expense' : editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
                <p className="text-blue-200 text-xs mt-0.5">Logged by: {userEmail}</p>
              </div>
              <button onClick={() => setShowExpenseModal(false)} className="text-blue-200 hover:text-white bg-blue-500 hover:bg-blue-400 rounded-lg p-1.5 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Category *</label>
                  <SearchableSelect
                    value={expenseForm.category}
                    onChange={val => setExpenseForm({ ...expenseForm, category: val })}
                    options={EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))}
                    disabled={isViewOnly}
                    placeholder="Select category..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Amount (Le) *</label>
                  <input type="number" min="0" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    disabled={isViewOnly}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Description</label>
                <input type="text" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  disabled={isViewOnly}
                  placeholder="Brief description of the expense"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Driver (Optional)</label>
                  <SearchableSelect
                    value={expenseForm.driver_id}
                    onChange={val => setExpenseForm({ ...expenseForm, driver_id: val })}
                    options={[{ value: '', label: '— None —' }, ...drivers.map(d => ({ value: d.id, label: d.name }))]}
                    disabled={isViewOnly}
                    placeholder="Select driver..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Vehicle (Optional)</label>
                  <SearchableSelect
                    value={expenseForm.vehicle_id}
                    onChange={val => setExpenseForm({ ...expenseForm, vehicle_id: val })}
                    options={[{ value: '', label: '— None —' }, ...vehicles.map(v => ({ value: v.id, label: `${v.make_model} (${v.plate_number})` }))]}
                    disabled={isViewOnly}
                    placeholder="Select vehicle..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Payment Method *</label>
                  <SearchableSelect
                    value={expenseForm.payment_method}
                    onChange={val => setExpenseForm({ ...expenseForm, payment_method: val })}
                    options={PAYMENT_METHODS.map(m => ({ value: m, label: m }))}
                    disabled={isViewOnly}
                    placeholder="Select payment method..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Expense Date *</label>
                  <input type="date" value={expenseForm.expense_date} onChange={e => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                    disabled={isViewOnly}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea rows={2} value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  disabled={isViewOnly}
                  placeholder="Any additional notes…"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => setShowExpenseModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                {isViewOnly ? 'Close' : 'Cancel'}
              </button>
              {!isViewOnly && (
                <button onClick={saveExpense} disabled={isSaving || !expenseForm.amount || !expenseForm.expense_date}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors shadow-sm">
                  {isSaving ? 'Saving…' : editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              )}
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* ── Add/Edit Payroll Modal ── */}
      {showPayrollModal && createPortal(
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-blue-600 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black text-white">{isViewOnly ? 'View Payroll Entry' : editingPayroll ? 'Edit Payroll Entry' : 'Add Payroll Entry'}</h2>
                <p className="text-blue-200 text-xs mt-0.5">Logged by: {userEmail}</p>
              </div>
              <button onClick={() => setShowPayrollModal(false)} className="text-blue-200 hover:text-white bg-blue-500 hover:bg-blue-400 rounded-lg p-1.5 transition-colors"><X size={18} /></button>
            </div>
            {payrollError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 text-red-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span className="text-sm font-medium">{payrollError}</span>
              </div>
            )}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Driver *</label>
                  <SearchableSelect
                    value={payrollForm.driver_id}
                    onChange={val => { setPayrollForm({ ...payrollForm, driver_id: val }); setPayrollError(null); }}
                    options={[{ value: '', label: 'Select driver…' }, ...drivers.map(d => ({ value: d.id, label: d.name }))]}
                    disabled={isViewOnly}
                    placeholder="Select driver..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Month *</label>
                  <input type="month" value={payrollForm.month} onChange={e => { setPayrollForm({ ...payrollForm, month: e.target.value }); setPayrollError(null); }}
                    disabled={isViewOnly}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Base Salary (Le) *</label>
                  <input type="number" min="0" value={payrollForm.base_salary} onChange={e => setPayrollForm({ ...payrollForm, base_salary: e.target.value })}
                    disabled={isViewOnly}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Allowances (Le)</label>
                  <input type="number" min="0" value={payrollForm.allowances} onChange={e => setPayrollForm({ ...payrollForm, allowances: e.target.value })}
                    disabled={isViewOnly}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-red-500 uppercase tracking-wider mb-1.5">Deductions (Le)</label>
                  <input type="number" min="0" value={payrollForm.deductions} onChange={e => setPayrollForm({ ...payrollForm, deductions: e.target.value })}
                    disabled={isViewOnly}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-red-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 outline-none font-mono" />
                </div>
              </div>
              {/* Net Pay Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex justify-between items-center">
                <span className="text-sm font-bold text-blue-800">Calculated Net Pay:</span>
                <span className="text-lg font-black text-blue-700 font-mono">
                  Le {(
                    (parseFloat(payrollForm.base_salary) || 0) +
                    (parseFloat(payrollForm.allowances) || 0) -
                    (parseFloat(payrollForm.deductions) || 0)
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Payment Method</label>
                  <SearchableSelect
                    value={payrollForm.payment_method}
                    onChange={val => setPayrollForm({ ...payrollForm, payment_method: val })}
                    options={PAYMENT_METHODS.map(m => ({ value: m, label: m }))}
                    disabled={isViewOnly}
                    placeholder="Select payment method..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Notes</label>
                  <input type="text" value={payrollForm.notes} onChange={e => setPayrollForm({ ...payrollForm, notes: e.target.value })}
                    disabled={isViewOnly}
                    placeholder="Optional note"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => setShowPayrollModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                {isViewOnly ? 'Close' : 'Cancel'}
              </button>
              {!isViewOnly && (
                <button onClick={savePayroll} disabled={isSaving || !payrollForm.driver_id || !payrollForm.base_salary}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors shadow-sm">
                  {isSaving ? 'Saving…' : editingPayroll ? 'Update Entry' : 'Save Entry'}
                </button>
              )}
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* ── Confirm Modal ── */}
      {createPortal(
        <AnimatePresence>
          {confirmModal.isOpen && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <AlertCircle size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950">{confirmModal.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{confirmModal.message}</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button onClick={confirmModal.onConfirm}
                    className={`px-5 py-2 text-sm font-bold text-white rounded-xl transition-colors ${
                      confirmModal.confirmStyle === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}>
                    {confirmModal.confirmText}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
