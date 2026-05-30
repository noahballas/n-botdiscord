const { SlashCommandBuilder } = require('discord.js');
const config = require('../../src/config/manager');
const { baseEmbed, missingConfig, serverBranding } = require('../../src/utils/embeds');
const { replyEphemeral } = require('../../src/utils/interaction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('topserv')
        .setDescription('Lien Top-Serveurs pour voter'),

    async execute(interaction) {
        const url = config.getPath(['Commands', 'topServers']);
        if (!url) return replyEphemeral(interaction, missingConfig('Top-Serveurs'));

        const { name } = serverBranding();
        return interaction.reply({
            embeds: [baseEmbed('⭐ Top-Serveurs', `Vote pour **${name}** :\n${url}`)]
        });
    }
};
