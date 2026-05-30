const { Events } = require('discord.js');
const { deployCommands } = require('../core/deployCommands');
const { publishPanel } = require('../services/tickets');
const config = require('../config/manager');
const { applyBotPresence } = require('../services/botPresence');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Connecté : ${client.user.tag}`);
        await applyBotPresence(client);

        try {
            await deployCommands(client);
        } catch (err) {
            console.error('❌ Déploiement commandes :', err.message);
        }

        const cfg = config.get();
        if (!cfg.Channels.ticketChannelId || !cfg.Tickets.categories.length) {
            console.log('ℹ️  Tickets : configurez salon + catégories.');
            return;
        }

        try {
            await publishPanel(client);
            console.log('✅ Panneau tickets publié.');
        } catch (err) {
            console.error('❌ Panneau tickets :', err.message);
        }
    }
};
