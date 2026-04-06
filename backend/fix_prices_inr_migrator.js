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

const USD_TO_INR = 83.0;

async function migrate() {
    console.log("🚀 Starting USD to INR migration for existing products...");

    try {
        // 1. Get all products on Amazon or eBay
        const [rows] = await pool.query(`
            SELECT s.id, s.last_price, s.product_url 
            FROM product_sources s
        `);

        for (const row of rows) {
            const url = row.product_url.toLowerCase();
            if (url.includes('amazon') || url.includes('ebay')) {
                // Check if price is likely in USD (usually less than 5000 for phones/electronics)
                const oldPrice = parseFloat(row.last_price);
                if (oldPrice > 0 && oldPrice < 5000) {
                    const newPrice = parseFloat((oldPrice * USD_TO_INR).toFixed(2));
                    console.log(`💰 Converting ID ${row.id}: ₹${oldPrice} (USD) -> ₹${newPrice} (INR)`);

                    // Update product_sources
                    await pool.query('UPDATE product_sources SET last_price = ? WHERE id = ?', [newPrice, row.id]);

                    // Update all history for this product
                    await pool.query('UPDATE price_history SET price = price * ? WHERE product_source_id = ? AND price < 5000', [USD_TO_INR, row.id]);

                    console.log(`✅ ID ${row.id} migrated successfully.`);
                } else {
                    console.log(`⏭️ Skipping ID ${row.id} - Price ₹${oldPrice} already seems to be in INR or invalid.`);
                }
            } else {
                console.log(`⏭️ Skipping ID ${row.id} - Source is not Amazon/eBay.`);
            }
        }

        console.log("\n✨ Migration Complete!");
    } catch (e) {
        console.error("❌ Migration failed:", e.message);
    } finally {
        process.exit();
    }
}

migrate();
