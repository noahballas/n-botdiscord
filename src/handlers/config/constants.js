const PREFIX = 'cfg';

const VIEWS = {
    HOME: 'home',
    SERVER: 'server',
    GMOD: 'gmod',
    LINKS: 'links',
    CHANNELS: 'channels',
    ROLES: 'roles',
    TICKETS: 'tickets',
    BOT: 'bot'
};

const CHANNEL_SLOTS = [
    { key: 'welcomeChannelId', label: 'Bienvenue', emoji: '👋' },
    { key: 'leaveChannelId', label: 'Départ', emoji: '👋' },
    { key: 'suggestionsChannelId', label: 'Suggestions', emoji: '💡' },
    { key: 'ticketChannelId', label: 'Panneau tickets', emoji: '🎫' },
    { key: 'staffChannelId', label: 'Staff / logs', emoji: '🛡️' },
    { key: 'rolesChannelId', label: 'Rôles', emoji: '🎭' }
];

const ROLE_LISTS = [
    { key: 'adminRoles', label: 'Administrateurs bot', emoji: '⚙️' },
    { key: 'banRoles', label: 'Ban', emoji: '🔨' },
    { key: 'kickRoles', label: 'Kick', emoji: '👢' },
    { key: 'deleteConvRoles', label: 'Effacer messages', emoji: '🗑️' }
];

const LINKS = [
    { key: 'forum', label: 'Forum' },
    { key: 'shop', label: 'Boutique' },
    { key: 'topServers', label: 'Top-Serveurs' },
    { key: 'discordSwat', label: 'Discord SWAT' },
    { key: 'discordPolice', label: 'Discord Police' },
    { key: 'workshop', label: 'Workshop' }
];

const BOT_STATUSES = [
    { value: 'online', label: '🟢 En ligne' },
    { value: 'idle', label: '🟡 Inactif' },
    { value: 'dnd', label: '🔴 Ne pas déranger' },
    { value: 'invisible', label: '⚫ Invisible' }
];

const BOT_ACTIVITIES = [
    { value: 'none', label: 'Aucune activité' },
    { value: 'playing', label: '🎮 Joue à…' },
    { value: 'watching', label: '👀 Regarde…' },
    { value: 'listening', label: '🎧 Écoute…' },
    { value: 'streaming', label: '🔴 Live Twitch' }
];

const TICKET_LIMITS = ['1', '2', '3', '4', '5'];
const CLOSE_COOLDOWNS = ['0', '5', '10', '15', '30', '60'];

/** Modèles GMod — ajout direct dans /config → Tickets */
const TICKET_PRESETS = [
    {
        id: 'support',
        label: '🎟️ | Support',
        description: 'Questions ou problèmes de support.'
    },
    {
        id: 'vehicule',
        label: '🚗 | Véhicule Import',
        description: 'Demandes concernant les véhicules importés.'
    },
    {
        id: 'plainte_joueur',
        label: '🚓 | Plainte Joueur',
        description: 'Signaler un problème avec un joueur.'
    },
    {
        id: 'plainte_staff',
        label: '⚖️ | Plainte Staff',
        description: 'Signaler un problème avec un membre du staff.'
    },
    {
        id: 'unban',
        label: '📋 | Unban',
        description: 'Demande de débanissement.'
    },
    {
        id: 'boutique',
        label: '🛒 | Boutique',
        description: 'Problèmes avec la boutique.'
    },
    {
        id: 'custom',
        label: '✏️ Personnalisé',
        description: 'Libellé et description sur mesure.'
    }
];

function getTicketPreset(presetId) {
    return TICKET_PRESETS.find((p) => p.id === presetId);
}

function id(...parts) {
    return [PREFIX, ...parts].join(':');
}

module.exports = {
    PREFIX,
    VIEWS,
    CHANNEL_SLOTS,
    ROLE_LISTS,
    LINKS,
    BOT_STATUSES,
    BOT_ACTIVITIES,
    TICKET_LIMITS,
    CLOSE_COOLDOWNS,
    TICKET_PRESETS,
    getTicketPreset,
    id
};
