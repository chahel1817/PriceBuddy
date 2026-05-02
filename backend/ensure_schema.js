const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const tick = String.fromCharCode(96);

const statements = [
    `CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        target_price DECIMAL(10, 2) NOT NULL,
        status ENUM('ACTIVE', 'TRIGGERED', 'DISABLED') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        alert_id INT NOT NULL,
        message TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE
    )`,
    `CREATE OR REPLACE VIEW ${tick}product-sources${tick} AS SELECT * FROM product_sources`,
    'CREATE OR REPLACE VIEW notifcaitons AS SELECT * FROM notifications'
];

function getConnectionConfig() {
    if (process.argv.includes('--railway')) {
        if (!process.env.MYSQL_URL) {
            throw new Error('MYSQL_URL is required for --railway');
        }
        return process.env.MYSQL_URL;
    }

    return {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pricebuddy',
        port: process.env.DB_PORT || 3306
    };
}

async function main() {
    const connection = await mysql.createConnection(getConnectionConfig());

    for (const statement of statements) {
        await connection.query(statement);
    }

    const [[dbInfo]] = await connection.query('SELECT DATABASE() AS database_name');
    const [tables] = await connection.query('SHOW FULL TABLES');

    console.log(JSON.stringify({
        database: dbInfo.database_name,
        objects: tables
    }, null, 2));

    await connection.end();
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
