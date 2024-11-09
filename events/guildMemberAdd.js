const { Events, EmbedBuilder } = require('discord.js');
const { welcomeChannelId, serverLogoUrl } = require('../config.json');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (!channel) return;

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Ho ! Un nouveau membre !')
            .setDescription(`🎉 Bienvenue ${member} sur **${member.guild.name}** ! 🎉`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setImage(serverLogoUrl)
            .setTimestamp()
            .setFooter({ text: `Nous sommes maintenant ${member.guild.memberCount} membres !` });

        channel.send({ embeds: [welcomeEmbed] });
    },
};
