const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes disponibles.'),
    async execute(interaction) {
        await interaction.reply({
            content: `Voici une liste des commandes disponibles :
- \`/kick\` : Kick un membre du serveur.
- \`/ban\` : Ban un membre du serveur.
- \`/deban\` : Débannir un membre du serveur.
- \`/effacer\` : Efface un certain nombre de messages.
- \`/avatar\` : Affiche l'avatar d'un utilisateur.
- \`/info-serveur\` : Affiche les informations sur le serveur.
- \`/discordswat\` : Affiche le discord swat.
- \`/discordpolice\` : Affiche le discord police.
- \`/forum\` : Affiche le forum.
- \`/workshop\` : Affiche le workshop.
- \`/topserv\` : Affiche le lien top serveur.
- \`/credit\` : Affiche le créateur 😁.
            `,
            ephemeral: true,
        });
    },
};
