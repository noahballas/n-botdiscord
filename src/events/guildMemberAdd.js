const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config/manager');
const { COLORS } = require('../utils/embeds');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const { Channels, Server } = config.get();
        const channel = member.guild.channels.cache.get(Channels.welcomeChannelId);
        if (!channel) return;

        try {
            const embed = new EmbedBuilder()
                .setColor(COLORS.primary)
                .setTitle(`✨ Bienvenue sur ${Server.name}`)
                .setDescription(`🎉 Bienvenue ${member} !`)
                .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
                .setImage(Server.bannerUrl || Server.logoUrl || null)
                .addFields(
                    {
                        name: '📅 Compte créé',
                        value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:D>`,
                        inline: true
                    },
                    { name: '👤 Membre n°', value: String(member.guild.memberCount), inline: true }
                )
                .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL() || undefined });

            await channel.send({ content: member.toString(), embeds: [embed] });

            await member
                .send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(COLORS.primary)
                            .setTitle(`Bienvenue sur ${member.guild.name}`)
                            .setDescription('Merci de nous avoir rejoint !')
                            .addFields(
                                { name: '📜 Règles', value: 'Lis les règles du serveur.' },
                                { name: '❓ Aide', value: 'Ouvre un ticket si besoin.' }
                            )
                            .setThumbnail(Server.logoUrl || null)
                    ]
                })
                .catch(() => {});
        } catch (err) {
            console.error('[welcome]', err);
        }
    }
};
