const { SlashCommandBuilder } = require('discord.js');
const { banRoles } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deban')
        .setDescription('Débannir un membre du serveur.')
        .addStringOption(option =>
            option.setName('userid')
            .setDescription('L\'ID de l\'utilisateur à débannir')
            .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.options.getString('userid');
        const userRoles = interaction.member.roles.cache;

        // Vérifier si l'utilisateur a un rôle avec la permission de bannir/débannir
        const hasPermission = userRoles.some(role => banRoles.includes(role.id));

        if (!hasPermission) {
            return interaction.reply({ content: "Vous n'avez pas la permission de débannir des membres.", ephemeral: true });
        }

        try {
            await interaction.guild.members.unban(userId);
            await interaction.reply({ content: `L'utilisateur avec l'ID ${userId} a été débanni.` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Erreur lors du débannissement de cet utilisateur.', ephemeral: true });
        }
    },
};
