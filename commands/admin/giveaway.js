const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Lance un giveaway')
        .addStringOption(option =>
            option.setName('prix')
                .setDescription('Le prix du giveaway')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('durée')
                .setDescription('La durée du giveaway en minutes')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('nombre_gagnants')
                .setDescription('Nombre de gagnants')
                .setRequired(true)),
    async execute(interaction) {
        // Vérification initiale
        if (!interaction.isCommand()) return;

        const prize = interaction.options.getString('prix');
        const duration = interaction.options.getInteger('durée');
        const numberOfWinners = interaction.options.getInteger('nombre_gagnants');
        const channel = interaction.channel;

        // Validation du nombre de gagnants
        if (numberOfWinners < 1) {
            return interaction.reply({ content: 'Le nombre de gagnants doit être d\'au moins 1.', ephemeral: true });
        }

        // Création de l'embed de départ
        const embed = new EmbedBuilder()
            .setTitle('🎉 Giveaway !')
            .setDescription(`**Prix:** ${prize}\nRéagissez avec 🎉 pour participer !\n**Durée:** ${duration} minutes\n**Nombre de gagnants:** ${numberOfWinners}`)
            .setColor('#00FF00')
            .setTimestamp(Date.now() + duration * 60000)
            .setFooter({ text: `Se termine à` });

        // Envoi de l'embed une seule fois
        const message = await channel.send({ embeds: [embed] });
        await message.react('🎉');

        // Attendre la fin du giveaway
        setTimeout(async () => {
            const reaction = message.reactions.cache.get('🎉');
            if (!reaction) {
                return channel.send('Pas de participants au giveaway.');
            }

            const users = await reaction.users.fetch();
            const participants = users.filter(user => !user.bot).map(user => user);

            if (participants.length === 0) {
                return channel.send('Pas de participants au giveaway.');
            }

            // Limiter le nombre de gagnants au nombre de participants disponibles
            const winnersCount = Math.min(numberOfWinners, participants.length);
            const winners = [];

            while (winners.length < winnersCount) {
                const winnerIndex = Math.floor(Math.random() * participants.length);
                const winner = participants.splice(winnerIndex, 1)[0];
                winners.push(winner);
            }

            // Mettre à jour l'embed existant avec les gagnants
            embed.setDescription(`🎉 **Giveaway terminé !** 🎉\n**Prix:** ${prize}\n**Gagnant(s):**\n${winners.map(winner => winner.tag).join('\n')}`)
                .setColor('#FFD700');

            await message.edit({ embeds: [embed] });

            // Annoncer les gagnants dans le même channel
            await channel.send(`🎉 Félicitations ${winners.map(winner => winner.toString()).join(', ')}! Vous avez gagné **${prize}**!`);
        }, duration * 60000);
    }
};
