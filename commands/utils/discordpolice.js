const { createLinkCommand } = require('../../src/commands/factories/linkCommand');

module.exports = createLinkCommand({
    name: 'discordpolice',
    description: 'Invitation Discord Police',
    title: '👮 Discord Police',
    configKey: 'discordPolice'
});
