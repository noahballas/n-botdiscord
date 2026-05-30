const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../../src/config/manager');
const { canModerateSuggestions } = require('../../src/utils/permissions');
const { moderateSuggestion } = require('../../src/services/suggestions');
const { editOrReply } = require('../../src/utils/interaction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refuse-suggestion')
        .setDescription('Refuser une suggestion')
        .addStringOption((o) => o.setName('message_id').setDescription('ID du message').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        if (!canModerateSuggestions(interaction.member)) {
            return editOrReply(interaction, { content: '❌ Permission refusée.' });
        }

        const channel = interaction.guild.channels.cache.get(
            config.get().Channels.suggestionsChannelId
        );
        if (!channel) return editOrReply(interaction, { content: '❌ Salon suggestions non configuré.' });

        try {
            await moderateSuggestion(
                channel,
                interaction.options.getString('message_id'),
                'refuse',
                interaction.user
            );
            return editOrReply(interaction, { content: '✅ Suggestion refusée.' });
        } catch (err) {
            const msg = err.message === 'INVALID' ? '❌ Suggestion invalide.' : '❌ Erreur.';
            console.error('[refuse-suggestion]', err);
            return editOrReply(interaction, { content: msg });
        }
    }
};
