const { createLinkCommand } = require('../../src/commands/factories/linkCommand');

module.exports = createLinkCommand({
    name: 'boutique',
    description: 'Lien vers la boutique',
    title: '🛒 Boutique',
    configKey: 'shop'
});
