const mysql = require('mysql2/promise');

async function test() {
    try {
        const pool = mysql.createPool({
            host: 'maglev.proxy.rlwy.net',
            user: 'root',
            password: 'aNnuGtIUgoAUttpjiLQqKzKZlMtktTtp',
            database: 'railway',
            port: 37697,
            ssl: { rejectUnauthorized: false }
        });
        const conn = await pool.getConnection();
        console.log("Connected using SSL!");
        conn.release();
        process.exit(0);
    } catch(err) {
        console.error("Failed:", err);
        process.exit(1);
    }
}
test();
