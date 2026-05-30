const { replyError } = require('../utils/interaction');
const { isExpired } = require('../utils/safeInteraction');
const { isTicketInteraction, handleTicketInteraction } = require('../services/tickets');
const { isConfigInteraction, handleConfigInteraction } = require('../handlers/config/router');

async function handleInteraction(interaction, client) {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`[/${interaction.commandName}]`, error);
            if (!isExpired(error)) await replyError(interaction);
        }
        return;
    }

    if (!interaction.inGuild()) return;

    if (isConfigInteraction(interaction)) {
        try {
            await handleConfigInteraction(interaction);
        } catch (error) {
            console.error('[config]', error);
            if (!isExpired(error)) await replyError(interaction).catch(() => {});
        }
        return;
    }

    if (isTicketInteraction(interaction)) {
        try {
            await handleTicketInteraction(interaction, client);
        } catch (error) {
            console.error('[tickets]', error);
            if (!isExpired(error)) await replyError(interaction).catch(() => {});
        }
    }
}

module.exports = { handleInteraction };
