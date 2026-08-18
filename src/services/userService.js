const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Aviso único y deduplicado cuando la base de datos no está disponible.
 * Evita imprimir "Error al obtener/registrar/..." en cada comando.
 */
function logDbUnavailable(operation) {
    logger.debug(`[UserService] ${operation}: base de datos no disponible.`);
    logger.once('db.unavailable', () => {
        logger.warn('🟡 Base de datos no configurada. El bot funcionará con funciones limitadas.');
    });
}

async function getUserById(id_usuario) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM usuarios WHERE id_usuario = ?',
            [id_usuario]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        logDbUnavailable('getUserById');
        return null;
    }
}

async function registerUser(id_usuario) {
    try {
        const existe = await getUserById(id_usuario);
        if (existe) return existe;

        const [result] = await pool.execute(
            'INSERT INTO usuarios (id_usuario) VALUES (?)',
            [id_usuario]
        );
        return { id: result.insertId, id_usuario, alias: null };
    } catch (error) {
        logDbUnavailable('registerUser');
        return null;
    }
}

async function aliasExists(alias) {
    try {
        const [rows] = await pool.execute(
            'SELECT id FROM usuarios WHERE alias = ?',
            [alias]
        );
        return rows.length > 0;
    } catch (error) {
        logDbUnavailable('aliasExists');
        return false;
    }
}

async function updateAlias(id_usuario, alias) {
    try {
        await pool.execute(
            'UPDATE usuarios SET alias = ? WHERE id_usuario = ?',
            [alias, id_usuario]
        );
        return true;
    } catch (error) {
        logDbUnavailable('updateAlias');
        return false;
    }
}

module.exports = {
    getUserById,
    registerUser,
    aliasExists,
    updateAlias
};
