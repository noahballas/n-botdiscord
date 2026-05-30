const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelType
} = require('discord.js');
const config = require('../../config/manager');
const { channelMention } = require('../../utils/strings');
const { VIEWS, CHANNEL_SLOTS, ROLE_LISTS, LINKS, BOT_STATUSES, BOT_ACTIVITIES, id } = require('./constants');
const { formatPresenceSummary } = require('../../services/botPresence');
const { ticketsEmbed, ticketsActionRows } = require('./tickets/panel');
const { COLORS, progressBar } = require('../../utils/theme');

function embedBase() {
    return new EmbedBuilder().setColor(COLORS.primary).setTimestamp();
}

function status(ok) {
    return ok ? '✅' : '❌';
}

function truncate(str, max = 80) {
    if (!str) return '—';
    return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

function navOptions(current) {
    return [
        { label: 'Accueil', value: VIEWS.HOME, emoji: '🏠', default: current === VIEWS.HOME },
        { label: 'Serveur', value: VIEWS.SERVER, emoji: '🏷️', default: current === VIEWS.SERVER },
        { label: 'Garry\'s Mod', value: VIEWS.GMOD, emoji: '🎮', default: current === VIEWS.GMOD },
        { label: 'Liens', value: VIEWS.LINKS, emoji: '🔗', default: current === VIEWS.LINKS },
        { label: 'Salons', value: VIEWS.CHANNELS, emoji: '📢', default: current === VIEWS.CHANNELS },
        { label: 'Rôles', value: VIEWS.ROLES, emoji: '🎭', default: current === VIEWS.ROLES },
        { label: 'Tickets', value: VIEWS.TICKETS, emoji: '🎫', default: current === VIEWS.TICKETS },
        { label: 'Bot Discord', value: VIEWS.BOT, emoji: '🤖', default: current === VIEWS.BOT }
    ];
}

function navigationRow(current) {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(id('nav'))
            .setPlaceholder('📂 Naviguer dans la configuration…')
            .addOptions(navOptions(current))
    );
}

function homeEmbed(cfg) {
    const checks = [
        ['Token Discord', cfg.DiscordBot.token && !config.isPlaceholder(cfg.DiscordBot.token)],
        ['Client / Guild ID', cfg.DiscordBot.clientId && cfg.DiscordBot.guildId],
        ['Nom serveur', cfg.Server.name],
        ['IP GMod', cfg.GMod.ip],
        ['Salon bienvenue', cfg.Channels.welcomeChannelId],
        ['Salon tickets', cfg.Channels.ticketChannelId],
        ['Catégories tickets', cfg.Tickets.categories.length > 0],
        ['Rôles admin bot', cfg.Roles.adminRoles.length > 0]
    ];
    const done = checks.filter(([, ok]) => ok).length;

    return embedBase()
        .setTitle('⚙️ Configuration du bot')
        .setDescription(
            [
                'Panneau de gestion pour votre communauté **Garry\'s Mod**.',
                '▸ Menu déroulant → changer de section',
                '▸ Boutons → modifier les textes',
                '▸ Menus salon/rôle → assigner sans copier d\'IDs',
                '',
                `**Avancement** ${progressBar(done, checks.length)}`
            ].join('\n')
        )
        .addFields({
            name: 'Éléments requis',
            value: checks.map(([label, ok]) => `${status(ok)} ${label}`).join('\n')
        })
        .setFooter({ text: 'Sauvegarde automatique · config.json' });
}

function serverEmbed(cfg) {
    return embedBase()
        .setTitle('🏷️ Identité du serveur')
        .setDescription('Apparence affichée dans les embeds et le panneau tickets.')
        .addFields(
            { name: 'Nom public', value: `**${cfg.Server.name || '—'}**`, inline: true },
            { name: 'Logo', value: truncate(cfg.Server.logoUrl, 36), inline: true },
            { name: 'Bannière', value: truncate(cfg.Server.bannerUrl, 36), inline: true },
            {
                name: 'Message panneau tickets',
                value: truncate(cfg.Server.ticketSettings?.panelDescription, 200)
            }
        );
}

function gmodEmbed(cfg) {
    return embedBase()
        .setTitle('🎮 Connexion GMod')
        .setDescription('Utilisé par la commande `/ip` et les annonces.')
        .addFields(
            { name: 'Adresse', value: cfg.GMod.ip ? `\`\`\`${cfg.GMod.ip}\`\`\`` : '—', inline: false },
            { name: 'Lien Steam', value: truncate(cfg.GMod.connectCommand, 80) || '—', inline: false }
        );
}

