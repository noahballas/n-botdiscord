const { MessageFlags } = require('discord.js');

const EXPIRED = 10062;

function isExpired(error) {
    return error?.code === EXPIRED;
}

async function safeDeferUpdate(interaction) {
    if (interaction.deferred || interaction.replied) return false;
    try {
        await interaction.deferUpdate();
        return true;
    } catch (error) {
        if (isExpired(error)) return false;
        throw error;
    }
}

async function safeReply(interaction, payload) {
    try {
        if (interaction.deferred || interaction.replied) {
            return await interaction.followUp(payload);
        }
        return await interaction.reply(payload);
    } catch (error) {
        if (isExpired(error)) return null;
        throw error;
    }
}

async function safeUpdate(interaction, payload) {
    try {
        if (interaction.deferred) {
            return await interaction.message?.edit(payload);
        }
        return await interaction.update(payload);
    } catch (error) {
        if (isExpired(error)) {
            await interaction.message?.edit(payload).catch(() => {});
            return null;
        }
        throw error;
    }
}

async function safeEphemeral(interaction, content) {
    return safeReply(interaction, { content, flags: MessageFlags.Ephemeral });
}

module.exports = { isExpired, safeDeferUpdate, safeReply, safeUpdate, safeEphemeral };
