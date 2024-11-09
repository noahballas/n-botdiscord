const { SlashCommandBuilder } = require('discord.js');
const { forumLink } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forum')
        .setDescription('Affiche le lien du forum.'),
    async execute(interaction) {
        await interaction.reply({ content: `Voici le lien du forum : ${forumLink}` });
    },
};
