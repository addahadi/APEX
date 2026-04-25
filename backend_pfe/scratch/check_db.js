import sql from '../config/database.js';

async function checkTable() {
  try {
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'field_types'
    `;
    console.log('Columns in field_types:', columns.map(c => c.column_name));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkTable();
