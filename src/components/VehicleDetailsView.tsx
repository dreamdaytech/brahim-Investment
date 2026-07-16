import React, { useState } from "react";
import {
  ArrowLeft, Car, FileText, Activity, PenTool, CheckCircle2, AlertTriangle, Fuel,
  Settings, Shield, Users, DollarSign, Calendar, Layers, ExternalLink
} from "lucide-react";
import { Vehicle, VehicleDocument } from "./PerformanceSection";

interface VehicleDetailsViewProps {
  vehicle: Vehicle;
  onBack: () => void;
  onEdit: () => void;
}

const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
    <span className="text-sm font-semibold text-slate-800 text-right max-w-[55%]">{value ?? "—"}</span>
  </div>
);

export const VehicleDetailsView: React.FC<VehicleDetailsViewProps> = ({ vehicle, onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "gallery">("overview");
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const insuranceDate = vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry) : null;
  const insuranceDaysLeft = insuranceDate
    ? Math.ceil((insuranceDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl border border-blue-100 overflow-hidden flex items-center justify-center shrink-0 text-blue-400">
            {vehicle.imageUrl ? (
              <img src={vehicle.imageUrl} alt={vehicle.makeModel} className="w-full h-full object-cover" />
            ) : (
              <Car size={24} />
            )}
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {vehicle.year} {vehicle.makeModel}
              </h2>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                vehicle.status === "Available" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                vehicle.status === "Maintenance" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                "bg-slate-100 text-slate-600 border border-slate-200"
              }`}>{vehicle.status}</span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Plate: <span className="font-mono font-bold text-slate-700">{vehicle.plateNumber}</span>
              {" · "}{vehicle.type}
              {vehicle.condition && <> · <span className="text-slate-600">{vehicle.condition}</span></>}
            </p>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold transition-colors text-sm shadow-sm shrink-0"
        >
          <PenTool size={15} /> Edit Vehicle
        </button>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Odometer</p>
          <p className="text-2xl font-black text-slate-900">{vehicle.odometer?.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">km</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Daily Rate</p>
          <p className="text-2xl font-black text-slate-900">${vehicle.pricePerDay ?? 0}</p>
          <p className="text-xs text-slate-500 mt-0.5">per day</p>
        </div>
        <div className={`p-5 rounded-2xl border shadow-sm ${
          insuranceDaysLeft !== null && insuranceDaysLeft <= 30
            ? "bg-red-50 border-red-200"
            : insuranceDaysLeft !== null && insuranceDaysLeft <= 90
            ? "bg-amber-50 border-amber-200"
            : "bg-white border-slate-200"
        }`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Insurance</p>
          <p className={`text-2xl font-black ${
            insuranceDaysLeft !== null && insuranceDaysLeft <= 30 ? "text-red-700" :
            insuranceDaysLeft !== null && insuranceDaysLeft <= 90 ? "text-amber-700" :
            "text-slate-900"
          }`}>
            {insuranceDaysLeft !== null ? `${insuranceDaysLeft}d` : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {insuranceDate ? insuranceDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "No expiry set"}
          </p>
        </div>
        <div className={`p-5 rounded-2xl border shadow-sm ${vehicle.showOnFleet ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fleet Listing</p>
          <div className="flex items-center gap-2 mt-1">
            {vehicle.showOnFleet ? (
              <CheckCircle2 size={20} className="text-emerald-600" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
            )}
            <p className="text-sm font-bold text-slate-800">{vehicle.showOnFleet ? "Active" : "Hidden"}</p>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{vehicle.showOnFleet ? "Visible to customers" : "Admin use only"}</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["overview", "documents", "gallery"] as const).map((tab) => {
          const icons = { overview: <Settings size={15} />, documents: <FileText size={15} />, gallery: <Layers size={15} /> };
          const labels = { overview: "Overview & Specs", documents: "Documents", gallery: "Gallery" };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {icons[tab]} {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Core Specs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Car size={14} className="text-blue-500" /> Core Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div>
                  <InfoRow label="Make & Model" value={vehicle.makeModel} />
                  <InfoRow label="Year" value={vehicle.year} />
                  <InfoRow label="Plate Number" value={vehicle.plateNumber} />
                  <InfoRow label="Vehicle Type" value={vehicle.type} />
                  <InfoRow label="Condition" value={vehicle.condition} />
                </div>
                <div>
                  <InfoRow label="Fuel Type" value={vehicle.fuelType} />
                  <InfoRow label="Transmission" value={vehicle.transmission} />
                  <InfoRow label="Seats" value={vehicle.seats} />
                  <InfoRow label="Engine" value={(vehicle as any).specEngineSize} />
                  <InfoRow label="Drivetrain" value={(vehicle as any).specDrivetrain} />
                </div>
              </div>
            </div>

            {vehicle.description && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <FileText size={14} className="text-blue-500" /> Marketing Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((f, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-100">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield size={14} className="text-blue-500" /> Asset & Registry
              </h3>
              <InfoRow label="Status" value={vehicle.status} />
              <InfoRow label="Company Registered" value={vehicle.isCompanyRegistered ? "Yes" : "No"} />
              <InfoRow label="Insurance Expiry" value={insuranceDate?.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} />
              <InfoRow label="Fleet Listing" value={vehicle.showOnFleet ? "Active (Public)" : "Hidden"} />
              <InfoRow label="Category" value={vehicle.vehicleCategory} />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <DollarSign size={14} className="text-blue-500" /> Pricing
              </h3>
              <InfoRow label="Price Per Day" value={vehicle.pricePerDay !== undefined ? `Le ${vehicle.pricePerDay}` : null} />
              <InfoRow label="Ground Clearance" value={(vehicle as any).specGroundClearance} />
              <InfoRow label="Fuel Capacity" value={(vehicle as any).specFuelCapacity} />
              <InfoRow label="Best For" value={(vehicle as any).specBestFor} />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Documents ── */}
      {activeTab === "documents" && (
        <div className="animate-fade-in">
          {vehicle.documents && vehicle.documents.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800">Vehicle Documents</h3>
                <p className="text-xs text-slate-500 mt-0.5">{vehicle.documents.length} document{vehicle.documents.length !== 1 ? "s" : ""} on record</p>
              </div>
              <div className="divide-y divide-slate-100">
                {vehicle.documents.map((doc: VehicleDocument) => (
                  <div key={doc.id || doc.fileUrl} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{doc.label}</p>
                      <p className="text-xs text-slate-500 capitalize mt-0.5">{doc.docType?.replace(/_/g, " ")}</p>
                    </div>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">No Documents Yet</h3>
              <p className="text-slate-500 mb-5 text-sm max-w-sm mx-auto">Upload insurance certificates, registration documents, and maintenance records in the vehicle editor.</p>
              <button onClick={onEdit} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-sm">
                Open Editor to Add Documents
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Gallery ── */}
      {activeTab === "gallery" && (
        <div className="animate-fade-in">
          {(vehicle.galleryUrls && vehicle.galleryUrls.length > 0) || vehicle.imageUrl ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Image Gallery</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {vehicle.imageUrl && (
                  <div
                    key="primary"
                    className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 cursor-pointer group relative border border-slate-200"
                    onClick={() => setLightboxImg(vehicle.imageUrl!)}
                  >
                    <img src={vehicle.imageUrl} alt="Primary" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all flex items-center justify-center">
                      <ExternalLink size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                    </div>
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-md">Primary</span>
                  </div>
                )}
                {vehicle.galleryUrls?.map((url, idx) => (
                  <div
                    key={idx}
                    className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 cursor-pointer group relative border border-slate-200"
                    onClick={() => setLightboxImg(url)}
                  >
                    <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all flex items-center justify-center">
                      <ExternalLink size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
              <Layers size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">No Images Yet</h3>
              <p className="text-slate-500 mb-5 text-sm max-w-sm mx-auto">Upload a primary image and gallery photos in the vehicle editor.</p>
              <button onClick={onEdit} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-sm">
                Open Editor to Add Images
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[300] bg-slate-900/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <img src={lightboxImg} alt="Preview" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" referrerPolicy="no-referrer" />
          <button
            className="absolute top-4 right-4 text-white bg-slate-700 hover:bg-slate-600 rounded-full p-2 transition-colors"
            onClick={() => setLightboxImg(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
