const { start } = require('./src/bootstrap');

start().catch((err) => {
    console.error('Démarrage impossible :', err);
    process.exit(1);
});
