const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { canKick } = require('../../src/utils/permissions');
const { fetchGuildMember, validateModerationTarget } = require('../../src/utils/moderation');
const { replyEphemeral, replyError } = require('../../src/utils/interaction');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulse un membre')
        .addUserOption((o) => o.setName('membre').setDescription('Membre').setRequired(true))
        .addStringOption((o) => o.setName('raison').setDescription('Raison'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        if (!canKick(interaction.member)) {
            return replyEphemeral(interaction, '❌ Permission refusée.');
        }

        const user = interaction.options.getUser('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison';
        const member = await fetchGuildMember(interaction.guild, user.id);
        const block = validateModerationTarget(interaction.member, member, user.id);
        if (block) return replyEphemeral(interaction, block);
        if (!member.kickable) {
            return replyEphemeral(interaction, '❌ Je ne peux pas expulser ce membre.');
        }

        try {
            await member.kick(reason);
            await interaction.reply({
                content: `✅ ${user.tag} expulsé.\n📝 ${reason}`,
                allowedMentions: { users: [] }
            });
        } catch (err) {
            console.error('[kick]', err);
            return replyError(interaction);
        }
    }
};
