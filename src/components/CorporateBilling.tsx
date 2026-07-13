import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, FileText, CheckCircle, Download, Plus, Mail, PenTool, X, AlertTriangle, Loader2 } from 'lucide-react';

export interface CorporateAccount {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingType: 'Per Day' | 'Monthly Retainer';
  rate: number;
  status: 'Active' | 'Inactive';
}

export interface Invoice {
  id: string;
  accountId: string;
  date: string;
  period: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  tripCount?: number;
}

export const mockAccounts: CorporateAccount[] = [
  { id: 'c1', name: 'Global Health NGO', contactPerson: 'Sarah Jenkins', email: 'billing@globalhealth.org', phone: '+232 77 123 456', billingType: 'Per Day', rate: 150, status: 'Active' },
  { id: 'c2', name: 'Standard Chartered Bank', contactPerson: 'David Osei', email: 'finance@scb.sl', phone: '+232 76 987 654', billingType: 'Monthly Retainer', rate: 4500, status: 'Active' },
  { id: 'c3', name: 'UNICEF Sierra Leone', contactPerson: 'Mariama Bah', email: 'logistics@unicef.org', phone: '+232 78 555 444', billingType: 'Per Day', rate: 180, status: 'Active' },
];

export const mockInvoices: Invoice[] = [
  { id: 'INV-2026-001', accountId: 'c1', date: '2026-06-01', period: 'May 2026', amount: 3150, status: 'Paid' },
  { id: 'INV-2026-002', accountId: 'c2', date: '2026-06-01', period: 'May 2026', amount: 4500, status: 'Unpaid' },
  { id: 'INV-2026-003', accountId: 'c3', date: '2026-05-01', period: 'April 2026', amount: 5400, status: 'Overdue' },
];

