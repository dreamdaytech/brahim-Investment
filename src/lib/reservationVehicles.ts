import { VEHICLES } from '../data';
/**
 * Public fleet details that may be shown with an inquiry.
 * Do not treat the requested model as an assigned or reserved vehicle.
 */
export interface ReservationVehicle {
  id: string;
  makeModel: string;
  imageUrl?: string | null;
  galleryUrls?: string[] | null;
  vehicleCategory?: string | null;
  type?: string | null;
  year?: number | null;
  seats?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  description?: string | null;
  pricePerDay?: number | null;
  status?: string | null;
  plateNumber?: string | null;
}

export const mapReservationVehicleFromDB = (vehicle: any): ReservationVehicle => ({
  id: vehicle.id,
  makeModel: vehicle.make_model,
  imageUrl: vehicle.image_url,
  galleryUrls: vehicle.gallery_urls,
  vehicleCategory: vehicle.vehicle_category,
  type: vehicle.vehicle_type,
  year: vehicle.year,
  seats: vehicle.seats,
  fuelType: vehicle.fuel_type,
  transmission: vehicle.transmission,
  description: vehicle.description,
  pricePerDay: vehicle.price_per_day,
  status: vehicle.status,
  plateNumber: vehicle.plate_number,
});

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

/**
 * Resolve by immutable ID when present. Older inquiries only have the saved
 * vehicle name: match them only if exactly one fleet record has that name.
 * Ambiguous or deleted matches must not show a different vehicle's image.
 */
export const resolveReservationVehicle = (
  vehicles: ReservationVehicle[],
  requestedVehicleId?: string | null,
  preferredVehicle?: string | null
): ReservationVehicle | null => {
  if (requestedVehicleId) {
    return vehicles.find(vehicle => vehicle.id === requestedVehicleId) || null;
  }

  if (!preferredVehicle?.trim()) return null;
  const matches = vehicles.filter(
    vehicle => normalizeName(vehicle.makeModel) === normalizeName(preferredVehicle)
  );
  return matches.length === 1 ? matches[0] : null;
};

/**
 * A requested model can have a public catalogue photo even when an old
 * inquiry has no stable fleet UUID or the private fleet lookup fails.
 * Catalogue images must NEVER be represented as photos of an assigned unit.
 */
export interface ReservationVehicleDisplay {
  vehicle: ReservationVehicle | null;
  photos: string[];
  mediaSource: 'fleet' | 'catalog' | 'none';
  matchedFleetRecord: boolean;
}

const safeImageUrls = (...values: unknown[]): string[] => {
  const urls: string[] = [];
  for (const value of values) {
    if (Array.isArray(value)) {
      urls.push(...safeImageUrls(...value));
    } else if (typeof value === 'string') {
      const url = value.trim();
      // Accept web images and local public assets, not unsafe URI protocols.
      if (/^https?:\/\//i.test(url) || (url.startsWith('/') && !url.startsWith('//'))) {
        urls.push(url);
      }
    }
  }
  return Array.from(new Set(urls));
};

const findExactCatalogVehicle = (modelName?: string | null): ReservationVehicle | null => {
  if (!modelName?.trim()) return null;
  const matches = VEHICLES.filter(vehicle =>
    normalizeName(vehicle.name) === normalizeName(modelName)
  );
  if (matches.length !== 1) return null;
  const vehicle = matches[0];
  return {
    id: `catalog:${vehicle.id}`,
    makeModel: vehicle.name,
    imageUrl: vehicle.imageUrl || null,
    galleryUrls: vehicle.galleryUrls || [],
    vehicleCategory: vehicle.type,
    type: vehicle.type,
    seats: vehicle.seats,
    fuelType: vehicle.fuel,
    transmission: vehicle.transmission,
    description: vehicle.description,
    pricePerDay: vehicle.pricePerDay,
  };
};

export const resolveReservationVehicleDisplay = (
  vehicles: ReservationVehicle[],
  requestedVehicleId?: string | null,
  preferredVehicle?: string | null
): ReservationVehicleDisplay => {
  // Prefer the real fleet record; a matching name alone is sufficient
  // only when exactly one real record has that name.
  const fleetVehicle = resolveReservationVehicle(vehicles, requestedVehicleId, preferredVehicle);
  const fleetPhotos = fleetVehicle
    ? safeImageUrls(fleetVehicle.imageUrl, fleetVehicle.galleryUrls)
    : [];
  if (fleetVehicle && fleetPhotos.length > 0) {
    return { vehicle: fleetVehicle, photos: fleetPhotos, mediaSource: 'fleet', matchedFleetRecord: true };
  }

  // Fallback to the exact named public catalogue entry, never a similar name.
  // When a fleet record matches but lacks photos, keep its actual specs and
  // show catalogue photos explicitly as model reference material.
  const catalogVehicle = findExactCatalogVehicle(fleetVehicle?.makeModel || preferredVehicle);
  const catalogPhotos = catalogVehicle
    ? safeImageUrls(catalogVehicle.imageUrl, catalogVehicle.galleryUrls)
    : [];
  if (catalogPhotos.length > 0) {
    return {
      vehicle: fleetVehicle || catalogVehicle,
      photos: catalogPhotos,
      mediaSource: 'catalog',
      matchedFleetRecord: Boolean(fleetVehicle),
    };
  }

  return {
    vehicle: fleetVehicle,
    photos: [],
    mediaSource: 'none',
    matchedFleetRecord: Boolean(fleetVehicle),
  };
};
