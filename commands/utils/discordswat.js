const { SlashCommandBuilder } = require('discord.js');
const { discordswat } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('discordswat')
        .setDescription('Affiche le lien du forum.'),
    async execute(interaction) {
        await interaction.reply({ content: `Voici le lien du Discord Swat : ${discordswat}` });
    },
};
