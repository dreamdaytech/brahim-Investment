import React, { useState, useRef } from 'react';
import {
  Car, Calendar, Tag, FileText, Upload, X, CheckCircle2, AlertCircle, Loader2, Plus, Trash2, AlertTriangle, ShieldCheck, Image
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Vehicle, VehicleDocument } from './PerformanceSection';

// ── Types ──────────────────────────────────────────────────────────────────────
type Tab = 'details' | 'images' | 'documents' | 'fleet';

interface PendingDoc {
  key: string;
  label: string;
  docType: string;
  file: File;
  previewUrl: string;
  expiryDate: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  fileUrl?: string;
}

interface Props {
  editingVehicle: Vehicle | null;
  onClose: () => void;
  onSave: (data: Partial<Vehicle>) => void;
  readonly?: boolean;
}

// ── Field helpers ──────────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string; required?: boolean; children: React.ReactNode; span?: boolean;
}> = ({ label, required, children, span }) => (
  <div className={span ? 'col-span-2' : ''}>
    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inp = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition bg-white";
const sel = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition bg-white";

// ── Tab pill ───────────────────────────────────────────────────────────────────
const TabPill: React.FC<{
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void; done?: boolean;
}> = ({ icon, label, active, onClick, done }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
      active
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`}
  >
    {done && !active ? <CheckCircle2 size={13} className="text-emerald-500" /> : icon}
    {label}
  </button>
);

// ── Main component ─────────────────────────────────────────────────────────────
export const VehicleModal: React.FC<Props> = ({ editingVehicle, onClose, onSave, readonly = false }) => {
  const [tab, setTab] = useState<Tab>('details');
  const [saving, setSaving] = useState(false);
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  
  const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null);
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string | null>(editingVehicle?.imageUrl || null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(editingVehicle?.galleryUrls || []);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  
  const [newDocLabel, setNewDocLabel] = useState('');
  const [newDocType, setNewDocType] = useState('insurance');
  const [newDocExpiry, setNewDocExpiry] = useState('');
  const docInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    makeModel: editingVehicle?.makeModel || '',
    year: editingVehicle?.year || new Date().getFullYear(),
    odometer: editingVehicle?.odometer || 0,
    plateNumber: editingVehicle?.plateNumber || '',
    insuranceExpiry: editingVehicle?.insuranceExpiry || '',
    condition: editingVehicle?.condition || 'Excellent',
    isCompanyRegistered: editingVehicle ? editingVehicle.isCompanyRegistered : true,
    type: editingVehicle?.type || 'SUV',
    status: editingVehicle?.status || 'Available',
  });

  // Fleet listing (public) state
  const [fleetForm, setFleetForm] = useState({
    showOnFleet: editingVehicle?.showOnFleet ?? false,
    vehicleCategory: editingVehicle?.vehicleCategory || 'Heavy SUV',
    description: editingVehicle?.description || '',
    pricePerDay: editingVehicle?.pricePerDay || 0,
    featuresText: (editingVehicle?.features || []).join('\n'),
    fuelType: editingVehicle?.fuelType || 'Diesel',
    transmission: editingVehicle?.transmission || 'Automatic',
    seats: editingVehicle?.seats || 5,
    engineLabel: editingVehicle?.engineLabel || '',
    specEngineSize: editingVehicle?.specEngineSize || '',
    specDrivetrain: editingVehicle?.specDrivetrain || '',
    specGroundClearance: editingVehicle?.specGroundClearance || '',
    specFuelCapacity: editingVehicle?.specFuelCapacity || '',
    specBestFor: editingVehicle?.specBestFor || '',
  });
  const setFleet = (k: keyof typeof fleetForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFleetForm(prev => ({ ...prev, [k]: val }));
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(prev => ({ ...prev, [k]: val }));
  };

  // ── Document queue ────────────────────────────────────────────────────────────
  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newDocLabel.trim()) return;
    const key = `${Date.now()}-${Math.random()}`;
    const isImage = file.type.startsWith('image/');
    
    setPendingDocs(prev => [...prev, {
      key, 
      label: newDocLabel.trim(), 
      docType: newDocType, 
      expiryDate: newDocExpiry,
      file,
      previewUrl: isImage ? URL.createObjectURL(file) : '',
      status: 'pending',
    }]);
    
    // Reset fields
    setNewDocLabel('');
    setNewDocExpiry('');
    e.target.value = '';
  };

  const removeDoc = (key: string) => setPendingDocs(prev => prev.filter(d => d.key !== key));

  // ── Upload all pending docs ───────────────────────────────────────────────────
  const uploadDocs = async (vehicleId: string) => {
    for (const doc of pendingDocs) {
      if (doc.status !== 'pending') continue;
      
      setPendingDocs(prev => prev.map(d => d.key === doc.key ? { ...d, status: 'uploading' } : d));
      try {
        const ext = doc.file.name.split('.').pop();
        const path = `vehicle-docs/${vehicleId}/${doc.docType}-${Date.now()}.${ext}`;
        
        // Upload to Supabase Storage
        const { error: upErr } = await supabase.storage.from('vehicle-documents').upload(path, doc.file, { upsert: true });
        if (upErr) throw upErr;
        
        const { data } = supabase.storage.from('vehicle-documents').getPublicUrl(path);
        const fileUrl = data.publicUrl;
        
        // Save metadata to vehicle_documents table
        await supabase.from('vehicle_documents').insert({
          vehicle_id: vehicleId, 
          doc_type: doc.docType, 
          label: doc.label,
          file_url: fileUrl, 
          file_name: doc.file.name,
          expiry_date: doc.expiryDate || null
        });
        
        setPendingDocs(prev => prev.map(d => d.key === doc.key ? { ...d, status: 'done', fileUrl } : d));
      } catch (err) {
        console.error('Doc upload failed:', err);
        setPendingDocs(prev => prev.map(d => d.key === doc.key ? { ...d, status: 'error' } : d));
      }
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.makeModel.trim()) { setTab('details'); return; }
    
    setSaving(true);
    try {
      const data: Partial<Vehicle> = { 
        ...form, 
        year: Number(form.year), 
        odometer: Number(form.odometer) 
      };
      
      // We rely on PerformanceSection's onSave to insert/update the vehicle and return its ID,
      // But wait! onSave in PerformanceSection doesn't return the ID because it's void!
      // In PerformanceSection we will update onSave to handle the async supabase insert 
      // and return the inserted Vehicle so we can upload docs.
      
      // Temporary workaround: pass the pending documents to onSave, and let PerformanceSection upload them.
      // Or we can just run the onSave callback.
      // Let's pass the docs via an extended property so PerformanceSection can handle uploading if it needs to, 
      // or we handle saving the Vehicle directly here!
      // Actually, since we want to upload docs here, we should probably handle saving to `vehicles` table directly here.
      
      let vehicleId = editingVehicle?.id;
      
      const fleetDbFields = {
        // Auto-sync: if vehicle is not Available, hide from public fleet regardless of toggle
        show_on_fleet: data.status === 'Available' ? fleetForm.showOnFleet : false,
        vehicle_category: fleetForm.vehicleCategory || null,
        description: fleetForm.description || null,
        price_per_day: fleetForm.pricePerDay || null,
        features: fleetForm.featuresText ? fleetForm.featuresText.split('\n').map(f => f.trim()).filter(Boolean) : null,
        fuel_type: fleetForm.fuelType || null,
        transmission: fleetForm.transmission || null,
        seats: fleetForm.seats || null,
        engine_label: fleetForm.engineLabel || null,
        spec_engine_size: fleetForm.specEngineSize || null,
        spec_drivetrain: fleetForm.specDrivetrain || null,
        spec_ground_clearance: fleetForm.specGroundClearance || null,
        spec_fuel_capacity: fleetForm.specFuelCapacity || null,
        spec_best_for: fleetForm.specBestFor || null,
      };

      if (vehicleId) {
        // Edit existing
        const { error } = await supabase.from('vehicles').update({
          make_model: data.makeModel,
          year: data.year,
          odometer: data.odometer,
          plate_number: data.plateNumber,
          insurance_expiry: data.insuranceExpiry,
          condition: data.condition,
          is_company_registered: data.isCompanyRegistered,
          status: data.status,
          ...fleetDbFields,
        }).eq('id', vehicleId);
        
        if (error) console.error("Error updating vehicle", error);
      } else {
        // Insert new
        const { data: inserted, error } = await supabase.from('vehicles').insert({
          make_model: data.makeModel,
          year: data.year,
          odometer: data.odometer,
          plate_number: data.plateNumber,
          insurance_expiry: data.insuranceExpiry,
          condition: data.condition,
          is_company_registered: data.isCompanyRegistered,
          status: data.status,
          ...fleetDbFields,
        }).select().single();
        
        if (error) {
          console.error("Error inserting vehicle", error);
        } else if (inserted) {
          vehicleId = inserted.id;
          data.id = inserted.id;
        }
      }
      
      if (vehicleId) {
        let newImageUrl = primaryImagePreview && !primaryImageFile ? editingVehicle?.imageUrl : null;
        let newGalleryUrls = [...galleryUrls];

        if (primaryImageFile) {
          const ext = primaryImageFile.name.split('.').pop();
          const path = `vehicle-images/${vehicleId}/primary-${Date.now()}.${ext}`;
          const { error } = await supabase.storage.from('vehicle-documents').upload(path, primaryImageFile, { upsert: true });
          if (!error) {
            const { data } = supabase.storage.from('vehicle-documents').getPublicUrl(path);
            newImageUrl = data.publicUrl;
          }
        }

        for (let i = 0; i < galleryFiles.length; i++) {
          const file = galleryFiles[i];
          const ext = file.name.split('.').pop();
          const path = `vehicle-images/${vehicleId}/gallery-${Date.now()}-${i}.${ext}`;
          const { error } = await supabase.storage.from('vehicle-documents').upload(path, file, { upsert: true });
          if (!error) {
            const { data } = supabase.storage.from('vehicle-documents').getPublicUrl(path);
            newGalleryUrls.push(data.publicUrl);
          }
        }

        if (primaryImageFile || galleryFiles.length > 0 || newImageUrl !== editingVehicle?.imageUrl || newGalleryUrls.length !== (editingVehicle?.galleryUrls?.length || 0)) {
          await supabase.from('vehicles').update({
            image_url: newImageUrl,
            gallery_urls: newGalleryUrls
          }).eq('id', vehicleId);
          data.imageUrl = newImageUrl || undefined;
          data.galleryUrls = newGalleryUrls;
        }

        await uploadDocs(vehicleId);
      }
      
      onSave(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const docTypeOptions = [
    { value: 'insurance', label: "Insurance Certificate" },
    { value: 'registration', label: "Vehicle Registration" },
    { value: 'road_worthiness', label: 'Road Worthiness Certificate' },
    { value: 'logbook', label: 'Logbook (V5C)' },
    { value: 'maintenance', label: 'Maintenance Record' },
    { value: 'other', label: 'Other Document' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-indigo-600 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/50 border border-indigo-400 flex items-center justify-center shadow-sm">
              <Car size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {readonly ? 'Vehicle Details' : (editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle')}
              </h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                {readonly ? 'View vehicle information and documents' : 'Register a vehicle and manage documents'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white bg-indigo-500 hover:bg-indigo-400 rounded-lg p-1.5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-2 px-6 py-3 border-b border-slate-100 shrink-0 overflow-x-auto">
          <TabPill icon={<Car size={13} />} label="Vehicle Details" active={tab === 'details'} onClick={() => setTab('details')} done={!!form.makeModel} />
          <TabPill icon={<Image size={13} />} label="Images & Gallery" active={tab === 'images'} onClick={() => setTab('images')} done={!!primaryImagePreview || galleryUrls.length > 0 || galleryFiles.length > 0} />
          <TabPill icon={<FileText size={13} />} label="Documents & Expiry" active={tab === 'documents'} onClick={() => setTab('documents')} done={pendingDocs.length > 0 || (editingVehicle?.documents && editingVehicle.documents.length > 0)} />
        </div>

        {/* ── Form body ── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">

            {/* ─── TAB 1: Details ─── */}
            {tab === 'details' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Make & Model" required={!readonly} span>
                    <input type="text" value={form.makeModel} onChange={set('makeModel')} required disabled={readonly} className={`${inp} ${readonly ? 'opacity-70 bg-slate-50' : ''}`} placeholder="e.g. Toyota Land Cruiser Prado" />
                  </Field>
                  <Field label="Year" required={!readonly}>
                    <input type="number" value={form.year} onChange={set('year')} required disabled={readonly} className={`${inp} ${readonly ? 'opacity-70 bg-slate-50' : ''}`} />
                  </Field>
                  <Field label="Odometer (km)" required={!readonly}>
                    <input type="number" value={form.odometer} onChange={set('odometer')} required disabled={readonly} className={`${inp} ${readonly ? 'opacity-70 bg-slate-50' : ''}`} />
                  </Field>
                  <Field label="License Plate" required={!readonly}>
                    <input type="text" value={form.plateNumber} onChange={set('plateNumber')} required disabled={readonly} className={`${inp} ${readonly ? 'opacity-70 bg-slate-50' : ''}`} placeholder="e.g. AVU 206" />
                  </Field>
                  <Field label="Insurance Expiry" required={!readonly}>
                    <input type="date" value={form.insuranceExpiry} onChange={set('insuranceExpiry')} required disabled={readonly} className={`${inp} ${readonly ? 'opacity-70 bg-slate-50' : ''}`} />
                  </Field>
                  <Field label="Condition" required={!readonly}>
                    <select value={form.condition} onChange={set('condition')} disabled={readonly} className={`${sel} ${readonly ? 'opacity-70 bg-slate-50' : ''}`}>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </Field>
                  <Field label="Vehicle Type" required={!readonly}>
                    <select value={form.type} onChange={set('type')} disabled={readonly} className={`${sel} ${readonly ? 'opacity-70 bg-slate-50' : ''}`}>
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                    </select>
                  </Field>
                  <Field label="Status" required={!readonly}>
                    <select value={form.status} onChange={set('status')} disabled={readonly} className={`${sel} ${readonly ? 'opacity-70 bg-slate-50' : ''}`}>
                      <option value="Available">Available</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Decommissioned">Decommissioned</option>
                    </select>
                  </Field>
                  <div className="col-span-2 pt-2">
                    <label className={`flex items-center gap-2 ${readonly ? '' : 'cursor-pointer'}`}>
                      <input 
                        type="checkbox" 
                        checked={form.isCompanyRegistered} 
                        onChange={(e) => setForm(prev => ({...prev, isCompanyRegistered: e.target.checked}))}
                        disabled={readonly}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 disabled:opacity-70"
                      />
                      <span className="text-sm font-semibold text-slate-700">Vehicle is registered under company name</span>
                    </label>
                  </div>
                  </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Specifications & Public Fleet Details</h3>
                <div className="space-y-5">
                {/* Toggle */}
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div>
                    <p className="font-black text-slate-800 text-sm">Show on Public Fleet Page</p>
                    <p className="text-xs text-slate-600 mt-0.5">When enabled, this vehicle will appear on the 'Our Fleet' public page</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={fleetForm.showOnFleet} onChange={setFleet('showOnFleet')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Vehicle Category" span>
                        <select value={fleetForm.vehicleCategory} onChange={setFleet('vehicleCategory')} className={sel}>
                          <option>Heavy SUV</option>
                          <option>Mid SUV</option>
                          <option>Truck</option>
                          <option>4WD</option>
                          <option>Van / Minibus</option>
                        </select>
                      </Field>
                      <Field label="Fuel Type">
                        <select value={fleetForm.fuelType} onChange={setFleet('fuelType')} className={sel}>
                          <option>Diesel</option>
                          <option>Petrol</option>
                          <option>Hybrid</option>
                        </select>
                      </Field>
                      <Field label="Transmission">
                        <select value={fleetForm.transmission} onChange={setFleet('transmission')} className={sel}>
                          <option>Automatic</option>
                          <option>Manual</option>
                        </select>
                      </Field>
                      <Field label="Seats">
                        <input type="number" min={1} max={20} value={fleetForm.seats} onChange={setFleet('seats')} className={inp} />
                      </Field>
                      <Field label="Engine Label" span>
                        <input type="text" value={fleetForm.engineLabel} onChange={setFleet('engineLabel')} className={inp} placeholder="e.g. 3.0L D-4D Turbo Diesel" />
                      </Field>
                      <Field label="Price Per Day (USD)" span>
                        <input type="number" min={0} value={fleetForm.pricePerDay} onChange={setFleet('pricePerDay')} className={inp} placeholder="e.g. 150" />
                      </Field>
                    </div>

                    <Field label="Public Description" span>
                      <textarea value={fleetForm.description} onChange={setFleet('description') as any} rows={3} className={`${inp} resize-none`} placeholder="Write a short marketing description for the public fleet page..." />
                    </Field>

                    <Field label="Features (one per line)" span>
                      <textarea value={fleetForm.featuresText} onChange={setFleet('featuresText') as any} rows={5} className={`${inp} resize-none font-mono text-xs`} placeholder={"Full-Time 4WD with Active Traction Control\nSpaciousCabin (Up to 7 Seats)\nHeavy-duty suspension"} />
                    </Field>

                    <div>
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Detailed Specifications (Spec Sheet)</p>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Engine Size">
                          <input type="text" value={fleetForm.specEngineSize} onChange={setFleet('specEngineSize')} className={inp} placeholder="e.g. 2982 cc Turbo Diesel" />
                        </Field>
                        <Field label="Drivetrain">
                          <input type="text" value={fleetForm.specDrivetrain} onChange={setFleet('specDrivetrain')} className={inp} placeholder="e.g. Constant 4WD" />
                        </Field>
                        <Field label="Ground Clearance">
                          <input type="text" value={fleetForm.specGroundClearance} onChange={setFleet('specGroundClearance')} className={inp} placeholder="e.g. 215 mm" />
                        </Field>
                        <Field label="Fuel Capacity">
                          <input type="text" value={fleetForm.specFuelCapacity} onChange={setFleet('specFuelCapacity')} className={inp} placeholder="e.g. 150 Liters" />
                        </Field>
                        <Field label="Best For" span>
                          <input type="text" value={fleetForm.specBestFor} onChange={setFleet('specBestFor')} className={inp} placeholder="e.g. NGO field missions, VIP routes" />
                        </Field>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 2: Images ─── */}
            {tab === 'images' && (
              <div className="space-y-6">
                <div className="mb-4">
                  <p className="text-sm font-bold text-slate-700 mb-1">Primary Featured Image</p>
                  <p className="text-xs text-slate-500 mb-4">This image will appear on the Fleet Vehicles table and main details view.</p>
                  
                  <div className="flex gap-4 items-start">
                    {primaryImagePreview ? (
                      <div className="relative group shrink-0">
                        <img src={primaryImagePreview} alt="Primary" className="w-32 h-32 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                        {!readonly && (
                          <button type="button" onClick={() => { setPrimaryImageFile(null); setPrimaryImagePreview(null); }} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center shrink-0">
                        <Image size={24} className="text-slate-400" />
                      </div>
                    )}
                    
                    {!readonly && (
                      <div className="flex-1">
                        <label className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors w-max text-sm font-bold mt-2">
                          <Upload size={16} /> Select Primary Image
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setPrimaryImageFile(e.target.files[0]);
                              setPrimaryImagePreview(URL.createObjectURL(e.target.files[0]));
                            }
                          }} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-700 mb-1">Gallery Images</p>
                  <p className="text-xs text-slate-500 mb-4">Upload multiple photos for condition reports or full vehicle views.</p>
                  
                  <div className="flex flex-wrap gap-4">
                    {galleryUrls.map((url, i) => (
                      <div key={`url-${i}`} className="relative group shrink-0">
                        <img src={url} alt="Gallery" className="w-24 h-24 rounded-xl object-cover border border-slate-200 shadow-sm" />
                        {!readonly && (
                          <button type="button" onClick={() => setGalleryUrls(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition">
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {galleryFiles.map((file, i) => (
                      <div key={`file-${i}`} className="relative group shrink-0">
                        <img src={URL.createObjectURL(file)} alt="Gallery" className="w-24 h-24 rounded-xl object-cover border border-slate-200 shadow-sm" />
                        {!readonly && (
                          <button type="button" onClick={() => setGalleryFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition">
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {!readonly && (
                      <label className="w-24 h-24 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors shrink-0">
                        <Plus size={20} className="text-slate-500 mb-1" />
                        <span className="text-[10px] font-bold text-slate-600">Add Photos</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                          if (e.target.files?.length) {
                            const newFiles = Array.from(e.target.files);
                            setGalleryFiles(prev => [...prev, ...newFiles]);
                          }
                        }} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 3: Documents ─── */}
            {tab === 'documents' && (
              <div className="space-y-5">
                {/* Existing Documents */}
                {editingVehicle?.documents && editingVehicle.documents.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-bold text-slate-700 mb-2">Saved Documents</p>
                    <div className="space-y-2">
                      {editingVehicle.documents.map(doc => {
                        const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                        const isExpiringSoon = doc.expiryDate && !isExpired && 
                          (new Date(doc.expiryDate).getTime() - new Date().getTime()) < (30 * 24 * 60 * 60 * 1000); // 30 days
                        
                        return (
                          <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                              <ShieldCheck size={18} className="text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{doc.label}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] uppercase font-bold text-slate-500">{doc.docType.replace('_', ' ')}</span>
                                {doc.expiryDate && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    isExpired ? 'bg-red-100 text-red-700' : 
                                    isExpiringSoon ? 'bg-amber-100 text-amber-700' : 
                                    'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    Expires: {doc.expiryDate}
                                  </span>
                                )}
                              </div>
                            </div>
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
                              View
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload New Document (hidden in readonly mode) */}
                {!readonly && (
                  <div className={editingVehicle?.documents?.length ? "pt-4 border-t border-slate-100" : ""}>
                    <p className="text-sm font-bold text-slate-700 mb-1">Upload New Document</p>
                  <p className="text-xs text-slate-500 mb-4">Attach insurance, registration, and set their expiry dates for tracking.</p>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Document Type</label>
                      <select
                        value={newDocType}
                        onChange={e => setNewDocType(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl px-2 py-2.5 bg-white outline-none"
                      >
                        {docTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Document Name / Label</label>
                      <input
                        type="text"
                        value={newDocLabel}
                        onChange={e => setNewDocLabel(e.target.value)}
                        placeholder="e.g. 2024 Insurance Copy"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Expiry Date (Optional)</label>
                      <input
                        type="date"
                        value={newDocExpiry}
                        onChange={e => setNewDocExpiry(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none text-slate-700"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        disabled={!newDocLabel.trim()}
                        onClick={() => docInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-2.5 rounded-xl transition disabled:opacity-40"
                      >
                        <Plus size={14} /> Attach File
                      </button>
                    </div>
                  </div>
                  
                  <input ref={docInputRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleDocSelect} />

                  {/* Pending documents list */}
                  {pendingDocs.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-xs font-bold text-slate-600 uppercase mb-2">Files Ready to Upload</p>
                      {pendingDocs.map(doc => (
                        <div key={doc.key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          {doc.previewUrl ? (
                            <img src={doc.previewUrl} alt={doc.label} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                              <FileText size={16} className="text-slate-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{doc.label}</p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {doc.file.name} · {(doc.file.size / 1024).toFixed(0)} KB
                              {doc.expiryDate && ` · Expires: ${doc.expiryDate}`}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {doc.status === 'uploading' && <Loader2 size={14} className="animate-spin text-indigo-400" />}
                            {doc.status === 'done' && <CheckCircle2 size={14} className="text-emerald-500" />}
                            {doc.status === 'error' && <AlertCircle size={14} className="text-red-400" />}
                            {doc.status === 'pending' && (
                              <button type="button" onClick={() => removeDoc(doc.key)} className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 transition">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl shrink-0">
            <div className="flex gap-2">
              {tab !== 'details' && (
                <button type="button" onClick={() => setTab(tab === 'documents' ? 'images' : 'details')}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition">
                  ← Back
                </button>
              )}
              {tab !== 'documents' && !readonly && (
                <button type="button" onClick={() => setTab(tab === 'details' ? 'images' : 'documents')}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition">
                  Next →
                </button>
              )}
              {tab === 'documents' && readonly && (
                <button type="button" onClick={() => {}}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition opacity-0 pointer-events-none">
                  placeholder
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {readonly ? (
                <button type="button" onClick={onClose}
                  className="px-6 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition shadow-md shadow-slate-200">
                  Close
                </button>
              ) : (
                <>
                  <button type="button" onClick={onClose}
                    className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !form.makeModel}
                    className="flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    {saving ? 'Saving...' : (editingVehicle ? 'Update Vehicle' : 'Save Vehicle')}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
