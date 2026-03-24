const pool = require('./db.js');

async function run() {
    try {
        const [rows] = await pool.query('SELECT p.id, p.name, COUNT(ph.id) as changes, MAX(ph.price)-MIN(ph.price) as diff FROM products p JOIN product_sources s ON p.id=s.product_id JOIN price_history ph ON s.id=ph.product_source_id GROUP BY p.id ORDER BY diff DESC LIMIT 1');
        console.log("Max diff:", rows[0]);

        const [r2] = await pool.query('SELECT p.id, p.name, COUNT(ph.id) as changes FROM products p JOIN product_sources s ON p.id=s.product_id JOIN price_history ph ON s.id=ph.product_source_id GROUP BY p.id ORDER BY changes DESC LIMIT 1');
        console.log("Max changes:", r2[0]);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

run();
