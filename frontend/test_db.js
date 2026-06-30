const { pgPool } = require('./lib/db');

async function test() {
    try {
        const res = await pgPool.query(`
            INSERT INTO contatos (nome, telefone, tag, updated_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (telefone, tag)
            DO UPDATE SET nome = EXCLUDED.nome, updated_at = CURRENT_TIMESTAMP
            RETURNING (xmax = 0) AS inserted
        `, ['Test', '123', 'tag']);
        console.log("Success:", res.rows[0]);
    } catch (e) {
        console.error("Error:", e.message);
    }
    process.exit(0);
}

test();
