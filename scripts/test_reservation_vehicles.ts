import assert from 'node:assert/strict';
import test from 'node:test';
import { buildReservationVehicleSnapshot, readReservationVehicleSnapshot, resolveReservationVehicle, resolveReservationVehicleDisplay, type ReservationVehicle } from '../src/lib/reservationVehicles';

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

test('Book Ride saves full public Prado specifications and a multi-photo gallery', () => {
  const snapshot = buildReservationVehicleSnapshot({
    id: 'toyota-prado', name: 'Toyota Land Cruiser Prado',
    type: 'Heavy SUV', seats: 7, fuel: 'Diesel', transmission: 'Automatic',
    pricePerDay: 150, engine: '3.0L D-4D Turbo Diesel',
    imageUrl: 'https://example.com/one.jpg',
    galleryUrls: ['https://example.com/one.jpg', 'https://example.com/two.jpg'],
    features: ['Four-wheel drive', 'Air conditioning'],
    detailedSpecs: {
      engineSize: '2982 cc',
      drivetrain: '4WD',
      groundClearance: '215 mm',
      fuelCapacity: '150 L',
      bestFor: 'Upcountry',
    },
    description: 'Premium vehicle'
  }, 'catalog');
  assert.equal(snapshot.source, 'catalog');
  assert.equal(snapshot.makeModel, 'Toyota Land Cruiser Prado');
  assert.deepEqual(snapshot.galleryUrls, ['https://example.com/one.jpg', 'https://example.com/two.jpg']);
  assert.deepEqual(snapshot.features, ['Four-wheel drive', 'Air conditioning']);
  assert.equal(snapshot.specDrivetrain, '4WD');
  assert.equal(snapshot.engineLabel, '3.0L D-4D Turbo Diesel');
  assert.equal(snapshot.specBestFor, 'Upcountry');
  assert.equal(snapshot.pricePerDay, 150);
});

test('saved inquiry gallery takes priority over later fleet or catalogue changes', () => {
  const snapshot = buildReservationVehicleSnapshot({
    id: 'fleet-uuid', name: 'Toyota Land Cruiser Prado',
    imageUrl: 'https://example.com/original.jpg',
    galleryUrls: ['https://example.com/second.jpg'],
    features: ['Original feature']
  }, 'fleet');
  const display = resolveReservationVehicleDisplay([
    { id: 'fleet-uuid', makeModel: 'Toyota Land Cruiser Prado',
      imageUrl: 'https://example.com/new-photo.jpg', features: ['Changed'] }
  ], 'fleet-uuid', 'Toyota Land Cruiser Prado', snapshot);
  assert.equal(display.mediaSource, 'snapshot');
  assert.equal(display.savedSource, 'fleet');
  assert.equal(display.vehicle?.features?.[0], 'Original feature');
  assert.deepEqual(display.photos, ['https://example.com/original.jpg', 'https://example.com/second.jpg']);
});

test('legacy inquiries without snapshots retain unique-name and catalogue fallback', () => {
  const display = resolveReservationVehicleDisplay([], null, 'Toyota Land Cruiser Prado', null);
  assert.equal(display.mediaSource, 'catalog');
  assert.ok(display.photos.length >= 2);
  assert.equal(display.vehicle?.features?.length, 6);
  assert.equal(display.vehicle?.specBestFor !== undefined, true);
});

test('malformed snapshots and mismatched IDs do not override requested vehicle', () => {
  const wrong = buildReservationVehicleSnapshot({
    id: 'wrong-vehicle', name: 'Toyota Land Cruiser Prado',
    imageUrl: 'https://example.com/wrong.jpg'
  }, 'fleet');
  const display = resolveReservationVehicleDisplay([], 'expected-vehicle', 'Toyota Land Cruiser Prado', wrong);
  assert.equal(display.mediaSource, 'catalog');
  assert.equal(display.photos.includes('https://example.com/wrong.jpg'), false);
  assert.equal(readReservationVehicleSnapshot({ makeModel: 'Invalid', source: 'spoofed' }), null);
});

test('snapshot sanitizer never stores registration or internal fleet data', () => {
  const data = {
    id: 'toyota-prado', name: 'Toyota Land Cruiser Prado',
    imageUrl: 'javascript:alert(1)', galleryUrls: ['data:image/svg+xml,bad', 'https://example.com/good.jpg'],
    plateNumber: 'PRIVATE-REG', insuranceExpiry: '2030-01-01',
  };
  const snapshot = buildReservationVehicleSnapshot(data, 'catalog');
  assert.equal('plateNumber' in snapshot, false);
  assert.equal('insuranceExpiry' in snapshot, false);
  assert.deepEqual(snapshot.galleryUrls, ['https://example.com/good.jpg']);
});
