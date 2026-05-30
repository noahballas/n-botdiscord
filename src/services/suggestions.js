const { EmbedBuilder } = require('discord.js');

const { COLORS } = require('../utils/theme');

const STATUS = {
    accept: { label: '🟢 Acceptée', color: COLORS.primary, prefix: '✅ Accepté par' },
    refuse: { label: '🔴 Refusée', color: COLORS.primary, prefix: '❌ Refusé par' }
};

async function moderateSuggestion(channel, messageId, type, moderator) {
    const meta = STATUS[type];
    const message = await channel.messages.fetch(messageId);
    const embedData = message.embeds[0]?.data;

    if (!embedData) {
        throw new Error('INVALID');
    }

    const fields =
        embedData.fields?.map((field) =>
            field.name === 'Statut'
                ? { name: 'Statut', value: meta.label, inline: true }
                : field
        ) || [];

    if (!fields.some((f) => f.name === 'Statut')) {
        fields.push({ name: 'Statut', value: meta.label, inline: true });
    }

    await message.edit({
        embeds: [
            new EmbedBuilder(embedData)
                .setColor(meta.color)
                .setFields(fields)
                .setFooter({
                    text: `${meta.prefix} ${moderator.username}`,
                    iconURL: moderator.displayAvatarURL()
                })
        ],
        components: []
    });

    if (message.hasThread) {
        const thread = message.thread;
        const notice =
            type === 'accept'
                ? `🎉 Suggestion acceptée par ${moderator}.`
                : `⚠️ Suggestion refusée par ${moderator}.`;
        await thread.send(notice);
        await thread.setLocked(true);
        await thread.setArchived(true);
    }

    return message;
}

module.exports = { moderateSuggestion };