function linksEmbed(cfg) {
    return embedBase()
        .setTitle('🔗 Liens & ressources')
        .setDescription('Sélectionnez un lien puis **Modifier** pour coller l\'URL.')
        .addFields(
            LINKS.map((l) => ({
                name: l.label,
                value: truncate(cfg.Commands[l.key], 60) || '—',
                inline: true
            }))
        );
}

function channelsEmbed(cfg) {
    return embedBase()
        .setTitle('📢 Salons Discord')
        .setDescription('Choisissez le type de salon, puis le salon dans le menu.')
        .addFields(
            CHANNEL_SLOTS.map((s) => ({
                name: `${s.emoji} ${s.label}`,
                value: channelMention(cfg.Channels[s.key]),
                inline: true
            }))
        );
}

function rolesEmbed(cfg) {
    const sugg = cfg.Roles.acceptSuggestion
        ? `<@&${cfg.Roles.acceptSuggestion}>`
        : '—';
    return embedBase()
        .setTitle('🎭 Rôles & permissions')
        .setDescription('Listes utilisées par la modération et `/config`.')
        .addFields(
            ...ROLE_LISTS.map((r) => {
                const ids = cfg.Roles[r.key] || [];
                return {
                    name: `${r.emoji} ${r.label}`,
                    value: ids.length ? ids.map((i) => `<@&${i}>`).join(' ') : '—',
                    inline: false
                };
            }),
            { name: '💡 Modération suggestions', value: sugg, inline: false }
        );
}

function botEmbed(cfg) {
    const p = cfg.DiscordBot.presence ?? {};
    const summary = formatPresenceSummary(cfg);
    const bio = (p.bio || '').trim();

    return embedBase()
        .setTitle('🤖 Bot Discord')
        .setDescription(
            [
                '**Connexion** — token, IDs (redémarrage si token changé).',
                '**Présence** — statut + activité / bio affichée sous le bot.',
                '',
                '⚠️ Ne partagez jamais le **token**. Utilisez `/config` en éphémère.'
            ].join('\n')
        )
        .addFields(
            { name: 'Token', value: `\`${config.maskToken(cfg.DiscordBot.token)}\``, inline: true },
            { name: 'Client ID', value: `\`${cfg.DiscordBot.clientId || '—'}\``, inline: true },
            { name: 'Guild ID', value: `\`${cfg.DiscordBot.guildId || '—'}\``, inline: true },
            { name: 'Statut Discord', value: summary.status, inline: true },
            { name: 'Activité', value: summary.activity, inline: true },
            {
                name: 'Bio / texte',
                value: bio ? `\`${bio.slice(0, 80)}${bio.length > 80 ? '…' : ''}\`` : '*(vide — bouton **Bio**)*',
                inline: false
            }
        );
}

