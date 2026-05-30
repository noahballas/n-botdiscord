const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../../src/utils/embeds');

module.exports = {
    data: new SlashCommandBuilder().setName('credit').setDescription('Crédits du bot'),

    async execute(interaction) {
        await interaction.reply({
            embeds: [
                baseEmbed('Bot par Noah Ballas', 'Support : **noah_ballas** sur Discord')
            ]
        });
    }
};
