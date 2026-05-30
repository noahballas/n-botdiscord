const { runConsoleSetup } = require('../src/config/setupConsole');

runConsoleSetup({ force: process.argv.includes('--force') }).catch((err) => {
    console.error('Erreur configuration:', err);
    process.exit(1);
});
