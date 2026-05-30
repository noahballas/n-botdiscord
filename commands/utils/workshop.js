const { createLinkCommand } = require('../../src/commands/factories/linkCommand');

module.exports = createLinkCommand({
    name: 'workshop',
    description: 'Collection Steam Workshop',
    title: '🔧 Workshop',
    configKey: 'workshop'
});
