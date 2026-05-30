const { ChannelType } = require('discord.js');

function sanitizeUsername(username) {
    return username.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function channelMention(id) {
    return id ? `<#${id}>` : '—';
}

function countUserTickets(guild, user) {
    const slug = sanitizeUsername(user.username);
    return guild.channels.cache.filter(
        (ch) =>
            ch.type === ChannelType.GuildText &&
            (ch.topic?.includes(user.id) ||
                ch.name.includes(user.id) ||
                ch.name.includes(slug))
    );
}

module.exports = { sanitizeUsername, channelMention, countUserTickets };
