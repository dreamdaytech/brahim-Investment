import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveReservationVehicle, type ReservationVehicle } from '../src/lib/reservationVehicles';

const vehicles: ReservationVehicle[] = [
  { id: 'prado-1', makeModel: 'Toyota Land Cruiser Prado', imageUrl: '/prado1.jpg' },
  { id: 'hilux-1', makeModel: 'Toyota Hilux', imageUrl: '/hilux.jpg' },
];

test('new inquiries resolve to their stable vehicle ID', () => {
  assert.equal(resolveReservationVehicle(vehicles, 'prado-1', 'Toyota Hilux')?.id, 'prado-1');
});

test('legacy inquiries resolve a unique vehicle name', () => {
  assert.equal(resolveReservationVehicle(vehicles, null, '  toyota   hilux  ')?.id, 'hilux-1');
});

test('legacy inquiries do not guess when a name is shared by multiple records', () => {
  const twins = [...vehicles, { id: 'prado-2', makeModel: 'Toyota Land Cruiser Prado' }];
  assert.equal(resolveReservationVehicle(twins, null, 'Toyota Land Cruiser Prado'), null);
});

test('deleted or missing ID does not silently fall back to another vehicle with the same name', () => {
  assert.equal(resolveReservationVehicle(vehicles, 'deleted-prado', 'Toyota Land Cruiser Prado'), null);
});

test('unknown old inquiry retains its name without linking the wrong fleet vehicle', () => {
  assert.equal(resolveReservationVehicle(vehicles, null, 'Unknown Model'), null);
});

test('empty requested vehicle is not resolved', () => {
  assert.equal(resolveReservationVehicle(vehicles), null);
});
