const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('credit')
        .setDescription('Bot crée par Noah Ballas'),
    async execute(interaction) {
        await interaction.reply('**Lien de Noah Ballas [Support MP] : \n https://discord.com/users/662911266742075405 \n https://aide-serveur.fr/ressources/bot-discord-admin.4319/ \n **');
    },
};