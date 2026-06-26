require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("UPDATE leads_monitoring SET attendant_id = s.attendant_id FROM sellers s WHERE leads_monitoring.attendant_name LIKE s.name || '%' AND leads_monitoring.attendant_id IS NULL")
  .then(res => { console.log('Rows updated:', res.rowCount); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
