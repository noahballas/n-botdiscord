const { ActivityType } = require('discord.js');
const config = require('../config/manager');

const VALID_STATUSES = new Set(['online', 'idle', 'dnd', 'invisible']);

const ACTIVITY_TYPES = {
    playing: ActivityType.Playing,
    watching: ActivityType.Watching,
    listening: ActivityType.Listening,
    streaming: ActivityType.Streaming
};

const STATUS_LABELS = {
    online: '🟢 En ligne',
    idle: '🟡 Inactif',
    dnd: '🔴 Ne pas déranger',
    invisible: '⚫ Invisible'
};

const ACTIVITY_LABELS = {
    none: 'Aucune',
    playing: 'Joue à',
    watching: 'Regarde',
    listening: 'Écoute',
    streaming: '🔴 Live Twitch'
};

function getPresenceConfig() {
    return config.get().DiscordBot?.presence ?? {};
}

function normalizeStreamUrl(raw) {
    let url = (raw || '').trim();
    if (!url) return 'https://www.twitch.tv/';

    if (!/^https?:\/\//i.test(url)) {
        const slug = url.replace(/^@/, '').replace(/^twitch\.tv\//i, '').split('/')[0];
        url = `https://www.twitch.tv/${slug}`;
    }

    if (!/twitch\.tv|youtube\.com|youtu\.be/i.test(url)) {
        return `https://www.twitch.tv/${url.replace(/^https?:\/\//, '')}`;
    }

    return url;
}

function buildPresencePayload(cfg = config.get()) {
    const p = cfg.DiscordBot?.presence ?? {};
    const status = VALID_STATUSES.has(p.status) ? p.status : 'online';
    const payload = { status, activities: [] };

    const activityType = p.activityType || 'none';
    const bio = (p.bio || '').trim();

    if (activityType !== 'none' && bio && ACTIVITY_TYPES[activityType]) {
        const activity = {
            name: bio.slice(0, 128),
            type: ACTIVITY_TYPES[activityType]
        };
        if (activityType === 'streaming') {
            activity.url = normalizeStreamUrl(p.streamUrl);
        }
        payload.activities = [activity];
    }

    return payload;
}

async function applyBotPresence(client) {
    if (!client?.user) return false;
    await client.user.setPresence(buildPresencePayload());
    return true;
}

function formatPresenceSummary(cfg = config.get()) {
    const p = cfg.DiscordBot?.presence ?? {};
    const status = STATUS_LABELS[p.status] ?? STATUS_LABELS.online;
    const act = ACTIVITY_LABELS[p.activityType] ?? ACTIVITY_LABELS.none;
    const bio = (p.bio || '').trim();
    let line = act;
    if (p.activityType && p.activityType !== 'none' && bio) {
        line += ` — **${bio}**`;
    }
    if (p.activityType === 'streaming' && p.streamUrl) {
        line += `\n▸ ${normalizeStreamUrl(p.streamUrl)}`;
    }
    return { status, activity: line };
}

module.exports = {
    VALID_STATUSES,
    STATUS_LABELS,
    ACTIVITY_LABELS,
    getPresenceConfig,
    buildPresencePayload,
    applyBotPresence,
    formatPresenceSummary,
    normalizeStreamUrl
};
