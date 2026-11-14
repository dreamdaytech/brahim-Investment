import React, { useState } from 'react';
import { Car, CheckCircle2 } from 'lucide-react';
import type { ReservationVehicleDisplay } from '../lib/reservationVehicles';

interface VehicleDetailsGalleryProps {
  display: ReservationVehicleDisplay;
  title?: string;
}

/** Shared public booking and admin request view of a vehicle, with photo gallery. */
export const VehicleDetailsGallery: React.FC<VehicleDetailsGalleryProps> = ({ display, title }) => {
  const { vehicle, photos, mediaSource, savedSource } = display;
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const activePhoto = selectedPhoto && photos.includes(selectedPhoto) ? selectedPhoto : photos[0];

  const technicalSpecs: [string, string | number | null | undefined][] = vehicle ? [
    ['Model', vehicle.makeModel],
    ['Year', vehicle.year],
    ['Category', vehicle.vehicleCategory || vehicle.type],
    ['Seats', vehicle.seats],
    ['Fuel', vehicle.fuelType],
    ['Transmission', vehicle.transmission],
    ['Engine', vehicle.engineLabel],
    ['Engine capacity', vehicle.specEngineSize],
    ['Drivetrain', vehicle.specDrivetrain],
    ['Ground clearance', vehicle.specGroundClearance],
    ['Fuel capacity', vehicle.specFuelCapacity],
    ['Best suited for', vehicle.specBestFor],
    ['Indicative daily rate (Le)', vehicle.pricePerDay != null ? vehicle.pricePerDay.toLocaleString() : null],
  ] : [];

  const isCatalogueImage = mediaSource === 'catalog' ||
    (mediaSource === 'snapshot' && savedSource === 'catalog');

  return (
    <div className="space-y-4">
      {title && <h3 className="text-base font-black text-slate-950">{title}</h3>}
      {activePhoto ? (
        <div className="rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center h-52 sm:h-72">
          <img src={activePhoto} alt={vehicle?.makeModel || 'Requested vehicle'}
            className="h-full w-full object-contain" />
        </div>
      ) : (
        <div className="h-40 sm:h-56 flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-100 text-slate-500">
          <Car size={34} aria-hidden="true" />
          <p className="text-xs font-semibold">Vehicle image unavailable</p>
        </div>
      )}
      {photos.length > 1 && (
        <div className="flex flex-wrap gap-2" aria-label="Vehicle image gallery">
          {photos.map((photo, index) => (
            <button key={photo} type="button" onClick={() => setSelectedPhoto(photo)}
              aria-label={`Show photo ${index + 1} of ${photos.length}`}
              aria-pressed={activePhoto === photo}
              className={`w-20 h-16 overflow-hidden rounded-lg border-2 transition-colors ${activePhoto === photo ? 'border-blue-600' : 'border-slate-200 hover:border-slate-400'}`}>
              <img src={photo} alt={`Vehicle photo ${index + 1}`}
                className="w-full h-full object-cover" loading="lazy"/>
            </button>
          ))}
        </div>
      )}
      {isCatalogueImage && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
          These are catalogue reference photos of the requested model, not proof that a particular fleet vehicle is assigned.
        </p>
      )}
      {mediaSource === 'snapshot' && savedSource === 'fleet' && (
        <p className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-800">
          These vehicle details and images were captured when the customer sent the inquiry. Assignment is still subject to confirmation.
        </p>
      )}
      {vehicle && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {technicalSpecs.filter(([, value]) => value !== null && value !== undefined && value !== '')
              .map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 p-3 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="text-sm font-semibold text-slate-950 mt-1 break-words">{value}</p>
                </div>
              ))}
          </div>
          {vehicle.description && (
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Vehicle description</h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{vehicle.description}</p>
            </div>
          )}
          {Boolean(vehicle.features?.length) && (
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Features and equipment</h4>
              <ul className="grid sm:grid-cols-2 gap-2">
                {(vehicle.features || []).map((feature, index) => (
                  <li key={index} className="flex gap-2 items-start text-xs text-slate-700">
                    <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" aria-hidden="true"/>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};
