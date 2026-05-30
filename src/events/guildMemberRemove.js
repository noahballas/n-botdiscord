const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config/manager');
const { formatDuration } = require('../utils/format');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const { Channels, Server } = config.get();
        const channel = member.guild.channels.cache.get(Channels.leaveChannelId);
        if (!channel) return;

        try {
            const timeSpent = member.joinedTimestamp
                ? formatDuration(Date.now() - member.joinedTimestamp)
                : 'inconnu';

            await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(require('../utils/theme').COLORS.primary)
                        .setTitle(`😢 ${member.user.username} nous a quitté`)
                        .setDescription(`**${member.guild.memberCount}** membres restants.`)
                        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
                        .setImage(Server.bannerUrl || Server.logoUrl || null)
                        .addFields(
                            {
                                name: '📅 Arrivée',
                                value: member.joinedTimestamp
                                    ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`
                                    : '—',
                                inline: true
                            },
                            { name: '⏱️ Temps passé', value: timeSpent, inline: true }
                        )
                        .setFooter({
                            text: member.guild.name,
                            iconURL: member.guild.iconURL() || undefined
                        })
                ]
            });
        } catch (err) {
            console.error('[leave]', err);
        }
    }
};
