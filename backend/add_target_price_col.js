const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pricebuddy',
});

async function migrate() {
    console.log("⚙️  Adding 'target_price' column to product_sources...");
    try {
        await pool.query(`
            ALTER TABLE product_sources 
            ADD COLUMN target_price DECIMAL(15, 2) DEFAULT NULL AFTER last_price
        `);
        console.log("✅ Column 'target_price' added successfully.");
    } catch (e) {
        if (e.code === 'ER_DUP_COLUMN_NAME') {
            console.log("ℹ️  Column 'target_price' already exists.");
        } else {
            console.error("❌ Migration failed:", e.message);
        }
    } finally {
        process.exit();
    }
}

migrate();
