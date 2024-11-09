const { SlashCommandBuilder } = require('discord.js');
const { discordpolice } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('discordpolice')
        .setDescription('Affiche le lien du discord Police.'),
    async execute(interaction) {
        await interaction.reply({ content: `Voici le lien du Discord Police : ${discordpolice}` });
    },
};
