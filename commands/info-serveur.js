const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info-serveur')
        .setDescription('Affiche les informations du serveur.'),
    async execute(interaction) {
        const { guild } = interaction;
        const { name, memberCount, createdAt, ownerId } = guild;

        const owner = await guild.members.fetch(ownerId);

        await interaction.reply({
            content: `**Nom du serveur :** ${name}\n**Propriétaire :** ${owner.user.tag}\n**Membres :** ${memberCount}\n**Créé le :** ${createdAt.toDateString()}`,
        });
    },
};
