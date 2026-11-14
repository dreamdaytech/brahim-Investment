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
