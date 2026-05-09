import postgres from 'postgres';

const sql = postgres(process.env.SUPABASE_DB_URL, { prepare: false });

async function run() {
  console.log('Running migration...');

  await sql.unsafe(`
    ALTER TABLE service_config
      ADD COLUMN IF NOT EXISTS formula_id uuid REFERENCES formulas(formula_id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS unit_id    uuid REFERENCES units(unit_id)       ON DELETE SET NULL
  `);
  console.log('OK: service_config updated (formula_id, unit_id)');

  await sql.unsafe(`
    ALTER TABLE estimation_detail_service
      ADD COLUMN IF NOT EXISTS unit_price_snapshot      double precision,
      ADD COLUMN IF NOT EXISTS exchange_rate_snapshot    double precision,
      ADD COLUMN IF NOT EXISTS project_details_id       uuid REFERENCES project_details(id) ON DELETE CASCADE
  `);
  console.log('OK: estimation_detail_service updated (snapshots + project_details_id)');

  await sql.unsafe(`
    CREATE INDEX IF NOT EXISTS idx_eds_project_details
      ON estimation_detail_service(project_details_id)
  `);
  console.log('OK: index created');

  await sql.end();
  console.log('Migration complete!');
}

run().catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
