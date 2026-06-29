const { pgPool } = require('./lib/db');
const nodeCron = require('node-cron');

async function test() {
    const nowLocal = new Date();
    // Simulate user selecting time in UI (e.g. they select the current minute)
    // The browser gives local time string, e.g. "2026-06-29T06:40"
    const scheduledAtStr = nowLocal.getFullYear() + "-" + 
                           String(nowLocal.getMonth()+1).padStart(2,'0') + "-" +
                           String(nowLocal.getDate()).padStart(2,'0') + "T" +
                           String(nowLocal.getHours()).padStart(2,'0') + ":" +
                           String(nowLocal.getMinutes()).padStart(2,'0');

    console.log("UI string:", scheduledAtStr);
    const parsedDate = new Date(scheduledAtStr);
    console.log("Parsed Date (UTC):", parsedDate.toISOString());

    const result = await pgPool.query(
        `INSERT INTO messages (tag, content, scheduled_at, status) 
         VALUES ($1, $2, $3, 'pending') RETURNING *`,
        ['test_tag_pg', 'Hello PG', parsedDate]
    );

    const inserted = result.rows[0];
    console.log("Inserted in PG:", inserted);

    // Let's query as the cron job does
    const now = new Date();
    const res = await pgPool.query("SELECT * FROM messages WHERE status = 'pending' AND scheduled_at <= $1", [now]);
    console.log("Found by cron?", res.rows.map(r => r.id).includes(inserted.id));
    
    process.exit(0);
}

test();