function actionRows(view, session = {}, guild = null) {
    const rows = [];

    if (view === VIEWS.HOME) {
        rows.push(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(id('btn', 'refresh'))
                    .setLabel('Actualiser')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔄')
            )
        );
    }

    if (view === VIEWS.SERVER) {
        rows.push(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(id('btn', 'modal', 'server', 'name'))
                    .setLabel('Nom')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(id('btn', 'modal', 'server', 'logo'))
                    .setLabel('Logo URL')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(id('btn', 'modal', 'server', 'banner'))
                    .setLabel('Bannière')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(id('btn', 'modal', 'server', 'panelDesc'))
                    .setLabel('Desc. tickets')
                    .setStyle(ButtonStyle.Secondary)
            )
        );
    }

    if (view === VIEWS.GMOD) {
        rows.push(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(id('btn', 'modal', 'gmod', 'ip'))
                    .setLabel('IP serveur')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(id('btn', 'modal', 'gmod', 'connect'))
                    .setLabel('Steam connect')
                    .setStyle(ButtonStyle.Primary)
            )
        );
    }

    if (view === VIEWS.LINKS) {
        rows.push(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(id('pick', 'link'))
                    .setPlaceholder('Choisir un lien à modifier…')
                    .addOptions(
                        LINKS.map((l) => ({
                            label: l.label,
                            value: l.key,
                            default: session.linkKey === l.key
                        }))
                    )
            )
        );
        if (session.linkKey) {
            rows.push(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(id('btn', 'modal', 'link', session.linkKey))
                        .setLabel(`✏️ Modifier ${LINKS.find((l) => l.key === session.linkKey)?.label}`)
                        .setStyle(ButtonStyle.Success)
                )
            );
        }
    }

    if (view === VIEWS.CHANNELS) {
        rows.push(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(id('pick', 'channel'))
                    .setPlaceholder('Quel salon configurer ?')
                    .addOptions(
                        CHANNEL_SLOTS.map((s) => ({
                            label: s.label,
                            value: s.key,
                            emoji: s.emoji,
                            default: session.channelSlot === s.key
                        }))
                    )
            )
        );
        if (session.channelSlot) {
            rows.push(
                new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId(id('set', 'channel', session.channelSlot))
                        .setPlaceholder('Sélectionnez le salon…')
                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                )
            );
        }
    }

    if (view === VIEWS.ROLES) {
        rows.push(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(id('pick', 'rolelist'))
                    .setPlaceholder('Liste de rôles à gérer…')
                    .addOptions(
                        [
                            ...ROLE_LISTS.map((r) => ({
                                label: r.label,
                                value: r.key,
                                emoji: r.emoji,
                                default: session.roleList === r.key
                            })),
                            {
                                label: 'Modération suggestions',
                                value: 'acceptSuggestion',
                                emoji: '💡',
                                default: session.roleList === 'acceptSuggestion'
                            }
                        ]
                    )
            )
        );
        if (session.roleList) {
            if (session.roleList === 'acceptSuggestion') {
                rows.push(
                    new ActionRowBuilder().addComponents(
                        new RoleSelectMenuBuilder()
                            .setCustomId(id('set', 'suggestion'))
                            .setPlaceholder('Rôle modération suggestions…')
                    )
                );
            } else {
                const cfg = config.get();
                const ids = cfg.Roles[session.roleList] || [];
                rows.push(
                    new ActionRowBuilder().addComponents(
                        new RoleSelectMenuBuilder()
                            .setCustomId(id('add', 'role', session.roleList))
                            .setPlaceholder('Ajouter un rôle…')
                    )
                );
                if (ids.length) {
                    rows.push(
                        new ActionRowBuilder().addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(id('del', 'role', session.roleList))
                                .setPlaceholder('Retirer un rôle…')
                                .addOptions(
                                    ids.slice(0, 25).map((rid) => {
                                        const role = guild?.roles?.cache?.get(rid);
                                        return {
                                            label: role?.name?.slice(0, 100) || 'Rôle',
                                            description: rid,
                                            value: rid
                                        };
                                    })
                                )
                        )
                    );
                }
            }
        }
    }

    if (view === VIEWS.TICKETS) {
        rows.push(...ticketsActionRows(session));
    }

    if (view === VIEWS.BOT) {
        const p = config.get().DiscordBot.presence ?? {};
        const activityType = p.activityType || 'none';

        rows.push(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(id('bot', 'status'))
                    .setPlaceholder('Statut Discord')
                    .addOptions(
                        BOT_STATUSES.map((s) => ({
                            label: s.label,
                            value: s.value,
                            default: (p.status || 'online') === s.value
                        }))
                    )
            ),
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(id('bot', 'activity'))
                    .setPlaceholder('Type d\'activité')
                    .addOptions(
                        BOT_ACTIVITIES.map((a) => ({
                            label: a.label,
                            value: a.value,
                            default: activityType === a.value
                        }))
                    )
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(id('btn', 'modal', 'bot', 'bio'))
                    .setLabel('Bio / activité')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✏️'),
                new ButtonBuilder()
                    .setCustomId(id('btn', 'modal', 'bot', 'stream'))
                    .setLabel('URL Twitch')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📺')
                    .setDisabled(activityType !== 'streaming')
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(id('btn', 'modal', 'bot', 'clientId'))
                    .setLabel('Client ID')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(id('btn', 'modal', 'bot', 'guildId'))
                    .setLabel('Guild ID')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(id('btn', 'modal', 'bot', 'token'))
                    .setLabel('Token')
                    .setStyle(ButtonStyle.Danger)
            )
        );
    }

    return rows;
}

function buildPanel(view, { userId, session = {}, guild = null }) {
    const cfg = config.get();
    const embeds = {
        [VIEWS.HOME]: homeEmbed,
        [VIEWS.SERVER]: serverEmbed,
        [VIEWS.GMOD]: gmodEmbed,
        [VIEWS.LINKS]: linksEmbed,
        [VIEWS.CHANNELS]: channelsEmbed,
        [VIEWS.ROLES]: rolesEmbed,
        [VIEWS.TICKETS]: (c) => ticketsEmbed(c, session),
        [VIEWS.BOT]: botEmbed
    };

    const embed = embeds[view]?.(cfg) ?? homeEmbed(cfg);
    const components = [
        navigationRow(view),
        ...actionRows(view, { ...session, ownerId: userId }, guild)
    ];

    return { embeds: [embed], components: components.slice(0, 5) };
}

module.exports = { buildPanel, VIEWS };
