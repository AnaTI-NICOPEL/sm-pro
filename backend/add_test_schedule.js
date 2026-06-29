const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const now = new Date();
now.setSeconds(now.getSeconds() + 10); // 10 seconds from now

db.run(
    'INSERT INTO messages (tag, content, scheduled_at, status) VALUES (?, ?, ?, ?)',
    ['test_tag', 'Test Message Content', now.toISOString(), 'pending'],
    function(err) {
        if (err) return console.error(err);
        console.log(`Inserted schedule with ID ${this.lastID} for time: ${now.toISOString()}`);
    }
);
