const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { adminRoles } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refuse-suggestion')
        .setDescription('Refuser une suggestion.')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('ID du message de suggestion')
                .setRequired(true)),
    async execute(interaction) {
        const messageId = interaction.options.getString('message_id');
        const channel = interaction.channel;

        if (!interaction.member.roles.cache.some(role => adminRoles.includes(role.id))) {
            return interaction.reply({ content: "Vous n'avez pas la permission d'utiliser cette commande.", ephemeral: true });
        }

        try {
            const message = await channel.messages.fetch(messageId);
            if (!message) {
                return interaction.reply({ content: "Message introuvable. Vérifiez l'ID du message.", ephemeral: true });
            }

            const embed = message.embeds[0];
            const updatedEmbed = EmbedBuilder.from(embed).setColor('#FF0000'); // Rouge pour refusé

            await message.edit({ embeds: [updatedEmbed] });
            const thread = message.hasThread ? await message.thread : null;
            if (thread) await thread.setLocked(true);
            await interaction.reply({ content: "Suggestion refusée.", ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Erreur lors du refus de la suggestion.", ephemeral: true });
        }
    },
};
