const { Events, EmbedBuilder } = require('discord.js');
const { leaveChannelId, serverLogoUrl } = require('../config.json');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const channel = member.guild.channels.cache.get(leaveChannelId);
        if (!channel) return;

        const joinedTimestamp = member.joinedTimestamp;
        const timeJoined = Date.now() - joinedTimestamp;
        const joinedAtDate = new Date(joinedTimestamp);
        const formattedJoinDate = joinedAtDate.toLocaleDateString("fr-FR", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const years = Math.floor(timeJoined / (365.25 * 24 * 60 * 60 * 1000));
        const months = Math.floor((timeJoined / (30.44 * 24 * 60 * 60 * 1000)) % 12);
        const days = Math.floor((timeJoined / (24 * 60 * 60 * 1000)) % 30);

        let timeSpent = '';
        if (years > 0) timeSpent += `${years} an${years > 1 ? 's' : ''} `;
        if (months > 0) timeSpent += `${months} mois `;
        if (days > 0 || (years === 0 && months === 0)) timeSpent += `${days} jour${days > 1 ? 's' : ''}`;

        const leaveEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Un membre vient de partir… 😢')
            .setDescription(`À bientôt, ${member.user.username}.`)
            .setFooter({ text: `👋 Avait rejoint le serveur le ${formattedJoinDate}, soit il y a ${timeSpent.trim()}.` })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setImage(serverLogoUrl)
            .setTimestamp();

        channel.send({ embeds: [leaveEmbed] });
    },
};
