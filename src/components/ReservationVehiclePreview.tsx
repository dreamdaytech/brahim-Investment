import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Car, Eye, X, CalendarDays, MapPin, Users } from 'lucide-react';
import type { Inquiry } from '../types';
import { ReservationVehicle, resolveReservationVehicle } from '../lib/reservationVehicles';

interface ReservationVehiclePreviewProps {
  inquiry: Inquiry;
  vehicles: ReservationVehicle[];
  onView: (inquiry: Inquiry) => void;
}

const VehiclePhoto: React.FC<{ vehicle: ReservationVehicle | null; large?: boolean }> = ({ vehicle, large = false }) => (
  <div className={large
    ? 'h-48 sm:h-64 w-full rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center'
    : 'h-20 w-28 sm:w-32 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center'}>
    {vehicle?.imageUrl ? (
      <img src={vehicle.imageUrl} alt={vehicle.makeModel} className="w-full h-full object-cover" />
    ) : (
      <Car size={large ? 42 : 24} className="text-slate-400" aria-label="Vehicle image unavailable" />
    )}
  </div>
);

export const ReservationVehiclePreview: React.FC<ReservationVehiclePreviewProps> = ({
  inquiry, vehicles, onView
}) => {
  const vehicle = resolveReservationVehicle(vehicles, inquiry.requestedVehicleId, inquiry.preferredVehicle);
  const shortDetails = vehicle
    ? [vehicle.year, vehicle.vehicleCategory || vehicle.type, vehicle.seats ? vehicle.seats + ' seats' : null]
        .filter(Boolean).join(' · ')
    : '';

  return (
    <div className="flex flex-col sm:flex-row items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl mt-3">
      <VehiclePhoto vehicle={vehicle} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider font-bold text-blue-700">Requested Vehicle</p>
        <p className="font-bold text-slate-950 text-sm break-words">
          {inquiry.preferredVehicle || vehicle?.makeModel || 'Unspecified'} ({inquiry.vehiclesNeeded} {inquiry.vehiclesNeeded === 1 ? 'unit' : 'units'})
        </p>
        {shortDetails ? (
          <p className="text-xs text-slate-600 mt-1">{shortDetails}</p>
        ) : (
          <p className="text-xs text-slate-500 mt-1">Vehicle photos and specifications are unavailable for this inquiry.</p>
        )}
        <button type="button" onClick={() => onView(inquiry)}
          className="mt-2 inline-flex gap-1.5 items-center text-xs font-semibold text-blue-700 hover:underline">
          <Eye size={13} /> View vehicle details
        </button>
      </div>
    </div>
  );
};

interface ReservationVehicleDetailsProps {
  inquiry: Inquiry;
  vehicles: ReservationVehicle[];
  onClose: () => void;
}

export const ReservationVehicleDetails: React.FC<ReservationVehicleDetailsProps> = ({
  inquiry, vehicles, onClose
}) => {
  const vehicle = resolveReservationVehicle(vehicles, inquiry.requestedVehicleId, inquiry.preferredVehicle);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const photos = Array.from(new Set([vehicle?.imageUrl, ...(vehicle?.galleryUrls || [])]
    .filter((url): url is string => typeof url === 'string' && url.length > 0)));
  const displayedPhoto = selectedPhoto && photos.includes(selectedPhoto) ? selectedPhoto : photos[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[1000] p-3 sm:p-6 bg-slate-950/65 flex items-center justify-center"
      role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="reservation-vehicle-title"
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <header className="p-4 sm:p-6 flex justify-between gap-3 items-start border-b border-slate-200">
          <div>
            <p className="uppercase text-xs text-blue-700 font-bold tracking-wide">Reservation inquiry · {inquiry.id}</p>
            <h2 id="reservation-vehicle-title" className="text-xl font-black text-slate-950">
              {inquiry.preferredVehicle || vehicle?.makeModel || 'Requested vehicle'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">Customer request — vehicle allocation is not confirmed here.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close vehicle details"
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"><X size={20}/></button>
        </header>

        <div className="p-4 sm:p-6 space-y-5">
          {displayedPhoto ? (
            <div className="space-y-3">
              <div className="h-48 sm:h-64 w-full rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
                <img src={displayedPhoto} alt={vehicle?.makeModel || 'Requested vehicle'} className="h-full w-full object-contain" />
              </div>
              {photos.length > 1 && (
                <div className="flex flex-wrap gap-2" aria-label="Vehicle photo gallery">
                  {photos.map((url, index) => (
                    <button key={url} type="button" onClick={() => setSelectedPhoto(url)}
                      aria-label={`View vehicle photo ${index + 1}`}
                      aria-pressed={url === displayedPhoto}
                      className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${url === displayedPhoto ? 'border-blue-600' : 'border-slate-200 hover:border-slate-400'}`}>
                      <img src={url} alt={`Vehicle thumbnail ${index + 1}`} loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <VehiclePhoto vehicle={vehicle} large />
          )}
          {vehicle ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  ['Model', vehicle.makeModel],
                  ['Year', vehicle.year],
                  ['Category', vehicle.vehicleCategory || vehicle.type],
                  ['Seats', vehicle.seats],
                  ['Fuel', vehicle.fuelType],
                  ['Transmission', vehicle.transmission],
                  ['Fleet status now', vehicle.status],
                  ['Indicative daily rate (Le)', vehicle.pricePerDay ? vehicle.pricePerDay.toLocaleString() : null]
                ].filter((entry) => entry[1] !== null && entry[1] !== undefined && entry[1] !== '').map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-500">{label}</p>
                    <p className="text-sm text-slate-900 font-semibold mt-1">{value}</p>
                  </div>
                ))}
              </div>
              {vehicle.description && <p className="text-sm text-slate-600">{vehicle.description}</p>}
            </>
          ) : (
            <p className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              The original vehicle record could not be matched safely. The saved requested vehicle name is retained above.
            </p>
          )}

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-bold text-slate-950 mb-3">Inquiry details</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <p className="flex items-start gap-2 text-slate-700"><Users size={16} className="mt-0.5 shrink-0"/>{inquiry.vehiclesNeeded} requested {inquiry.vehiclesNeeded === 1 ? 'unit' : 'units'} · {inquiry.serviceType}</p>
              <p className="flex items-start gap-2 text-slate-700"><CalendarDays size={16} className="mt-0.5 shrink-0"/>{inquiry.startDate} to {inquiry.endDate}</p>
              <p className="flex items-start gap-2 text-slate-700"><MapPin size={16} className="mt-0.5 shrink-0"/>Pickup: {inquiry.pickupLocation}</p>
              <p className="flex items-start gap-2 text-slate-700"><MapPin size={16} className="mt-0.5 shrink-0"/>Return: {inquiry.dropoffLocation}</p>
              <p className="text-slate-700">Customer: <strong>{inquiry.fullName}</strong></p>
              <p className="text-slate-700">Request status: <strong>{inquiry.status}</strong></p>
            </div>
          </div>
        </div>
        <footer className="border-t border-slate-200 p-4 sm:px-6 flex justify-end">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-sm font-bold">Close</button>
        </footer>
      </section>
    </div>,
    document.body
  );
};
