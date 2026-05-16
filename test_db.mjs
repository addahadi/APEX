import sql from './backend_pfe/config/database.js';
sql`SELECT * FROM estimation`.then(res => { console.log(res); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });
