-- ── Expenses Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category          TEXT NOT NULL,
  amount            DECIMAL(12,2) NOT NULL DEFAULT 0,
  description       TEXT,
  driver_id         UUID REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id        UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  payment_method    TEXT DEFAULT 'Cash',
  status            TEXT DEFAULT 'Pending',
  expense_date      DATE NOT NULL,
  paid_date         DATE,
  logged_by         TEXT,
  approved_by       TEXT,
  notes             TEXT,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Driver Payroll Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS driver_payroll (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id         UUID REFERENCES drivers(id) ON DELETE CASCADE,
  month             TEXT NOT NULL,
  base_salary       DECIMAL(12,2) NOT NULL DEFAULT 0,
  allowances        DECIMAL(12,2) DEFAULT 0,
  deductions        DECIMAL(12,2) DEFAULT 0,
  net_pay           DECIMAL(12,2) GENERATED ALWAYS AS (base_salary + allowances - deductions) STORED,
  payment_method    TEXT DEFAULT 'Mobile Money',
  status            TEXT DEFAULT 'Pending',
  logged_by         TEXT,
  approved_by       TEXT,
  paid_date         DATE,
  notes             TEXT,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(driver_id, month)
);

-- ── Enable RLS & Add Public Policies ───────────────────────────
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_payroll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on expenses" ON expenses
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on driver_payroll" ON driver_payroll
  FOR ALL USING (true) WITH CHECK (true);
