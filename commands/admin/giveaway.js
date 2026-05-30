const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isConfigAdmin } = require('../../src/utils/permissions');
const { buildGiveawayEmbed, scheduleGiveaway } = require('../../src/services/giveaway');
const { replyEphemeral } = require('../../src/utils/interaction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Lance un giveaway')
        .addStringOption((o) => o.setName('prix').setDescription('Prix').setRequired(true))
        .addIntegerOption((o) =>
            o.setName('durée').setDescription('Minutes').setRequired(true).setMinValue(1)
        )
        .addIntegerOption((o) =>
            o.setName('nombre_gagnants').setDescription('Gagnants').setRequired(true).setMinValue(1)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

    async execute(interaction) {
        if (!isConfigAdmin(interaction.member)) {
            return replyEphemeral(interaction, '❌ Réservé aux administrateurs du bot.');
        }

        const prize = interaction.options.getString('prix');
        const duration = interaction.options.getInteger('durée');
        const winners = interaction.options.getInteger('nombre_gagnants');

        await replyEphemeral(interaction, '✅ Giveaway lancé !');
        const message = await interaction.channel.send({
            embeds: [buildGiveawayEmbed(prize, duration, winners)]
        });
        await message.react('🎉');
        scheduleGiveaway(interaction.channel, message, prize, duration, winners);
    }
};
