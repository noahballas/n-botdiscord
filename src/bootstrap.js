const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const config = require('./config/manager');
const { runConsoleSetup } = require('./config/setupConsole');
const { loadCommands, registerEvents } = require('./core/loader');
const { handleInteraction } = require('./core/interactions');

const ROOT = path.join(__dirname, '..');

process.on('unhandledRejection', (err) => {
    console.error('[erreur non gérée]', err?.message ?? err);
});

async function start() {
    config.load();

    if (!config.isConfigured()) {
        console.log('⚠️  Configuration incomplète.');
        if (process.stdin.isTTY) {
            await runConsoleSetup({ force: true });
        } else {
            console.log('Lancez : npm run setup');
            process.exit(1);
        }
    }

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    client.commands = new Collection();
    loadCommands(client, path.join(ROOT, 'commands'));
    registerEvents(client, path.join(__dirname, 'events'));

    client.on('interactionCreate', (interaction) => handleInteraction(interaction, client));

    await client.login(config.get().DiscordBot.token);
}

module.exports = { start };
