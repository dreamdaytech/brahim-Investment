import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, Camera, Save, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AdminProfile: React.FC<{ currentUserRole?: string }> = ({ currentUserRole }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [password, setPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setName(user.user_metadata?.full_name || '');
        setPhone(user.user_metadata?.phone || '');
        setAvatarUrl(user.user_metadata?.avatar_url || '');
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      let finalAvatarUrl = avatarUrl;

      // If there's a new file, upload it
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `admin_${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('driver-assets') // Reusing existing bucket
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('driver-assets').getPublicUrl(filePath);
        finalAvatarUrl = data.publicUrl;
      }

      // Update auth user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          phone: phone,
          avatar_url: finalAvatarUrl
        }
      });

      if (error) throw error;
      
      setAvatarUrl(finalAvatarUrl);
      setAvatarFile(null);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear message after 3s
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Accent header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-600"></div>

        <div className="flex items-center gap-3 mb-8 mt-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <ShieldCheck size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">Admin Profile</h2>
            <p className="text-sm text-slate-600">Manage your administrative identity and contact details</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Admin Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-slate-400" />
                )}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-bold text-slate-950">Profile Photo</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">
                Click the avatar to upload a new profile picture. Recommended size: 256x256px.
              </p>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Change Photo
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-indigo-500" /> Full Name
              </label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samuel Koroma"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={14} className="text-indigo-500" /> Email Address
              </label>
              <input 
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 cursor-not-allowed"
                title="Email cannot be changed here"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Phone size={14} className="text-indigo-500" /> Telephone Number
              </label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+232 XX XXX XXX"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving Profile...' : 'Save Changes'}
            </button>
          </div>

        </form>
      
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" />
            Security
          </h2>

          <form onSubmit={handleUpdatePassword} className="max-w-md space-y-5">
            {passwordMessage && (
              <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <AlertCircle size={16} />
                {passwordMessage.text}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                placeholder="Enter new password"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-shadow text-sm"
              />
            </div>
            
            <button
              type="submit"
              disabled={!password || password.length < 6}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
