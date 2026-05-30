const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../src/config/manager');
const { COLORS } = require('../../src/utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info-serveur')
        .setDescription('Informations sur le serveur Discord'),

    async execute(interaction) {
        const { guild } = interaction;
        const owner = await guild.fetchOwner();

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(COLORS.primary)
                    .setTitle(guild.name)
                    .setThumbnail(guild.iconURL({ size: 256 }))
                    .addFields(
                        { name: 'Propriétaire', value: owner.user.tag, inline: true },
                        { name: 'Membres', value: String(guild.memberCount), inline: true },
                        {
                            name: 'Créé le',
                            value: guild.createdAt.toLocaleDateString('fr-FR'),
                            inline: true
                        },
                        { name: 'GMod', value: config.get().Server.name, inline: true }
                    )
            ]
        });
    }
};
