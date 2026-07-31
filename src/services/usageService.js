const { pool } = require('../config/database');

async function logUsage(command, userId) {
    try {
        await pool.execute(
            'INSERT INTO uso_bot (id_usuario, comando) VALUES (?, ?)',
            [userId, command]
        );
    } catch (e) {}
}

module.exports = { logUsage };
