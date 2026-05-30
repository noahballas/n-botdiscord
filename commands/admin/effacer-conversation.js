const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { canDeleteMessages } = require('../../src/utils/permissions');
const { replyEphemeral, replyError } = require('../../src/utils/interaction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('effacer')
        .setDescription('Supprime des messages (1-100)')
        .addIntegerOption((o) =>
            o.setName('nombre').setDescription('Quantité').setRequired(true).setMinValue(1).setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        if (!canDeleteMessages(interaction.member)) {
            return replyEphemeral(interaction, '❌ Permission refusée.');
        }

        const count = interaction.options.getInteger('nombre');
        const me = interaction.guild.members.me;

        if (!interaction.channel.permissionsFor(me).has(PermissionFlagsBits.ManageMessages)) {
            return replyEphemeral(interaction, '❌ Permission Manage Messages manquante.');
        }

        try {
            const fetched = await interaction.channel.messages.fetch({ limit: count + 1 });
            const deletable = fetched.filter((m) => Date.now() - m.createdTimestamp < 1_209_600_000);

            if (!deletable.size) {
                return replyEphemeral(interaction, '❌ Aucun message récent (limite 14 jours).');
            }

            const deleted = await interaction.channel.bulkDelete(deletable, true);
            const reply = await replyEphemeral(
                interaction,
                `🗑️ ${deleted.size} message(s) supprimé(s).`
            );
            setTimeout(() => reply.delete().catch(() => {}), 5000);
        } catch (err) {
            console.error('[effacer]', err);
            return replyError(interaction);
        }
    }
};
