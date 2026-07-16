-- ============================================================
-- Spares & Parts — New Tables
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Main spares purchase record
CREATE TABLE IF NOT EXISTS spares_purchases (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id        UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  supplier_id       UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  purchase_date     DATE DEFAULT CURRENT_DATE,
  status            TEXT NOT NULL DEFAULT 'Completed',
  notes             TEXT,
  cost              DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Line items for each spares purchase
CREATE TABLE IF NOT EXISTS spares_items (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spares_purchase_id   UUID REFERENCES spares_purchases(id) ON DELETE CASCADE,
  description          TEXT NOT NULL,
  quantity             INTEGER NOT NULL DEFAULT 1,
  unit_cost            DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE spares_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE spares_items ENABLE ROW LEVEL SECURITY;

-- Public access policies
CREATE POLICY "Allow all on spares_purchases" ON spares_purchases
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on spares_items" ON spares_items
  FOR ALL USING (true) WITH CHECK (true);
