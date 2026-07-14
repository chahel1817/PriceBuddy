const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function migrate() {
    console.log("Connecting to database...");
    
    // Use the existing db.js logic or simply the MYSQL_URL
    const uri = process.env.MYSQL_URL || process.env.DATABASE_URL;
    let poolConfig = {};

    if (uri) {
        try {
            const parsed = new URL(uri);
            poolConfig = {
                host: parsed.hostname,
                user: parsed.username,
                password: parsed.password,
                database: parsed.pathname.replace(/^\//, ''),
                port: parsed.port ? Number(parsed.port) : 3306,
                multipleStatements: true, // Needed for schema.sql
            };
            if (parsed.hostname.includes('tidbcloud.com')) {
                poolConfig.ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: true };
            }
        } catch (err) {
            console.error('Failed to parse database URI:', err);
            process.exit(1);
        }
    } else {
        console.error("Please set MYSQL_URL in your .env file to point to your TiDB connection string.");
        process.exit(1);
    }

    const connection = await mysql.createConnection(poolConfig);
    
    console.log("Connected! Reading schema.sql...");
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    
    console.log("Executing schema.sql...");
    try {
        await connection.query(schema);
        console.log("Schema created successfully!");
    } catch (err) {
        console.error("Error creating schema:", err.message);
    } finally {
        await connection.end();
    }
}

migrate();
