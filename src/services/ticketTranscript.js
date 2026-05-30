const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { COLORS } = require('../utils/theme');
const config = require('../config/manager');

const pendingCloses = new Set();

function parseTicketOwnerId(topic) {
    if (!topic) return null;
    const match = topic.match(/(\d{17,20})/);
    return match?.[1] ?? null;
}

function formatDate(ts) {
    return new Date(ts).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' });
}

async function fetchAllMessages(channel) {
    const messages = [];
    let before;

    while (messages.length < 500) {
        const batch = await channel.messages.fetch({
            limit: 100,
            ...(before ? { before } : {})
        });
        if (!batch.size) break;
        messages.push(...batch.values());
        before = batch.last().id;
        if (batch.size < 100) break;
    }

    return messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
}

async function buildTranscript(channel, closedBy) {
    const cfg = config.get();
    const messages = await fetchAllMessages(channel);
    const ownerId = parseTicketOwnerId(channel.topic);
    const lines = [
        '═══════════════════════════════════════',
        `  TRANSCRIPT TICKET — ${cfg.Server.name}`,
        '═══════════════════════════════════════',
        '',
        `Serveur      : ${channel.guild.name}`,
        `Salon        : #${channel.name} (${channel.id})`,
        `Ouvert par   : ${ownerId ?? 'inconnu'}`,
        `Fermé par    : ${closedBy.tag} (${closedBy.id})`,
        `Date fermeture : ${formatDate(Date.now())}`,
        `Messages     : ${messages.length}`,
        '',
        '───────────────────────────────────────',
        ''
    ];

    for (const msg of messages) {
        if (!msg.content && !msg.attachments.size && !msg.embeds.length) continue;
        const author = `${msg.author.tag} (${msg.author.id})`;
        const time = formatDate(msg.createdTimestamp);
        let body = msg.content || '';
        if (msg.attachments.size) {
            const files = [...msg.attachments.values()].map((a) => a.url).join(', ');
            body += body ? `\n[Fichiers: ${files}]` : `[Fichiers: ${files}]`;
        }
        if (msg.embeds.length) body += body ? '\n[Embed]' : '[Embed]';
        lines.push(`[${time}] ${author}`);
        lines.push(body || '(vide)');
        lines.push('');
    }

    lines.push('═══════════════════════════════════════');
    lines.push('  Fin du transcript');
    lines.push('═══════════════════════════════════════');

    const text = lines.join('\n');
    const safeName = channel.name.replace(/[^a-z0-9-_]/gi, '-').slice(0, 40);
    const file = new AttachmentBuilder(Buffer.from(text, 'utf-8'), {
        name: `transcript-${safeName}-${channel.id}.txt`
    });

    return { text, file, ownerId, messageCount: messages.length };
}

async function deliverTranscript(client, { channel, closedBy, transcript, postInChannel = false }) {
    const cfg = config.get();
    const summary = new EmbedBuilder()
        .setColor(COLORS.primary)
        .setTitle('📋 Ticket fermé — Transcript')
        .setDescription(
            [
                `**Salon :** #${channel.name}`,
                `**Fermé par :** ${closedBy}`,
                `**Messages :** ${transcript.messageCount}`
            ].join('\n')
        )
        .setTimestamp();

    const payload = {
        embeds: [summary],
        files: [transcript.file]
    };

    if (postInChannel && channel?.isTextBased()) {
        await channel
            .send({
                content: '📋 **Transcript du ticket** (fermeture)',
                ...payload
            })
            .catch(() => {});
    }

    if (transcript.ownerId) {
        try {
            const owner = await client.users.fetch(transcript.ownerId);
            await owner.send({
                content: `📩 Voici le transcript de votre ticket sur **${cfg.Server.name}**.`,
                ...payload
            });
        } catch {
            console.log(`[transcript] MP impossible pour ${transcript.ownerId}`);
        }
    }

    const staffId = cfg.Channels?.staffChannelId;
    if (staffId) {
        const staffCh = await client.channels.fetch(staffId).catch(() => null);
        if (staffCh?.isTextBased()) {
            await staffCh.send({
                content: `📋 Transcript ticket \`#${channel.name}\` — fermé par ${closedBy}`,
                ...payload
            }).catch(() => {});
        }
    }
}

function isClosing(channelId) {
    return pendingCloses.has(channelId);
}

function markClosing(channelId) {
    pendingCloses.add(channelId);
}

function unmarkClosing(channelId) {
    pendingCloses.delete(channelId);
}

module.exports = {
    parseTicketOwnerId,
    buildTranscript,
    deliverTranscript,
    isClosing,
    markClosing,
    unmarkClosing
};
