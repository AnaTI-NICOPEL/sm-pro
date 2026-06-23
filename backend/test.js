const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_w9krSGo8aBNi@ep-young-thunder-aqp1b18k-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

async function test() {
  try {
    // 1. Get the latest webhook logs
    const webhookRes = await pool.query('SELECT id, event_type, processing_result, payload, received_at FROM webhook_logs ORDER BY received_at DESC LIMIT 5');
    console.log('--- LATEST WEBHOOK LOGS ---');
    webhookRes.rows.forEach(r => {
      console.log(`[${r.received_at}] ${r.event_type} - ${r.processing_result}`);
      // Parse payload to see attendant
      try {
        const payload = JSON.parse(r.payload);
        if (payload.data && payload.data.attendant) {
           console.log(`  Attendant ID: ${payload.data.attendant.id}`);
           console.log(`  Attendant Name: ${payload.data.attendant.name}`);
        }
      } catch (e) {}
    });

    // 2. Get latest leads_monitoring
    const leadsRes = await pool.query('SELECT id, customer_name, status, attendant_name, attendant_id, response_time, created_at, answered_at FROM leads_monitoring ORDER BY created_at DESC LIMIT 5');
    console.log('\n--- LATEST LEADS MONITORING ---');
    console.table(leadsRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

test();
