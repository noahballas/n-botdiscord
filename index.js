const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { token, clientId, guildId } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// Charger les commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// Déployer les commandes
const rest = new REST({ version: '10' }).setToken(token);
const commands = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);  
    client.user.setActivity("Avalon FA");// WATCHING, LISTENING ou pas type mais url:lien twitch pour STREAMING  
    client.user.setStatus('dnd'); //dnd, invisible, online, idle
});

(async () => {
    try {
        console.log('Déploiement des commandes...');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log('Commandes déployées avec succès.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Erreur lors de l\'exécution de cette commande.', ephemeral: true });
        }
    }
});

// Charger les événements
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Charger les fichiers dans "others"
const othersPath = path.join(__dirname, 'others');
const otherFiles = fs.readdirSync(othersPath).filter(file => file.endsWith('.js'));

for (const file of otherFiles) {
    const filePath = path.join(othersPath, file);
    const loadedFile = require(filePath);

    if (typeof loadedFile === 'function') {
        loadedFile(client);
    }
}

client.login(token);
