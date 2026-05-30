const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function buildConfigCommand() {
    return new SlashCommandBuilder()
        .setName('config')
        .setDescription('Panneau de configuration interactif (embeds)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption((o) =>
            o
                .setName('public')
                .setDescription('Afficher le panneau dans le salon (sinon éphémère)')
                .setRequired(false)
        );
}

module.exports = { buildConfigCommand };
