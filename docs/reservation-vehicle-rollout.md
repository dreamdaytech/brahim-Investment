# Book Ride → Complete Reservation Vehicle Details

## User flow

1. A visitor clicks **Book Ride** on a vehicle from Home or Fleet.
2. The booking form pre-selects that vehicle ID and displays its **full public catalogue/fleet details**, including a browsable photo gallery, features and technical specifications.
3. When the visitor submits their inquiry, the form captures an immutable **public-only vehicle snapshot**: model, category, seats, fuel, transmission, description, features, rates, detailed specs and image/gallery URLs.
4. **Admin → Reservations → View complete vehicle details** uses the saved snapshot before attempting to resolve current fleet data.
5. The submission confirmation also displays the selected vehicle, gallery, and request details.

**Requested vehicle is not an allocated fleet unit**. Catalogue photos are labelled as model reference material.

## Backward compatibility

- Existing inquiries, names, inquiry references, approval/decline/reset, and dispatch remain unchanged.
- New inquiries also save `requested_vehicle_id` for live database fleet vehicles.
- Historical name-only inquiries still resolve by unique fleet match or an exact public catalogue model name. Never guess a fleet unit when the model has duplicates.
- If optional columns are missing from a database, submission gracefully retries with the remaining legacy columns.
- If a vehicle is edited later, the new inquiry's saved snapshot still displays what was selected at submission time.
- Only public vehicle details are copied; do not include plate numbers, registration, insurance, internal notes, drivers or maintenance documents.

## Supabase database

The confirmed Brahim Investment Group Supabase project has ID `oxxdkxsjnhpbprmjxtgs`.
Both new schema changes are additive and must be applied to **that project only**:

- `supabase/migrations/20261114_add_requested_vehicle_to_inquiries.sql` (nullable UUID reference, with `ON DELETE SET NULL`)
- `supabase/migrations/20261114_add_reservation_vehicle_snapshot.sql` (nullable JSONB public vehicle snapshot)

Existing inquiry rows are untouched. The snapshot becomes persistent for **new inquiries after deployment**; historical records are not retroactively rewritten.

## QA before and after deployment

- GitHub validation: `npm ci`, `npm run lint`, `npm run build`, `npm run test:reservations`.
- From Fleet click Book Ride; confirm the correct selected vehicle and full gallery appear at Step 2.
- Confirm dropdown selection updates images, features and technical specifications.
- Submit an inquiry for a selected database fleet vehicle; check the saved row's `requested_vehicle_id` and `requested_vehicle_snapshot` in the verified database without exposing customer PII.
- Open that inquiry in Admin → Reservations. Confirm the same photos and specs appear even if the selected fleet record is later updated.
- Confirm older Prado inquiries still display clearly-labelled catalogue photos, not a guessed one of several identical fleet units.
- Verify status changes, filters and dispatch flow are unaffected.
- Test mobile gallery thumbnails and modal close/escape behavior.

## Separate security review needed

The current project has existing overly-permissive inquiry policies (public SELECT/UPDATE/DELETE) and RLS is disabled on `dismissed_alerts`. These pre-existing concerns are not changed in this feature branch because changing them without scoping authentication and public booking behavior could interrupt the platform. Review them as a separate security fix.
