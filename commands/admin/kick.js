const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { banRoles } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick un membre du serveur.')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('Le membre à kicker')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
            .setDescription('La raison du kick')
            .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Aucune raison fournie';
        const member = await interaction.guild.members.fetch(user.id);
        const userRoles = interaction.member.roles.cache;

        // Vérifier si l'utilisateur a un rôle avec la permission de kicker
        const hasPermission = userRoles.some(role => banRoles.includes(role.id));

        if (!hasPermission) {
            return interaction.reply({ content: "Vous n'avez pas la permission de kicker des membres.", ephemeral: true });
        }

        if (!member) {
            return interaction.reply({ content: "Ce membre n'est pas sur le serveur.", ephemeral: true });
        }

        try {
            await member.kick(reason);
            await interaction.reply({ content: `${user.tag} a été kické. Raison : ${reason}` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Erreur lors du kick de ce membre.', ephemeral: true });
        }
    },
};
