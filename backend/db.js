const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const isProductionLike = Boolean(process.env.RENDER) || process.env.NODE_ENV === 'production';
const isManagedRuntime = Boolean(
    process.env.RENDER ||
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_PROJECT_ID ||
    process.env.RAILWAY_SERVICE_ID
);

function getConnectionUriFromEnv() {
    return (
        process.env.MYSQL_URL ||
        process.env.DATABASE_URL ||
        process.env.CLEARDB_DATABASE_URL ||
        process.env.JAWSDB_URL
    );
}

function buildObjectConfigFromEnv(prefix) {
    const host = process.env[`${prefix}HOST`];
    const user = process.env[`${prefix}USER`];
    const password = process.env[`${prefix}PASSWORD`];
    const database = process.env[`${prefix}DATABASE`];
    const portRaw = process.env[`${prefix}PORT`];
    const port = portRaw ? Number(portRaw) : undefined;

    const obj = {
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        timezone: 'Z'
    };

    // Drop undefined keys (mysql2 will otherwise treat them oddly in some cases)
    Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
    return obj;
}

function buildDbObjectConfig() {
    // Prefer common "MYSQL*" envs (often used by managed MySQL providers)
    const mysqlCfg = buildObjectConfigFromEnv('MYSQL');
    if (mysqlCfg.host || mysqlCfg.user || mysqlCfg.database) return mysqlCfg;

    // Fallback to app-specific DB_* envs (local/dev or custom deployments)
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME;
    const portRaw = process.env.DB_PORT;
    const port = portRaw ? Number(portRaw) : undefined;

    const cfg = {
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        timezone: 'Z'
    };
    Object.keys(cfg).forEach((k) => cfg[k] === undefined && delete cfg[k]);
    return cfg;
}

function hasAnyDbObjectConfig(cfg) {
    return Boolean(cfg?.host || cfg?.user || cfg?.database || cfg?.password || cfg?.port);
}

function getPoolConfig() {
    const uri = getConnectionUriFromEnv();
    if (uri) return uri;

    const cfg = buildDbObjectConfig();
    const hasCfg = hasAnyDbObjectConfig(cfg);

    // In local/dev we allow reasonable defaults if nothing is provided.
    if (!hasCfg && !isProductionLike && !isManagedRuntime) {
        return {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'pricebuddy',
            port: 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            timezone: 'Z'
        };
    }

    // In production-like environments, defaulting to localhost causes ECONNREFUSED on Render.
    if (!hasCfg && (isProductionLike || isManagedRuntime)) {
        throw new Error(
            [
                'Missing MySQL configuration in production.',
                'Set one of: MYSQL_URL, DATABASE_URL, CLEARDB_DATABASE_URL, JAWSDB_URL',
                'or provide MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE/MYSQLPORT (or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME/DB_PORT).'
            ].join(' ')
        );
    }

    return cfg;
}

const pool = mysql.createPool(getPoolConfig());

// Test connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        const [[dbInfo]] = await connection.query('SELECT DATABASE() AS database_name');
        console.log(`MySQL Database connected successfully: ${dbInfo.database_name}`);
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', {
            code: err?.code,
            message: err?.message,
            errno: err?.errno
        });
    }
};

testConnection();

module.exports = pool;
