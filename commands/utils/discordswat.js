const { createLinkCommand } = require('../../src/commands/factories/linkCommand');

module.exports = createLinkCommand({
    name: 'discordswat',
    description: 'Invitation Discord SWAT',
    title: '🚓 Discord SWAT',
    configKey: 'discordSwat'
});
