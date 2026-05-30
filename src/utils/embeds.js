const { EmbedBuilder } = require('discord.js');
const config = require('../config/manager');
const { COLORS } = require('./theme');

function serverBranding() {
    const { Server } = config.get();
    return {
        name: Server.name,
        logo: Server.logoUrl || null,
        banner: Server.bannerUrl || null
    };
}

function baseEmbed(title, description) {
    const { logo } = serverBranding();
    const embed = new EmbedBuilder()
        .setColor(COLORS.primary)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
    if (logo) embed.setThumbnail(logo);
    return embed;
}

function linkEmbed(title, url) {
    const { name, logo } = serverBranding();
    return new EmbedBuilder()
        .setColor(COLORS.primary)
        .setTitle(title)
        .setDescription(`**${name}**\n\n${url}`)
        .setThumbnail(logo || null)
        .setTimestamp();
}

function missingConfig(label) {
    return `❌ ${label} non configuré — \`/config\` ou \`npm run setup\`.`;
}

module.exports = { COLORS, serverBranding, baseEmbed, linkEmbed, missingConfig };
