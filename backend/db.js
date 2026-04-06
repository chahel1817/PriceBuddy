const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool(process.env.MYSQL_URL || {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'pricebuddy',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database connected successfully.');
        connection.release();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
};

testConnection();

module.exports = pool;
