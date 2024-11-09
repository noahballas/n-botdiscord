const { SlashCommandBuilder } = require('discord.js');
const { workshopLink } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('workshop')
        .setDescription('Affiche le lien du workshop.'),
    async execute(interaction) {
        await interaction.reply({ content: `Voici le lien du workshop : ${workshopLink}` });
    },
};
