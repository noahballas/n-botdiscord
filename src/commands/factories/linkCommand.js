const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config/manager');
const { linkEmbed, missingConfig } = require('../../utils/embeds');
const { replyEphemeral } = require('../../utils/interaction');

/**
 * @param {{ name: string, description: string, title: string, configKey: string }} spec
 */
function createLinkCommand({ name, description, title, configKey }) {
    return {
        data: new SlashCommandBuilder().setName(name).setDescription(description),

        async execute(interaction) {
            const url = config.getPath(['Commands', configKey]);
            if (!url) {
                return replyEphemeral(interaction, missingConfig(title));
            }
            return interaction.reply({ embeds: [linkEmbed(title, url)] });
        }
    };
}

module.exports = { createLinkCommand };
