const { Events, EmbedBuilder, ThreadAutoArchiveDuration, PermissionsBitField } = require('discord.js');
const { suggestionsChannelId } = require('../config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.channel.id !== suggestionsChannelId || message.author.bot) return;

        const suggestionEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setDescription(message.content)
            .setTimestamp();

        const sentMessage = await message.channel.send({ embeds: [suggestionEmbed] });
        await message.delete();

        const thread = await sentMessage.startThread({
            name: `Suggestion de ${message.author.username}`,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
        });

        await thread.send(`Merci pour la suggestion ${message.author}!`);

        await sentMessage.react('✅');
        await sentMessage.react('🤷');
        await sentMessage.react('❌');
    },
};
