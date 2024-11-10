const { SlashCommandBuilder } = require('discord.js');
const { adminRoles } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('effacer')
        .setDescription('Effacer un nombre de messages dans le canal.')
        .addIntegerOption(option =>
            option.setName('nombre')
            .setDescription('Le nombre de messages à effacer')
            .setRequired(true)),
    async execute(interaction) {
        const count = interaction.options.getInteger('nombre');
        const userRoles = interaction.member.roles.cache;


        const hasPermission = userRoles.some(role => deleteConvRoles.includes(role.id));

        if (!hasPermission) {
            return interaction.reply({ content: "Vous n'avez pas la permission d'effacer des messages.", ephemeral: true });
        }

        if (count < 1 || count > 100) {
            return interaction.reply({ content: 'Veuillez fournir un nombre entre 1 et 100.', ephemeral: true });
        }

        try {
            await interaction.channel.bulkDelete(count, true);
            await interaction.reply({ content: `${count} messages ont été effacés.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Erreur lors de l\'effacement des messages.', ephemeral: true });
        }
    },
};
