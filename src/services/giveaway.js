const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../utils/embeds');

function buildGiveawayEmbed(prize, durationMin, winnersCount) {
    return new EmbedBuilder()
        .setTitle('🎉 Giveaway')
        .setDescription(
            `**Prix :** ${prize}\nRéagissez avec 🎉 !\n**Durée :** ${durationMin} min\n**Gagnants :** ${winnersCount}`
        )
        .setColor(COLORS.success)
        .setTimestamp(Date.now() + durationMin * 60_000)
        .setFooter({ text: 'Se termine à' });
}

function scheduleGiveaway(channel, message, prize, durationMin, winnersCount) {
    setTimeout(async () => {
        const reaction = message.reactions.cache.get('🎉');
        if (!reaction) {
            await channel.send('Aucun participant.');
            return;
        }

        const users = await reaction.users.fetch();
        const pool = users.filter((u) => !u.bot).map((u) => u);

        if (!pool.length) {
            await channel.send('Aucun participant.');
            return;
        }

        const winners = [];
        const remaining = [...pool];
        const count = Math.min(winnersCount, remaining.length);

        while (winners.length < count) {
            const i = Math.floor(Math.random() * remaining.length);
            winners.push(remaining.splice(i, 1)[0]);
        }

        const done = EmbedBuilder.from(message.embeds[0]?.data ?? {})
            .setDescription(
                `🎉 **Terminé**\n**Prix :** ${prize}\n**Gagnant(s) :**\n${winners.map((w) => w.tag).join('\n')}`
            )
            .setColor(COLORS.accent);

        await message.edit({ embeds: [done] });
        await channel.send(
            `🎉 ${winners.map((w) => w.toString()).join(', ')} — vous avez gagné **${prize}** !`
        );
    }, durationMin * 60_000);
}

module.exports = { buildGiveawayEmbed, scheduleGiveaway };
