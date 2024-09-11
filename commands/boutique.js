const { SlashCommandBuilder } = require('discord.js');
const { shopLink } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('boutique')
        .setDescription('Affiche le lien de la boutique.'),
    async execute(interaction) {
        await interaction.reply({ content: `Voici le lien de la boutique : ${shopLink}` });
    },
};
