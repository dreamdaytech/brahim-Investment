import assert from 'node:assert/strict';
import test from 'node:test';
import {
  estimatedBookingReturnDate,
  isValidBookingDateRange,
  minimumBookingReturnDate
} from '../src/lib/bookingDates';

test('return date must be strictly later than the start', () => {
  assert.equal(isValidBookingDateRange('2026-12-28', '2026-12-28'), false);
  assert.equal(isValidBookingDateRange('2026-12-28', '2026-12-27'), false);
  assert.equal(isValidBookingDateRange('2026-12-28', '2026-12-29'), true);
  assert.equal(isValidBookingDateRange('2026-12-28', '2027-01-07'), true);
});

test('missing or invalid dates are rejected before submission', () => {
  assert.equal(isValidBookingDateRange('', '2026-11-15'), false);
  assert.equal(isValidBookingDateRange('2026-11-14', ''), false);
  assert.equal(isValidBookingDateRange('2026-02-30', '2026-03-01'), false);
  assert.equal(isValidBookingDateRange('2026-11-14', '2026-11-15T00:00:00Z'), false);
});

test('date picker minimum crosses month and year boundaries', () => {
  assert.equal(minimumBookingReturnDate('2026-12-31'), '2027-01-01');
  assert.equal(minimumBookingReturnDate('2028-02-28'), '2028-02-29');
  assert.equal(minimumBookingReturnDate('2026-02-28'), '2026-03-01');
  assert.equal(minimumBookingReturnDate(''), '');
});

test('estimate never prepopulates same-day or earlier returns', () => {
  assert.equal(estimatedBookingReturnDate('2026-12-28', 0), '2026-12-29');
  assert.equal(estimatedBookingReturnDate('2026-12-28', -1), '2026-12-29');
  assert.equal(estimatedBookingReturnDate('2026-12-28', 2), '2026-12-30');
  assert.equal(estimatedBookingReturnDate('2026-12-28', Number.NaN), '2026-12-29');
});
