BEGIN;

-- 1. Link service_config to a formula (for quantity computation)
ALTER TABLE service_config
  ADD COLUMN IF NOT EXISTS formula_id uuid REFERENCES formulas(formula_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unit_id    uuid REFERENCES units(unit_id)       ON DELETE SET NULL;

-- 2. Freeze unit price at save time (mirrors estimation_detail_material)
ALTER TABLE estimation_detail_service
  ADD COLUMN IF NOT EXISTS unit_price_snapshot      double precision,
  ADD COLUMN IF NOT EXISTS exchange_rate_snapshot    double precision,
  ADD COLUMN IF NOT EXISTS project_details_id       uuid REFERENCES project_details(id) ON DELETE CASCADE;

-- 3. Index for fast leaf lookups (same pattern as materials)
CREATE INDEX IF NOT EXISTS idx_eds_project_details
  ON estimation_detail_service(project_details_id);

COMMIT;
