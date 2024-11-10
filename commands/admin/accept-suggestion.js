const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { banRoles } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('accept-suggestion')
        .setDescription('Accepter une suggestion.')
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
            console.log(`Recherche du message ID: ${messageId} dans le canal ${channel.id}`);
            const message = await channel.messages.fetch(messageId);

            if (!message) {
                return interaction.reply({ content: "Message introuvable. Vérifiez l'ID du message.", ephemeral: true });
            }

            const embed = message.embeds[0];
            const updatedEmbed = EmbedBuilder.from(embed).setColor('#00FF00'); 

            await message.edit({ embeds: [updatedEmbed] });
            const thread = message.hasThread ? await message.thread : null;
            if (thread) await thread.setLocked(true);
            await interaction.reply({ content: "Suggestion acceptée.", ephemeral: true });
        } catch (error) {
            console.error(`Erreur lors de la recherche du message: ${error.message}`);
            await interaction.reply({ content: "Erreur lors de l'acceptation de la suggestion.", ephemeral: true });
        }
    },
};
