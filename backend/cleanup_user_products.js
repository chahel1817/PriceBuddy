const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pricebuddy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function cleanup() {
    const userEmail = 'chahel1817@gmail.com';
    console.log(`🧹 Cleaning up all products for user: ${userEmail}...`);

    try {
        // 1. Find the user ID
        const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [userEmail]);
        if (users.length === 0) {
            console.error(`❌ User ${userEmail} not found.`);
            process.exit(1);
        }
        const userId = users[0].id;
        console.log(`👤 Found user ID: ${userId}`);

        // 2. Find all product IDs for this user
        const [products] = await pool.query('SELECT id FROM products WHERE user_id = ?', [userId]);
        const productIds = products.map(p => p.id);

        if (productIds.length > 0) {
            console.log(`📦 Found ${productIds.length} products to delete.`);

            // 3. Delete from price_history (via product_sources)
            await pool.query(`
                DELETE FROM price_history 
                WHERE product_source_id IN (
                    SELECT id FROM product_sources WHERE product_id IN (?)
                )
            `, [productIds]);
            console.log('✅ Deleted price history.');

            // 4. Delete from product_sources
            await pool.query('DELETE FROM product_sources WHERE product_id IN (?)', [productIds]);
            console.log('✅ Deleted product sources.');

            // 5. Delete from products
            await pool.query('DELETE FROM products WHERE id IN (?)', [productIds]);
            console.log('✅ Deleted products.');
        } else {
            console.log('ℹ️ No products associated with this user.');
        }

        console.log(`\n✨ Cleanup complete for ${userEmail}! You can now start fresh.`);
    } catch (e) {
        console.error("❌ Cleanup failed:", e.message);
    } finally {
        process.exit();
    }
}

cleanup();
