const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const config = require('../config/manager');

async function deployCommands(client) {
    const { token, clientId, guildId } = config.get().DiscordBot;
    const rest = new REST({ version: '10' }).setToken(token);
    const body = client.commandPayloads ?? [];

    console.log('📡 Déploiement des commandes slash…');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
    console.log(`✅ ${body.length} commande(s) déployée(s).`);
}

module.exports = { deployCommands };
