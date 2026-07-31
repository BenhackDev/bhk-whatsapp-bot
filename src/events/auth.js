let authShown = false;

function handleAuthenticated() {
    if (authShown) return;
    authShown = true;
    console.log('[AUTH] ✅ Sesión autenticada correctamente');
}

function handleAuthFailure(msg) {
    console.error('[AUTH] ❌ Error de autenticación:', msg);
}

module.exports = { handleAuthenticated, handleAuthFailure };
