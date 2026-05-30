const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription("Affiche l'avatar d'un utilisateur")
        .addUserOption(option => 
            option.setName('utilisateur')
                .setDescription("L'utilisateur dont vous voulez voir l'avatar")
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;
        const member = interaction.guild?.members.cache.get(user.id);
        
        const embed = new EmbedBuilder()
            .setColor(require('../../src/utils/theme').COLORS.primary)
            .setTitle(`🖼️ Avatar de ${user.username}`)
            .setDescription(`[Lien vers l'image](${user.displayAvatarURL({ size: 4096 })})`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                {
                    name: '👤 Identifiant',
                    value: user.id,
                    inline: true
                },
                {
                    name: '📅 Création du compte',
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`,
                    inline: true
                }
            )
            .setFooter({ 
                text: `Demandé par ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL() 
            });

        if (member) {
            embed.addFields(
                {
                    name: '🛡️ Rôle principal',
                    value: member.roles.highest.toString(),
                    inline: true
                },
                {
                    name: '📅 Arrivée sur le serveur',
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`,
                    inline: true
                }
            );
        }

        await interaction.reply({ embeds: [embed] });
    },
};