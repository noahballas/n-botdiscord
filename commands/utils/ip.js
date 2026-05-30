const { SlashCommandBuilder } = require('discord.js');
const config = require('../../src/config/manager');
const { baseEmbed, missingConfig } = require('../../src/utils/embeds');
const { replyEphemeral } = require('../../src/utils/interaction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ip')
        .setDescription('IP du serveur Garry\'s Mod'),

    async execute(interaction) {
        const { GMod, Server } = config.get();
        if (!GMod?.ip) return replyEphemeral(interaction, missingConfig('IP GMod'));

        const embed = baseEmbed(`🎮 ${Server.name}`, `**IP :** \`${GMod.ip}\``);
        if (GMod.connectCommand) {
            embed.addFields({ name: 'Steam', value: GMod.connectCommand });
        }
        return interaction.reply({ embeds: [embed] });
    }
};
