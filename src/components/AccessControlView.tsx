import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, Edit3, Save, X, AlertCircle, MoreVertical, Power } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// We need the env variables for a temporary client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface AccessControlViewProps {
  currentUserRole: string;
}

export const AccessControlView: React.FC<AccessControlViewProps> = ({ currentUserRole }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('fleet_manager');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('user_roles').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setUsers(data);
    }
    setIsLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');
    
    try {
      // 1. Create user using a temporary client so it doesn't log the admin out!
      const tempClient = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      
      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. The trigger should have inserted the default row. 
        // We will just do an upsert or wait a second and update it.
        // Wait for the trigger to finish
        await new Promise(r => setTimeout(r, 1000));
        
        // Update the role and full name using the main admin client
        // We use upsert here in case the database trigger failed or hasn't fired yet
        const { error: updateError } = await supabase.from('user_roles').upsert({
          id: authData.user.id,
          email: email,
          full_name: fullName,
          role: role,
          is_active: true
        });
        
        if (updateError) throw updateError;

        setIsModalOpen(false);
        setEmail('');
        setPassword('');
        setFullName('');
        setRole('fleet_manager');
        fetchUsers();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    if (currentUserRole !== 'super_admin') return;
    const { error } = await supabase.from('user_roles').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) fetchUsers();
  };

  const updateRole = async (id: string, newRole: string) => {
    if (currentUserRole !== 'super_admin') return;
    const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('id', id);
    if (!error) fetchUsers();
  };

  const deleteUser = async (id: string) => {
    if (currentUserRole !== 'super_admin') return;
    if (window.confirm('Are you sure you want to completely delete this user role? They will lose access to the dashboard.')) {
      const { error } = await supabase.from('user_roles').delete().eq('id', id);
      if (!error) fetchUsers();
    }
  };

  if (currentUserRole !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
          <p className="text-slate-500">You do not have permission to view access controls.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Access Control</h2>
          <p className="text-sm text-slate-500">Manage platform users, roles, and permissions.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-bold">User</th>
              <th className="px-6 py-4 font-bold">Email</th>
              <th className="px-6 py-4 font-bold">Role</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No users found. Please run the SQL migration.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">{u.full_name || 'Unnamed User'}</td>
                  <td className="px-6 py-4 text-slate-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="fleet_manager">Fleet Manager</option>
                      <option value="finance">Finance</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === u.id ? null : u.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {activeDropdown === u.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveDropdown(null)}
                        />
                        <div className="absolute right-6 top-10 w-36 bg-white rounded-lg shadow-xl border border-slate-100 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={() => {
                              toggleStatus(u.id, u.is_active);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors text-slate-700"
                          >
                            <Power size={14} className={u.is_active ? 'text-amber-500' : 'text-green-500'} />
                            {u.is_active ? 'Suspend' : 'Activate'}
                          </button>
                          
                          <button
                            onClick={() => {
                              deleteUser(u.id);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Add New User</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {authError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{authError}</span>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Temporary Password</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm">
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="fleet_manager">Fleet Manager</option>
                  <option value="finance">Finance</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-slate-600 font-semibold text-sm hover:bg-slate-50 rounded-lg transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 rounded-lg transition disabled:opacity-50">
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
