const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../src/config/manager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Liste des commandes du bot'),

    async execute(interaction) {
        const serverName = config.get().Server.name;

        const helpEmbed = new EmbedBuilder()
            .setColor(require('../../src/utils/theme').COLORS.primary)
            .setTitle(`📚 Aide — ${serverName}`)
            .addFields(
                {
                    name: '⚙️ Configuration',
                    value: '`/config` — panneau interactif (menus, boutons, modals)\n`/config public:true` — panneau visible dans le salon'
                },
                {
                    name: '🔨 Modération',
                    value: '`/ban` `/kick` `/effacer`'
                },
                {
                    name: '🎉 Communauté',
                    value: '`/giveaway` — suggestions : écrire dans le salon dédié'
                },
                {
                    name: '💡 Suggestions (staff)',
                    value: '`/accept-suggestion` `/refuse-suggestion`'
                },
                {
                    name: '🎮 GMod & liens',
                    value: '`/ip` `/workshop` `/boutique` `/forum` `/topserv`'
                },
                {
                    name: '📊 Utilitaires',
                    value: '`/ping` `/avatar` `/info-serveur` `/credit`'
                },
                {
                    name: '👮 Factions',
                    value: '`/discordpolice` `/discordswat`'
                }
            )
            .setFooter({ text: 'Configuration initiale : npm run setup' });

        await interaction.reply({ embeds: [helpEmbed] });
    }
};
