/**
 * Calendar-date helpers for the public rental inquiry wizard.
 * Work with YYYY-MM-DD as calendar dates (UTC midnight), never local timestamps.
 */

const bookingDate = (value: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? date
    : null;
};

/** A rental ends *after* it starts, not on the same calendar day. */
export const isValidBookingDateRange = (start: string, end: string): boolean =>
  bookingDate(start) !== null && bookingDate(end) !== null && end > start;

/** Earliest permissible return date: the calendar day following the start. */
export const minimumBookingReturnDate = (start: string): string => {
  const date = bookingDate(start);
  if (!date) return '';
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};

/** Ensure estimates with 0, negative, or fractional days never prefill a same-day return. */
export const estimatedBookingReturnDate = (start: string, days: number): string => {
  const date = bookingDate(start);
  if (!date) return '';
  date.setUTCDate(date.getUTCDate() + (Number.isFinite(days) ? Math.max(1, Math.ceil(days)) : 1));
  return date.toISOString().slice(0, 10);
};
