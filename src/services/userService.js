const { pool } = require('../config/database');

async function getUserById(id_usuario) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM usuarios WHERE id_usuario = ?',
            [id_usuario]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('[UserService] Error al obtener usuario:', error.message);
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
        console.error('[UserService] Error al registrar usuario:', error.message);
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
        console.error('[UserService] Error al verificar alias:', error.message);
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
        console.error('[UserService] Error al actualizar alias:', error.message);
        return false;
    }
}

module.exports = {
    getUserById,
    registerUser,
    aliasExists,
    updateAlias
};
