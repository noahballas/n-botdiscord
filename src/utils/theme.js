/** Palette bleu foncé — utilisée sur tous les embeds du bot */
const COLORS = {
    primary: '#0B1D3A',
    secondary: '#102A52',
    accent: '#1A3F6F',
    muted: '#2A5082'
};

function progressBar(done, total, size = 12) {
    const ratio = total > 0 ? done / total : 0;
    const filled = Math.round(ratio * size);
    return `${'▰'.repeat(filled)}${'▱'.repeat(size - filled)}  **${done}/${total}**`;
}

function panelEmbed({ title, description, fields = [], footer, thumbnail }) {
    const { EmbedBuilder } = require('discord.js');
    const embed = new EmbedBuilder()
        .setColor(COLORS.primary)
        .setTitle(title)
        .setDescription(description);

    if (fields.length) embed.addFields(fields);
    if (footer) embed.setFooter({ text: footer });
    if (thumbnail) embed.setThumbnail(thumbnail);
    embed.setTimestamp();
    return embed;
}

module.exports = { COLORS, progressBar, panelEmbed };
