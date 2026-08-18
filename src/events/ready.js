const startup = require('../cli/startup');

let readyShown = false;

function handleReady() {
    if (readyShown) return;
    readyShown = true;
    // La capa CLI muestra el frame final con el tiempo de inicio.
    startup.done();
}

module.exports = { handleReady };

