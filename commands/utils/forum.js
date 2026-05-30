const { createLinkCommand } = require('../../src/commands/factories/linkCommand');

module.exports = createLinkCommand({
    name: 'forum',
    description: 'Lien vers le forum',
    title: '📋 Forum',
    configKey: 'forum'
});
