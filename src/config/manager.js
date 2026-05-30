const fs = require('fs');
const path = require('path');
const defaults = require('./defaults');

const CONFIG_PATH = path.join(__dirname, '..', '..', 'config.json');

let cache = null;

function deepMerge(target, source) {
    const out = { ...target };
    for (const key of Object.keys(source)) {
        if (
            source[key] &&
            typeof source[key] === 'object' &&
            !Array.isArray(source[key]) &&
            target[key] &&
            typeof target[key] === 'object' &&
            !Array.isArray(target[key])
        ) {
            out[key] = deepMerge(target[key], source[key]);
        } else if (source[key] !== undefined) {
            out[key] = source[key];
        }
    }
    return out;
}

function migrateLegacy(data) {
    if (data.Roles?.KickRoles && !data.Roles.kickRoles?.length) {
        data.Roles.kickRoles = data.Roles.KickRoles;
        delete data.Roles.KickRoles;
    }
    if (data.Roles?.AcceptSuggestion && !data.Roles.acceptSuggestion) {
        data.Roles.acceptSuggestion = data.Roles.AcceptSuggestion;
        delete data.Roles.AcceptSuggestion;
    }
    if (data.Commands?.ipgmod && !data.GMod?.ip) {
        data.GMod = data.GMod || {};
        data.GMod.ip = data.Commands.ipgmod;
    }
    if (data.Commands?.workshop && !data.Commands.workshop) {
        // already same key
    }
    return data;
}

function load() {
    if (!fs.existsSync(CONFIG_PATH)) {
        cache = structuredClone(defaults);
        save();
        return cache;
    }
    try {
        const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        cache = deepMerge(structuredClone(defaults), migrateLegacy(raw));
    } catch (err) {
        console.error('Erreur lecture config.json:', err.message);
        cache = structuredClone(defaults);
    }
    return cache;
}

function get() {
    if (!cache) load();
    return cache;
}

function save() {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cache, null, 2), 'utf8');
    return cache;
}

function set(pathKeys, value) {
    const cfg = get();
    let ref = cfg;
    for (let i = 0; i < pathKeys.length - 1; i++) {
        const key = pathKeys[i];
        if (!ref[key] || typeof ref[key] !== 'object') ref[key] = {};
        ref = ref[key];
    }
    ref[pathKeys[pathKeys.length - 1]] = value;
    save();
    return value;
}

function getPath(pathKeys) {
    let ref = get();
    for (const key of pathKeys) {
        if (ref == null) return undefined;
        ref = ref[key];
    }
    return ref;
}

const PLACEHOLDERS = new Set([
    '',
    'VOTRE_TOKEN',
    'VOTRE_CLIENT_ID',
    'VOTRE_GUILD_ID',
    'ID_DU_ROLE',
    'ID_DU_CHANNEL',
    'ID_DE_LA_CATEGORIE'
]);

function isPlaceholder(value) {
    return PLACEHOLDERS.has(value) || (typeof value === 'string' && value.startsWith('ID_DU'));
}

function isConfigured() {
    const cfg = get();
    if (cfg.meta?.configured) return true;
    const bot = cfg.DiscordBot;
    return (
        bot.token &&
        bot.clientId &&
        bot.guildId &&
        !isPlaceholder(bot.token) &&
        !isPlaceholder(bot.clientId) &&
        !isPlaceholder(bot.guildId)
    );
}

function markConfigured() {
    set(['meta', 'configured'], true);
}

function maskToken(token) {
    if (!token || token.length < 10) return '(non défini)';
    return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

function exportForDisplay() {
    const cfg = structuredClone(get());
    if (cfg.DiscordBot?.token) {
        cfg.DiscordBot.token = maskToken(cfg.DiscordBot.token);
    }
    return cfg;
}

module.exports = {
    CONFIG_PATH,
    load,
    get,
    save,
    set,
    getPath,
    isConfigured,
    markConfigured,
    maskToken,
    exportForDisplay,
    isPlaceholder
};
