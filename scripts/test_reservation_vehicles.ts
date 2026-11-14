import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveReservationVehicle, resolveReservationVehicleDisplay, type ReservationVehicle } from '../src/lib/reservationVehicles';

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

test('Prado inquiry without a stored fleet ID gets catalogue gallery references', () => {
  const display = resolveReservationVehicleDisplay([], null, 'Toyota Land Cruiser Prado');
  assert.equal(display.mediaSource, 'catalog');
  assert.equal(display.matchedFleetRecord, false);
  assert.equal(display.vehicle?.makeModel, 'Toyota Land Cruiser Prado');
  assert.ok(display.photos.length >= 2);
  assert.ok(display.photos.every(url => url.startsWith('https://')));
});

test('exact matching ignores case and extra whitespace for historical catalogue names', () => {
  const display = resolveReservationVehicleDisplay([], null, '  TOYOTA  LAND   CRUISER PRADO ');
  assert.equal(display.mediaSource, 'catalog');
  assert.equal(display.vehicle?.makeModel, 'Toyota Land Cruiser Prado');
});

test('fleet photographs take priority over catalogue images when a saved vehicle ID matches', () => {
  const display = resolveReservationVehicleDisplay(
    [{ id: 'fleet-prado', makeModel: 'Toyota Land Cruiser Prado',
      imageUrl: 'https://example.com/actual.jpg',
      galleryUrls: ['https://example.com/actual.jpg', 'https://example.com/side.jpg'] }],
    'fleet-prado', 'Toyota Land Cruiser Prado'
  );
  assert.equal(display.mediaSource, 'fleet');
  assert.equal(display.matchedFleetRecord, true);
  assert.deepEqual(display.photos, [
    'https://example.com/actual.jpg', 'https://example.com/side.jpg'
  ]);
});

test('fleet record without photos may display clearly-labelled catalogue model references', () => {
  const display = resolveReservationVehicleDisplay(
    [{ id: 'prado-db-uuid', makeModel: 'Toyota Land Cruiser Prado', status: 'Unavailable' }],
    'prado-db-uuid', 'Toyota Land Cruiser Prado'
  );
  assert.equal(display.mediaSource, 'catalog');
  assert.equal(display.matchedFleetRecord, true);
  assert.equal(display.vehicle?.status, 'Unavailable');
  assert.ok(display.photos.length >= 2);
});

test('duplicate fleet model names never assign a guessed fleet vehicle', () => {
  const display = resolveReservationVehicleDisplay([
    { id: 'prado-a', makeModel: 'Toyota Land Cruiser Prado', imageUrl: 'https://example.com/a.jpg' },
    { id: 'prado-b', makeModel: 'Toyota Land Cruiser Prado', imageUrl: 'https://example.com/b.jpg' }
  ], null, 'Toyota Land Cruiser Prado');
  assert.equal(display.mediaSource, 'catalog');
  assert.equal(display.matchedFleetRecord, false);
  assert.equal(display.photos.includes('https://example.com/a.jpg'), false);
});

test('vehicle from live fleet not in catalogue still shows its own gallery', () => {
  const display = resolveReservationVehicleDisplay([
    { id: 'big-boy', makeModel: 'Toyota Big Boy',
      imageUrl: 'https://example.com/big-boy.jpg' }
  ], null, 'Toyota Big Boy');
  assert.equal(display.mediaSource, 'fleet');
  assert.equal(display.vehicle?.makeModel, 'Toyota Big Boy');
  assert.deepEqual(display.photos, ['https://example.com/big-boy.jpg']);
});

test('unknown models do not silently display unrelated catalogue photographs', () => {
  const display = resolveReservationVehicleDisplay([], null, 'Toyota Big Boy');
  assert.equal(display.mediaSource, 'none');
  assert.equal(display.vehicle, null);
  assert.deepEqual(display.photos, []);
});

test('old inquiry pointing to deleted fleet vehicle only gets clearly-labelled model reference', () => {
  const display = resolveReservationVehicleDisplay([], 'deleted-fleet-id', 'Toyota Land Cruiser Prado');
  assert.equal(display.mediaSource, 'catalog');
  assert.equal(display.matchedFleetRecord, false);
});

test('disallowed image protocols are not forwarded into the UI', () => {
  const display = resolveReservationVehicleDisplay([
    { id: 'custom-vehicle', makeModel: 'Custom Vehicle',
      imageUrl: 'javascript:alert(1)',
      galleryUrls: ['data:image/svg+xml,invalid', 'https://example.com/valid.jpg'] }
  ], 'custom-vehicle', 'Custom Vehicle');
  assert.deepEqual(display.photos, ['https://example.com/valid.jpg']);
});
