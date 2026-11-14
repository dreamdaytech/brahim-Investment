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
  engineLabel?: string | null;
  features?: string[] | null;
  specEngineSize?: string | null;
  specDrivetrain?: string | null;
  specGroundClearance?: string | null;
  specFuelCapacity?: string | null;
  specBestFor?: string | null;
}

export interface ReservationVehicleSnapshot extends ReservationVehicle {
  source: 'fleet' | 'catalog';
  capturedAt: string;
}

export interface BookingVehicleDetails {
  id: string;
  name: string;
  type?: string | null;
  year?: number | null;
  seats?: number | null;
  fuel?: string | null;
  transmission?: string | null;
  pricePerDay?: number | null;
  imageUrl?: string | null;
  galleryUrls?: string[] | null;
  engine?: string | null;
  features?: string[] | null;
  description?: string | null;
  detailedSpecs?: {
    engineSize?: string | null;
    drivetrain?: string | null;
    groundClearance?: string | null;
    fuelCapacity?: string | null;
    bestFor?: string | null;
  } | null;
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
  engineLabel: vehicle.engine_label,
  features: vehicle.features,
  specEngineSize: vehicle.spec_engine_size,
  specDrivetrain: vehicle.spec_drivetrain,
  specGroundClearance: vehicle.spec_ground_clearance,
  specFuelCapacity: vehicle.spec_fuel_capacity,
  specBestFor: vehicle.spec_best_for,
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
  mediaSource: 'snapshot' | 'fleet' | 'catalog' | 'none';
  savedSource?: 'fleet' | 'catalog';
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
    engineLabel: vehicle.engine,
    features: vehicle.features,
    specEngineSize: vehicle.detailedSpecs?.engineSize,
    specDrivetrain: vehicle.detailedSpecs?.drivetrain,
    specGroundClearance: vehicle.detailedSpecs?.groundClearance,
    specFuelCapacity: vehicle.detailedSpecs?.fuelCapacity,
    specBestFor: vehicle.detailedSpecs?.bestFor,
  };
};


/**
 * Capture only customer-visible catalogue fields, never internal registration,
 * insurance, maintenance or ownership details. This snapshot is a requested
 * model at the time of inquiry, NOT a confirmed fleet assignment.
 */
export const buildReservationVehicleSnapshot = (
  vehicle: BookingVehicleDetails,
  source: 'fleet' | 'catalog'
): ReservationVehicleSnapshot => ({
  id: vehicle.id,
  makeModel: vehicle.name,
  source,
  capturedAt: new Date().toISOString(),
  vehicleCategory: vehicle.type,
  type: vehicle.type,
  year: vehicle.year,
  seats: vehicle.seats,
  fuelType: vehicle.fuel,
  transmission: vehicle.transmission,
  pricePerDay: vehicle.pricePerDay,
  imageUrl: safeImageUrls(vehicle.imageUrl)[0] || null,
  galleryUrls: safeImageUrls(vehicle.imageUrl, vehicle.galleryUrls),
  engineLabel: vehicle.engine,
  description: vehicle.description,
  features: (vehicle.features || []).filter((item): item is string =>
    typeof item === 'string' && item.trim().length > 0).slice(0, 30),
  specEngineSize: vehicle.detailedSpecs?.engineSize,
  specDrivetrain: vehicle.detailedSpecs?.drivetrain,
  specGroundClearance: vehicle.detailedSpecs?.groundClearance,
  specFuelCapacity: vehicle.detailedSpecs?.fuelCapacity,
  specBestFor: vehicle.detailedSpecs?.bestFor,
});

/** Ignore malformed or untrusted older JSON instead of rendering arbitrary fields. */
export const readReservationVehicleSnapshot = (input: unknown): ReservationVehicleSnapshot | null => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  if (typeof value.makeModel !== 'string' || !value.makeModel.trim() ||
      (value.source !== 'fleet' && value.source !== 'catalog')) return null;
  const string = (key: string): string | undefined =>
    typeof value[key] === 'string' ? (value[key] as string).slice(0, 4000) : undefined;
  const number = (key: string): number | undefined =>
    typeof value[key] === 'number' && Number.isFinite(value[key]) ? value[key] as number : undefined;
  return {
    id: string('id') || '',
    makeModel: (string('makeModel') || '').slice(0, 250),
    source: value.source,
    capturedAt: string('capturedAt') || '',
    imageUrl: safeImageUrls(value.imageUrl)[0] || null,
    galleryUrls: safeImageUrls(value.galleryUrls).slice(0, 24),
    vehicleCategory: string('vehicleCategory'),
    type: string('type'),
    year: number('year'),
    seats: number('seats'),
    fuelType: string('fuelType'),
    transmission: string('transmission'),
    pricePerDay: number('pricePerDay'),
    description: string('description'),
    engineLabel: string('engineLabel'),
    features: Array.isArray(value.features)
      ? value.features.filter((item): item is string => typeof item === 'string')
          .slice(0, 30).map(item => item.slice(0, 300))
      : [],
    specEngineSize: string('specEngineSize'),
    specDrivetrain: string('specDrivetrain'),
    specGroundClearance: string('specGroundClearance'),
    specFuelCapacity: string('specFuelCapacity'),
    specBestFor: string('specBestFor'),
  };
};

export const resolveReservationVehicleDisplay = (
  vehicles: ReservationVehicle[],
  requestedVehicleId?: string | null,
  preferredVehicle?: string | null,
  savedSnapshot?: unknown
): ReservationVehicleDisplay => {
  const snapshot = readReservationVehicleSnapshot(savedSnapshot);
  if (snapshot) {
    const photos = safeImageUrls(snapshot.imageUrl, snapshot.galleryUrls);
    if (photos.length) {
      return {
        vehicle: snapshot, photos, mediaSource: 'snapshot', savedSource: snapshot.source,
        matchedFleetRecord: snapshot.source === 'fleet',
      };
    }
  }

  // Prefer the real fleet record; a matching name alone is sufficient
  // only when exactly one real record has that name.
  const fleetVehicle = resolveReservationVehicle(vehicles, requestedVehicleId, preferredVehicle);
  const fleetPhotos = fleetVehicle
    ? safeImageUrls(fleetVehicle.imageUrl, fleetVehicle.galleryUrls)
    : [];
  if (fleetVehicle && fleetPhotos.length > 0) {
    return { vehicle: snapshot || fleetVehicle, photos: fleetPhotos, mediaSource: 'fleet', matchedFleetRecord: true };
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
      vehicle: snapshot || fleetVehicle || catalogVehicle,
      photos: catalogPhotos,
      mediaSource: 'catalog',
      matchedFleetRecord: Boolean(fleetVehicle),
    };
  }

  return {
    vehicle: snapshot || fleetVehicle,
    photos: [],
    mediaSource: 'none',
    matchedFleetRecord: Boolean(fleetVehicle),
  };
};
