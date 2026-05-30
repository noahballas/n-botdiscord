const readline = require('readline');
const config = require('./manager');

const LINE = '═'.repeat(54);

function createInterface() {
    return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(rl, question, defaultValue = '') {
    const hint = defaultValue ? ` \x1b[2m(${defaultValue})\x1b[0m` : '';
    return new Promise((resolve) => {
        rl.question(`\x1b[36m▸\x1b[0m ${question}${hint}: `, (answer) => {
            resolve(answer.trim() || defaultValue);
        });
    });
}

async function askOptional(rl, question, current = '') {
    const value = await ask(rl, `${question} [Entrée = garder]`, '');
    return value || current;
}

async function askRoleIds(rl, label, current = []) {
    const raw = await ask(rl, `${label} — IDs séparés par des virgules`, current.join(', '));
    if (!raw) return [];
    return raw.split(',').map((id) => id.trim()).filter(Boolean);
}

function printBanner() {
    console.log(`\n\x1b[34m╔${LINE}╗\x1b[0m`);
    console.log('\x1b[34m║\x1b[0m  \x1b[1mBOT DISCORD — COMMUNAUTÉ GARRY\'S MOD\x1b[0m              \x1b[34m║\x1b[0m');
    console.log(`\x1b[34m╚${LINE}╝\x1b[0m\n`);
}

function printInstallGuide() {
    console.log('\x1b[1m📦 Installation (première fois)\x1b[0m');
    console.log('  \x1b[33m1.\x1b[0m  npm install          \x1b[2m→ installe discord.js\x1b[0m');
    console.log('  \x1b[33m2.\x1b[0m  npm run setup        \x1b[2m→ cet assistant (config.json)\x1b[0m');
    console.log('  \x1b[33m3.\x1b[0m  npm start            \x1b[2m→ démarre le bot\x1b[0m');
    console.log('');
    console.log('\x1b[1m🔑 Où trouver les identifiants Discord ?\x1b[0m');
    console.log('  • \x1b[36mToken\x1b[0m      : https://discord.com/developers/applications');
    console.log('               → votre app → Bot → Reset Token');
    console.log('  • \x1b[36mClient ID\x1b[0m : même page → General Information → Application ID');
    console.log('  • \x1b[36mGuild ID\x1b[0m  : Discord → Paramètres serveur → Mode développeur ON');
    console.log('               → clic droit sur le serveur → Copier l\'identifiant');
    console.log('');
    console.log('\x1b[1m🎮 Salons & rôles (IDs)\x1b[0m');
    console.log('  Mode développeur activé → clic droit sur un salon/rôle → Copier l\'identifiant');
    console.log('');
    console.log('\x1b[2mAprès le setup, utilisez /config sur Discord pour modifier sans redémarrer.\x1b[0m\n');
}

function section(title) {
    console.log(`\n\x1b[34m── ${title} ${'─'.repeat(Math.max(0, 40 - title.length))}\x1b[0m`);
}

async function setupTickets(rl, cfg) {
    section('Catégories de tickets (optionnel)');
    const add = await ask(rl, 'Configurer des catégories maintenant ? (o/n)', 'n');
    if (add.toLowerCase() !== 'o' && add.toLowerCase() !== 'oui') return cfg.Tickets;

    const categories = [];
    let more = true;
    while (more) {
        const label = await ask(rl, 'Nom (ex: 🎟️ | Support)');
        const description = await ask(rl, 'Description courte');
        const roleId = await ask(rl, 'ID du rôle staff');
        const categoryId = await ask(rl, 'ID de la catégorie Discord (dossier)');
        categories.push({ label, description, roleId, categoryId });

        const again = await ask(rl, 'Ajouter une autre catégorie ? (o/n)', 'n');
        more = again.toLowerCase() === 'o' || again.toLowerCase() === 'oui';
    }

    return { ...cfg.Tickets, categories };
}

async function runConsoleSetup({ force = false } = {}) {
    config.load();
    printBanner();
    printInstallGuide();

    if (config.isConfigured() && !force) {
        const rl = createInterface();
        const redo = await ask(rl, 'Configuration existante détectée. Tout refaire ? (o/n)', 'n');
        rl.close();
        if (redo.toLowerCase() !== 'o' && redo.toLowerCase() !== 'oui') {
            console.log('\x1b[2mConfiguration inchangée. Lancez npm start.\x1b[0m\n');
            return;
        }
    }

    const rl = createInterface();
    const cfg = config.get();

    section('Discord — obligatoire');
    cfg.DiscordBot.token = await ask(rl, 'Token du bot', cfg.DiscordBot.token);
    cfg.DiscordBot.clientId = await ask(rl, 'Client ID (Application ID)', cfg.DiscordBot.clientId);
    cfg.DiscordBot.guildId = await ask(rl, 'ID du serveur Discord (Guild)', cfg.DiscordBot.guildId);

    section('Présence du bot (optionnel)');
    if (!cfg.DiscordBot.presence) cfg.DiscordBot.presence = {};
    const statusRaw = await ask(
        rl,
        'Statut (online / idle / dnd / invisible)',
        cfg.DiscordBot.presence.status || 'online'
    );
    cfg.DiscordBot.presence.status = ['online', 'idle', 'dnd', 'invisible'].includes(statusRaw)
        ? statusRaw
        : 'online';
    const actRaw = await ask(
        rl,
        'Activité (none / playing / watching / listening / streaming)',
        cfg.DiscordBot.presence.activityType || 'none'
    );
    cfg.DiscordBot.presence.activityType = actRaw || 'none';
    cfg.DiscordBot.presence.bio = await ask(rl, 'Bio / texte d\'activité', cfg.DiscordBot.presence.bio || '');
    if (cfg.DiscordBot.presence.activityType === 'streaming') {
        cfg.DiscordBot.presence.streamUrl = await ask(
            rl,
            'URL ou pseudo Twitch',
            cfg.DiscordBot.presence.streamUrl || ''
        );
    }

    section('Serveur — affichage');
    cfg.Server.name = await ask(rl, 'Nom affiché', cfg.Server.name);
    cfg.Server.logoUrl = await askOptional(rl, 'URL du logo', cfg.Server.logoUrl);
    cfg.Server.bannerUrl = await askOptional(rl, 'URL de la bannière', cfg.Server.bannerUrl);

    section('Garry\'s Mod');
    cfg.GMod.ip = await askOptional(rl, 'IP du serveur (ip:port)', cfg.GMod.ip);
    cfg.GMod.connectCommand = await askOptional(rl, 'Lien steam://connect/...', cfg.GMod.connectCommand);
    cfg.Commands.workshop = await askOptional(rl, 'Lien Workshop', cfg.Commands.workshop);

    section('Liens communauté');
    cfg.Commands.forum = await askOptional(rl, 'Forum', cfg.Commands.forum);
    cfg.Commands.shop = await askOptional(rl, 'Boutique', cfg.Commands.shop);
    cfg.Commands.topServers = await askOptional(rl, 'Top-Serveurs', cfg.Commands.topServers);
    cfg.Commands.discordSwat = await askOptional(rl, 'Discord SWAT', cfg.Commands.discordSwat);
    cfg.Commands.discordPolice = await askOptional(rl, 'Discord Police', cfg.Commands.discordPolice);

    section('Salons Discord');
    cfg.Channels.welcomeChannelId = await askOptional(rl, 'Salon de bienvenue', cfg.Channels.welcomeChannelId);
    cfg.Channels.leaveChannelId = await askOptional(rl, 'Salon de départ', cfg.Channels.leaveChannelId);
    cfg.Channels.suggestionsChannelId = await askOptional(
        rl,
        'Salon des suggestions',
        cfg.Channels.suggestionsChannelId
    );
    cfg.Channels.ticketChannelId = await askOptional(rl, 'Salon du panneau tickets', cfg.Channels.ticketChannelId);
    cfg.Channels.staffChannelId = await askOptional(rl, 'Salon staff', cfg.Channels.staffChannelId);
    cfg.Channels.rolesChannelId = await askOptional(rl, 'Salon des rôles', cfg.Channels.rolesChannelId);

    section('Rôles modération');
    cfg.Roles.adminRoles = await askRoleIds(rl, 'Administrateurs /config', cfg.Roles.adminRoles);
    cfg.Roles.banRoles = await askRoleIds(rl, 'Permission /ban', cfg.Roles.banRoles);
    cfg.Roles.kickRoles = await askRoleIds(rl, 'Permission /kick', cfg.Roles.kickRoles);
    cfg.Roles.deleteConvRoles = await askRoleIds(rl, 'Permission /effacer', cfg.Roles.deleteConvRoles);
    cfg.Roles.acceptSuggestion = await askOptional(
        rl,
        'Rôle modération suggestions',
        cfg.Roles.acceptSuggestion
    );

    cfg.Tickets = await setupTickets(rl, cfg);
    cfg.Tickets.settings.maxTicketsPerUser =
        parseInt(await ask(rl, 'Tickets max par joueur', String(cfg.Tickets.settings.maxTicketsPerUser)), 10) || 1;
    cfg.Tickets.settings.closeCooldownSeconds =
        parseInt(
            await ask(rl, 'Délai fermeture ticket (secondes, ex: 10)', String(cfg.Tickets.settings.closeCooldownSeconds ?? 10)),
            10
        ) || 10;
    const transcript = await ask(rl, 'Transcripts + MP à la fermeture ? (o/n)', 'o');
    cfg.Tickets.settings.transcriptEnabled =
        transcript.toLowerCase() === 'o' || transcript.toLowerCase() === 'oui';

    cfg.meta.configured = true;
    config.save();
    rl.close();

    console.log(`\n\x1b[32m✅ Configuration enregistrée\x1b[0m → config.json`);
    console.log('\x1b[36m▸\x1b[0m Démarrez le bot : \x1b[1mnpm start\x1b[0m');
    console.log('\x1b[36m▸\x1b[0m Modifiez ensuite sur Discord : \x1b[1m/config\x1b[0m\n');
}

module.exports = { runConsoleSetup };
