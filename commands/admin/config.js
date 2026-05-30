const { buildConfigCommand } = require('../../src/handlers/config/builder');
const { openPanel } = require('../../src/handlers/config/router');

module.exports = {
    data: buildConfigCommand(),
    execute: openPanel
};
