# Reservation Vehicle Previews — safe rollout

This feature adds a vehicle photo/specification preview to **Admin → Reservations**
and to the public inquiry selection and successful submission screens.

## Compatibility and data integrity

- Existing inquiries retain `preferredvehicle` and their original reference IDs.
- New inquiries optionally persist `requested_vehicle_id` as a nullable UUID reference to
  `vehicles.id`. This is a **requested vehicle**, not a confirmed assignment.
- Older inquiries are matched by name **only if exactly one** current fleet record has
  that name. If two or more vehicles share the same model, show the saved name and an
  unavailable-image state instead of guessing.
- Removed vehicle records do not delete inquiries: the new foreign key uses
  `ON DELETE SET NULL` and the saved text field remains.
- No changes are made to approve/decline, dispatch, inquiry search, or role restrictions.

## Database change (not applied automatically)

The Supabase project connected to the current development workspace could not be
identified as the Brahim Investment production database. Therefore **do not run this
migration on an unrelated project**.

Once the correct Brahim Supabase project is confirmed and backed up, apply:

`supabase/migrations/20261114_add_requested_vehicle_to_inquiries.sql`

The migration adds a nullable column and index without removing or rewriting data.
If the code is deployed before this migration, the public form retries the existing
inquiry insert **without** the optional field only when Supabase reports that the
new column is missing. The admin preview still works via unique-name matching.

## QA checklist

1. Run `npm ci`, `npm run lint`, `npm run build`, and
   `npm run test:reservations` in the checkout.
2. Confirm old and new inquiries still appear under **Admin → Reservations**.
3. Confirm search, status filters, Approve, Decline, Reset and Log Dispatch work
   as before.
4. Submit an inquiry for a live fleet vehicle. Confirm the selected photo and
   specifications appear on step 2 and in the success summary, with the actual
   generated inquiry reference rather than a sample reference.
5. After applying the migration to the verified project, confirm the new row's
   `requested_vehicle_id` matches the selected `vehicles.id`.
6. Temporarily remove the new column in a local staging copy and confirm
   the legacy insert fallback still succeeds without creating a duplicate.
7. Verify old inquiries containing non-unique names show the saved name but
   no guessed photo.
8. Verify the modal closes with its Close button and Escape; check desktop and mobile.
9. Confirm that customer inquiry data is never exposed through a public lookup
   endpoint. This feature does **not** add an unauthenticated "My Inquiries" page.

## Deployment order

- Review the PR and run the QA steps in staging.
- Apply the additive migration to the verified Brahim Supabase project.
- Deploy the frontend.
- Smoke-test an inquiry and an admin reservation record.
- Only merge/deploy after tests and correct environment identification.
