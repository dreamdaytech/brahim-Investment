-- driver_documents table
-- Stores uploaded license scans, ID copies, medical certs, etc. per driver.
CREATE TABLE IF NOT EXISTS driver_documents (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id     UUID        NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  doc_type      TEXT        NOT NULL DEFAULT 'other',
  label         TEXT        NOT NULL,
  file_url      TEXT        NOT NULL,
  file_name     TEXT,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON driver_documents(driver_id);

ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access - driver_documents"
  ON driver_documents FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- vehicle_documents table
-- Stores uploaded insurance certs, roadworthy docs, etc. per vehicle.
CREATE TABLE IF NOT EXISTS vehicle_documents (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id    UUID        NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  doc_type      TEXT        NOT NULL DEFAULT 'other',
  label         TEXT        NOT NULL,
  file_url      TEXT        NOT NULL,
  file_name     TEXT,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_documents_vehicle_id ON vehicle_documents(vehicle_id);

ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access - vehicle_documents"
  ON vehicle_documents FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Ensure storage buckets exist and are public
INSERT INTO storage.buckets (id, name, public)
  VALUES ('driver-assets', 'driver-assets', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('vehicle-assets', 'vehicle-assets', true)
  ON CONFLICT (id) DO NOTHING;
