const { SlashCommandBuilder } = require('discord.js');
const { topservLink } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('topserv')
        .setDescription('Affiche le lien du topserv.'),
    async execute(interaction) {
        await interaction.reply({ content: `Voici le lien du Top serveur : ${topservLink}` });
    },
};
