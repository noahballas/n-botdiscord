const { SlashCommandBuilder } = require('discord.js');
const { connectip } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ip')
        .setDescription('Affiche ip du serveur.'),
    async execute(interaction) {
        await interaction.reply({ content: `Voici l'ip du serveur : ${connectip}` });
    },
};
