const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const hasLocalDbConfig = Boolean(
    process.env.DB_HOST ||
    process.env.DB_USER ||
    process.env.DB_PASSWORD ||
    process.env.DB_NAME ||
    process.env.DB_PORT
);

const localConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pricebuddy',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: 'Z'
};

const mysqlEnvConfig = process.env.MYSQL_URL || {
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'pricebuddy',
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: 'Z'
};

const pool = mysql.createPool(hasLocalDbConfig ? localConfig : mysqlEnvConfig);

// Test connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        const [[dbInfo]] = await connection.query('SELECT DATABASE() AS database_name');
        console.log(`MySQL Database connected successfully: ${dbInfo.database_name}`);
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
};

testConnection();

module.exports = pool;
