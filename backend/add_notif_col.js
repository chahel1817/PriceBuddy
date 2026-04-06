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
    console.log("⚙️  Adding 'notifications_active' column to users...");
    try {
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN notifications_active BOOLEAN DEFAULT FALSE AFTER email
        `);
        console.log("✅ Column 'notifications_active' added successfully.");
    } catch (e) {
        if (e.code === 'ER_DUP_COLUMN_NAME') {
            console.log("ℹ️  Column 'notifications_active' already exists.");
        } else {
            console.error("❌ Migration failed:", e.message);
        }
    } finally {
        process.exit();
    }
}

migrate();