// #4 Print a formatted invoice in a new tab
const printInvoice = (invoice: Invoice, account: CorporateAccount | undefined) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.id}</title>
      <style>
        body { font-family: sans-serif; max-width: 700px; margin: 60px auto; color: #1e293b; }
        h1 { font-size: 2rem; font-weight: 900; color: #4f46e5; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 32px 0; }
        .label { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
        .value { font-size: 0.95rem; font-weight: 600; margin-top: 2px; }
        .amount { font-size: 2.5rem; font-weight: 900; color: #1e293b; margin: 32px 0; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; }
        .paid { background: #d1fae5; color: #065f46; }
        .unpaid { background: #fef3c7; color: #92400e; }
        .overdue { background: #fee2e2; color: #991b1b; }
        hr { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
        .footer { font-size: 0.75rem; color: #94a3b8; margin-top: 48px; }
      </style>
    </head>
    <body>
      <h1>BIG Invoice</h1>
      <hr />
      <div class="meta">
        <div><div class="label">Invoice ID</div><div class="value">${invoice.id}</div></div>
        <div><div class="label">Status</div><span class="status ${invoice.status.toLowerCase()}">${invoice.status}</span></div>
        <div><div class="label">Client</div><div class="value">${account?.name || 'Unknown'}</div></div>
        <div><div class="label">Contact</div><div class="value">${account?.contactPerson || ''} — ${account?.email || ''}</div></div>
        <div><div class="label">Billing Period</div><div class="value">${invoice.period}</div></div>
        <div><div class="label">Issue Date</div><div class="value">${invoice.date}</div></div>
        ${invoice.tripCount ? `<div><div class="label">Trip Days Billed</div><div class="value">${invoice.tripCount} days</div></div>` : ''}
        <div><div class="label">Billing Model</div><div class="value">${account?.billingType || ''}</div></div>
      </div>
      <hr />
      <div class="amount">Total: $${invoice.amount.toLocaleString()}</div>
      <hr />
      <div class="footer">BIG Fleet Management · 3 Massalay Drive Juba Formerly Johnny Paul Drive · Generated ${new Date().toLocaleString()}</div>
    </body>
    </html>
  `;
  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); win.print(); }
};

export const CorporateBilling: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'invoices'>('accounts');
  const [accounts, setAccounts] = useState<CorporateAccount[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  // #5 Edit Account state
  const [editingAccount, setEditingAccount] = useState<CorporateAccount | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Add Account state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<CorporateAccount>>({
    billingType: 'Per Day',
    status: 'Active',
    rate: 0
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [accountsRes, invoicesRes] = await Promise.all([
        supabase.from('corporate_accounts').select('*').order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false })
      ]);

      if (accountsRes.data) {
        setAccounts(accountsRes.data.map(d => ({
          id: d.id,
          name: d.name,
          contactPerson: d.contact_person,
          email: d.email,
          phone: d.phone,
          billingType: d.billing_type as 'Per Day' | 'Monthly Retainer',
          rate: Number(d.rate),
          status: d.status as 'Active' | 'Inactive'
        })));
      }

      if (invoicesRes.data) {
        setInvoices(invoicesRes.data.map(d => ({
          id: d.id,
          accountId: d.account_id,
          date: d.date,
          period: d.period,
          amount: Number(d.amount),
          status: d.status as 'Paid' | 'Unpaid' | 'Overdue',
          tripCount: d.trip_count
        })));
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.contactPerson || !newAccount.email) return;
    setIsAdding(true);
    try {
      const { error } = await supabase.from('corporate_accounts').insert({
        name: newAccount.name,
        contact_person: newAccount.contactPerson,
        email: newAccount.email,
        phone: newAccount.phone || '',
        billing_type: newAccount.billingType,
        rate: newAccount.rate,
        status: newAccount.status
      });
      if (error) throw error;
      await fetchData();
      setIsAddModalOpen(false);
      setNewAccount({ billingType: 'Per Day', status: 'Active', rate: 0 });
    } catch (err) {
      console.error('Error adding account:', err);
      alert('Failed to add account.');
    } finally {
      setIsAdding(false);
    }
  };

  // #5 Save edited account
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    setIsSavingEdit(true);
    try {
      const { error } = await supabase.from('corporate_accounts').update({
        name: editingAccount.name,
        contact_person: editingAccount.contactPerson,
        email: editingAccount.email,
        phone: editingAccount.phone,
        billing_type: editingAccount.billingType,
        rate: editingAccount.rate,
        status: editingAccount.status
      }).eq('id', editingAccount.id);
      if (error) throw error;
      await fetchData();
      setIsEditModalOpen(false);
      setEditingAccount(null);
    } catch (err) {
      console.error('Error saving account:', err);
      alert('Failed to save changes.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // #1/#3 Real invoice generation from trip_logs
  const handleGenerateInvoice = async (account: CorporateAccount) => {
    setGeneratingFor(account.id);
    try {
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];
      const period = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

      // Fetch trip logs for this corporate account this month
      const { data: tripLogs, error } = await supabase
        .from('trip_logs')
        .select('id, date')
        .eq('corporate_account_id', account.id)
        .gte('date', firstOfMonth)
        .lte('date', today);

      if (error) throw error;

      const tripCount = tripLogs?.length || 0;
      let amount = 0;

      if (account.billingType === 'Per Day') {
        // Count unique days with trips
        const uniqueDays = new Set(tripLogs?.map(l => l.date) || []);
        amount = uniqueDays.size * account.rate;
      } else {
        // Monthly retainer — flat rate
        amount = account.rate;
      }

      if (tripCount === 0 && account.billingType === 'Per Day') {
        alert(`No trip logs found for ${account.name} this month (${period}). Invoice not generated.`);
        return;
      }

      const invoiceId = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${account.id.toUpperCase().slice(0, 4)}`;

      const { error: insertError } = await supabase.from('invoices').insert({
        id: invoiceId,
        account_id: account.id,
        date: today,
        period,
        amount,
        status: 'Unpaid',
        trip_count: tripCount
      });

      if (insertError) throw insertError;

      await fetchData();
      alert(`✅ Invoice generated!\n\nClient: ${account.name}\nPeriod: ${period}\nTrips: ${tripCount}\nAmount: $${amount.toLocaleString()}`);
    } catch (err: any) {
      console.error('Invoice generation error:', err);
      alert(`Failed to generate invoice: ${err.message}`);
    } finally {
      setGeneratingFor(null);
    }
  };

  const AccountFormFields = ({ data, onChange }: { data: Partial<CorporateAccount>, onChange: (d: Partial<CorporateAccount>) => void }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Company Name</label>
        <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={data.name || ''} onChange={e => onChange({ ...data, name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Person</label>
          <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.contactPerson || ''} onChange={e => onChange({ ...data, contactPerson: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
          <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.phone || ''} onChange={e => onChange({ ...data, phone: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
        <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={data.email || ''} onChange={e => onChange({ ...data, email: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Billing Type</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.billingType} onChange={e => onChange({ ...data, billingType: e.target.value as any })}>
            <option value="Per Day">Per Day</option>
            <option value="Monthly Retainer">Monthly Retainer</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Rate ($)</label>
          <input required type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={data.rate || 0} onChange={e => onChange({ ...data, rate: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
        <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={data.status} onChange={e => onChange({ ...data, status: e.target.value as any })}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>
  );

  const renderAccounts = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Corporate Accounts</h2>
          <p className="text-slate-600 text-sm mt-1">Manage B2B relationships and billing rates</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={16} /> New Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map(account => (
          <div key={account.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${account.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 leading-tight">{account.name}</h3>
                  <p className="text-xs text-slate-600">{account.status}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Contact:</span>
                <span className="text-slate-950 font-bold">{account.contactPerson}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Billing:</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold">{account.billingType}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Rate:</span>
                <span className="text-slate-950 font-bold font-mono">${account.rate.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              {/* #5 Edit Account — now functional */}
              <button
                onClick={() => { setEditingAccount({ ...account }); setIsEditModalOpen(true); }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2 rounded-lg transition-colors border border-slate-200"
              >
                <PenTool size={12} /> Edit
              </button>
              {/* #1/#3 Real invoice generation */}
              <button
                onClick={() => handleGenerateInvoice(account)}
                disabled={generatingFor === account.id}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 rounded-lg transition-colors border border-blue-100 disabled:opacity-60"
              >
                {generatingFor === account.id ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
                {generatingFor === account.id ? 'Calculating...' : 'Generate Invoice'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">Invoice Ledger</h2>
          <p className="text-slate-600 text-sm mt-1">Track payments and outstanding balances</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Invoice ID</th>
              <th className="px-6 py-4 font-semibold">Client</th>
              <th className="px-6 py-4 font-semibold">Issue Date</th>
              <th className="px-6 py-4 font-semibold">Period</th>
              <th className="px-6 py-4 font-semibold">Trips</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-600 text-sm">No invoices yet. Generate one from the Accounts tab.</td></tr>
            ) : invoices.map(invoice => {
              const account = accounts.find(a => a.id === invoice.accountId);
              return (
                <tr key={invoice.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-950 font-mono">{invoice.id}</td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{account?.name}</td>
                  <td className="px-6 py-4 text-slate-700">{invoice.date}</td>
                  <td className="px-6 py-4 text-slate-700">{invoice.period}</td>
                  <td className="px-6 py-4 text-slate-700 font-mono">{invoice.tripCount ?? '—'}</td>
                  {/* #23 Currency standardised to $ for billing */}
                  <td className="px-6 py-4 font-bold text-slate-950 font-mono">${invoice.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      invoice.status === 'Overdue' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* #4 Download PDF — opens print dialog */}
                      <button
                        onClick={() => printInvoice(invoice, account)}
                        className="text-slate-600 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                        title="Download / Print PDF"
                      >
                        <Download size={16} />
                      </button>
                      {/* #4 Email client — mailto link */}
                      <a
                        href={`mailto:${account?.email}?subject=Invoice ${invoice.id} — ${invoice.period}&body=Dear ${account?.contactPerson},%0A%0APlease find attached your invoice for ${invoice.period}.%0A%0AInvoice ID: ${invoice.id}%0APeriod: ${invoice.period}%0AAmount Due: $${invoice.amount.toLocaleString()}%0A%0APlease remit payment at your earliest convenience.%0A%0ARegards,%0ABIG Fleet Management`}
                        className="text-slate-600 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                        title="Email Client"
                      >
                        <Mail size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3">
            <Building2 className="text-blue-600" size={32} />
            Corporate Billing
          </h1>
          <p className="text-slate-600 mt-2 font-medium">B2B client management and automated invoicing from live trip data.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'accounts', label: 'Corporate Accounts', icon: Building2 },
          { id: 'invoices', label: 'Invoice Ledger', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-400" />
        </div>
      ) : (
        <>
          {activeTab === 'accounts' && renderAccounts()}
          {activeTab === 'invoices' && renderInvoices()}
        </>
      )}

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-blue-600">
              <div>
                <h2 className="text-lg font-black text-white">New Corporate Account</h2>
                <p className="text-blue-200 text-xs mt-0.5">Register a new corporate billing account.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-blue-200 hover:text-white bg-blue-500 hover:bg-blue-400 rounded-lg p-1.5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddAccount} className="p-6">
              <AccountFormFields data={newAccount} onChange={setNewAccount} />
              {/* Footer actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex justify-center items-center gap-2"
                >
                  {isAdding ? <Loader2 size={16} className="animate-spin" /> : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* #5 Edit Account Modal */}
      {isEditModalOpen && editingAccount && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-blue-600">
              <div>
                <h2 className="text-lg font-black text-white">Edit Account</h2>
                <p className="text-blue-200 text-xs mt-0.5">Editing: {editingAccount.name}</p>
              </div>
              <button
                onClick={() => { setIsEditModalOpen(false); setEditingAccount(null); }}
                className="text-blue-200 hover:text-white bg-blue-500 hover:bg-blue-400 rounded-lg p-1.5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6">
              <AccountFormFields data={editingAccount} onChange={(d) => setEditingAccount(d as CorporateAccount)} />
              {/* Footer actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingAccount(null); }}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex justify-center items-center gap-2"
                >
                  {isSavingEdit ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
