const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Affiche l\'avatar d\'un utilisateur.')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('L\'utilisateur dont vous voulez voir l\'avatar')
            .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 512 });

        await interaction.reply({ content: `${user.tag} : ${avatarUrl}` });
    },
};
