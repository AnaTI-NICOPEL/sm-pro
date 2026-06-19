const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    require('dotenv').config({ path: '.env.local' });
    require('dotenv').config(); // fallback
}

let pgPool;

if (process.env.DATABASE_URL) {
    pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
} else {
    console.warn('DATABASE_URL not found in environment');
}

module.exports = { pgPool };
