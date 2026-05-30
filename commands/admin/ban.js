const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { canBan } = require('../../src/utils/permissions');
const { fetchGuildMember, validateModerationTarget } = require('../../src/utils/moderation');
const { replyEphemeral, replyError } = require('../../src/utils/interaction');
const { COLORS } = require('../../src/utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannit un membre')
        .addUserOption((o) => o.setName('membre').setDescription('Membre').setRequired(true))
        .addStringOption((o) => o.setName('raison').setDescription('Raison'))
        .addIntegerOption((o) =>
            o.setName('jours').setDescription('Jours de messages à supprimer (0-7)').setMinValue(0).setMaxValue(7)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        if (!canBan(interaction.member)) {
            return replyEphemeral(interaction, '❌ Permission refusée.');
        }

        const user = interaction.options.getUser('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison';
        const deleteDays = interaction.options.getInteger('jours') ?? 0;

        const member = await fetchGuildMember(interaction.guild, user.id);
        const block = validateModerationTarget(interaction.member, member, user.id);
        if (block) return replyEphemeral(interaction, block);
        if (!member.bannable) {
            return replyEphemeral(interaction, '❌ Je ne peux pas bannir ce membre.');
        }

        try {
            await member.ban({
                reason: `[${interaction.user.tag}] ${reason}`,
                deleteMessageSeconds: deleteDays * 86400
            });

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(COLORS.primary)
                        .setTitle('🔨 Banni')
                        .setDescription(`${user.tag} a été banni.`)
                        .addFields(
                            { name: 'Raison', value: reason, inline: true },
                            { name: 'Messages', value: `${deleteDays} j`, inline: true }
                        )
                        .setFooter({ text: interaction.user.tag })
                        .setTimestamp()
                ]
            });
        } catch (err) {
            console.error('[ban]', err);
            return replyError(interaction);
        }
    }
};
