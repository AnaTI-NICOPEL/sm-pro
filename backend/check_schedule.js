const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.all("SELECT * FROM messages WHERE status = 'pending'", (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Pending messages:", rows);
    
    const now = new Date();
    console.log("Current time (now):", now.toISOString());
    console.log("Local time (now):", now.toString());

    rows.forEach(row => {
        const scheduledTime = new Date(row.scheduled_at);
        console.log(`Msg ID ${row.id}: scheduled_at=${row.scheduled_at} -> parsed=${scheduledTime.toISOString()} -> local=${scheduledTime.toString()}`);
        console.log(`Is scheduledTime <= now ? ${scheduledTime <= now}`);
    });
});
