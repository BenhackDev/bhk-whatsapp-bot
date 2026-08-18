const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
const registry = require('../cli/serviceRegistry');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bhk_bot',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

let dbStatus = 'connecting'; // 'connected' | 'unconfigured' | 'connecting'

function getDatabaseStatus() {
    return dbStatus;
}

async function initializeDatabase() {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario VARCHAR(50) UNIQUE NOT NULL,
                alias VARCHAR(50) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS uso_bot (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario VARCHAR(50) NOT NULL,
                comando VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        dbStatus = 'connected';
        registry.setService('database', 'ok');
    } catch (error) {
        dbStatus = 'unconfigured';
        logger.debug('[DB] No se pudo conectar a la base de datos:', error.message);
        registry.setService('database', 'optional', 'funciones limitadas', true);
    }
}

module.exports = { pool, initializeDatabase, getDatabaseStatus };
