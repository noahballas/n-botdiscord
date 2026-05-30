const { MessageFlags } = require('discord.js');
const { safeEphemeral } = require('./safeInteraction');

const EPHEMERAL = { flags: MessageFlags.Ephemeral };

async function replyEphemeral(interaction, content) {
    const result = await safeEphemeral(interaction, content);
    if (result !== null) return result;
    return null;
}

async function replyError(interaction, message = '❌ Une erreur est survenue.') {
    return replyEphemeral(interaction, message);
}

async function editOrReply(interaction, payload) {
    if (interaction.deferred || interaction.replied) {
        return interaction.editReply(payload).catch(() => null);
    }
    return interaction.reply({ ...payload, ...EPHEMERAL }).catch(() => null);
}

module.exports = { EPHEMERAL, replyEphemeral, replyError, editOrReply };
