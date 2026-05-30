const { Events, EmbedBuilder, ThreadAutoArchiveDuration } = require('discord.js');
const config = require('../config/manager');
const { COLORS } = require('../utils/embeds');

const REACTIONS = ['✅', '🤷', '❌'];

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        const { Channels, Server } = config.get();
        if (
            !Channels.suggestionsChannelId ||
            message.channel.id !== Channels.suggestionsChannelId ||
            message.author.bot
        ) {
            return;
        }

        try {
            const embed = new EmbedBuilder()
                .setColor(COLORS.primary)
                .setAuthor({
                    name: `Suggestion de ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL({ size: 256 })
                })
                .setDescription(message.content)
                .addFields({ name: 'Statut', value: '🟡 En attente', inline: true })
                .setFooter({
                    text: `ID: ${message.author.id} • ${Server.name}`,
                    iconURL: Server.logoUrl || undefined
                })
                .setTimestamp();

            const posted = await message.channel.send({ embeds: [embed] });
            await message.delete().catch(() => {});

            const thread = await posted.startThread({
                name: `Discussion: ${message.content.slice(0, 50)}${message.content.length > 50 ? '…' : ''}`,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek
            });

            await thread.send({
                content: message.author.toString(),
                embeds: [
                    new EmbedBuilder()
                        .setColor(COLORS.primary)
                        .setDescription('💡 Votez avec les réactions et discutez ici.')
                ]
            });

            await Promise.all(REACTIONS.map((r) => posted.react(r).catch(() => {})));
        } catch (err) {
            console.error('[suggestions]', err);
        }
    }
};
