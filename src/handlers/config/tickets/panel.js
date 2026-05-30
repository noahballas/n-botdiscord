const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelType
} = require('discord.js');
const config = require('../../../config/manager');
const { channelMention } = require('../../../utils/strings');
const { COLORS } = require('../../../utils/theme');
const { EmbedBuilder } = require('discord.js');
const { id, TICKET_PRESETS, TICKET_LIMITS, CLOSE_COOLDOWNS, getTicketPreset } = require('../constants');
const { MODES } = require('./constants');
const { formatCategoryList, getCategories } = require('./manager');

function embedBase() {
    return new EmbedBuilder().setColor(COLORS.primary).setTimestamp();
}

function ticketsEmbed(cfg, session = {}) {
    const categories = getCategories();
    const mode = session.ticketMode || MODES.LIST;
    const count = categories.length;

    if (mode === MODES.ADD) {
        const preset = session.ticketPreset ? getTicketPreset(session.ticketPreset) : null;
        return embedBase()
            .setTitle('➕ Ajouter une raison de ticket')
            .setDescription(
                [
                    'Une **raison** = une option dans le menu du panneau tickets.',
                    '',
                    '**Remplissez les 3 menus** puis **Enregistrer**.',
                    '',
                    `▸ Modèle : **${preset?.label ?? '—'}**`,
                    `▸ Rôle staff : ${session.ticketRoleId ? `<@&${session.ticketRoleId}>` : '—'}`,
                    `▸ Catégorie : ${session.ticketCategoryId ? `<#${session.ticketCategoryId}>` : '—'}`,
                    session.ticketPreset === 'custom'
                        ? `▸ Texte : ${session.ticketCustomLabel ? `**${session.ticketCustomLabel}**` : 'bouton **Texte**'}`
                        : null
                ]
                    .filter(Boolean)
                    .join('\n')
            );
    }

    if (mode === MODES.REMOVE) {
        return embedBase()
            .setTitle('🗑️ Supprimer des raisons')
            .setDescription(
                [
                    `**${count}** raison(s) active(s).`,
                    '',
                    '▸ Menu → supprimer **une** raison',
                    '▸ **Tout supprimer** → efface la liste entière'
                ].join('\n')
            )
            .addFields({ name: 'Liste', value: formatCategoryList(categories), inline: false });
    }

    if (mode === MODES.EDIT_PICK) {
        return embedBase()
            .setTitle('✏️ Modifier une raison')
            .setDescription('Sélectionnez la raison à modifier.')
            .addFields({ name: 'Raisons', value: formatCategoryList(categories), inline: false });
    }

    if (mode === MODES.EDIT_FORM) {
        const idx = session.ticketEditIndex;
        const preset = session.ticketPreset ? getTicketPreset(session.ticketPreset) : null;
        return embedBase()
            .setTitle(`✏️ Modifier la raison #${Number(idx) + 1}`)
            .setDescription('Ajustez les menus puis **Sauvegarder**.')
            .addFields(
                { name: 'Modèle', value: preset?.label ?? '—', inline: true },
                { name: 'Rôle', value: session.ticketRoleId ? `<@&${session.ticketRoleId}>` : '—', inline: true },
                {
                    name: 'Catégorie',
                    value: session.ticketCategoryId ? `<#${session.ticketCategoryId}>` : '—',
                    inline: true
                }
            );
    }

    return embedBase()
        .setTitle(`🎫 Raisons de tickets (${count})`)
        .setDescription(
            [
                'Gérez les **raisons** affichées dans le menu du panneau tickets.',
                '',
                `▸ Salon du panneau : ${channelMention(cfg.Channels.ticketChannelId)}`,
                `▸ Limite par joueur : **${cfg.Tickets.settings.maxTicketsPerUser}** ticket(s)`,
                `▸ Délai fermeture : **${cfg.Tickets.settings.closeCooldownSeconds ?? 10}s** (transcript + MP)`,
                `▸ Transcripts : ${cfg.Tickets.settings.transcriptEnabled !== false ? '✅ activés' : '❌ désactivés'}`,
                '',
                '**Publier** après chaque modification importante.'
            ].join('\n')
        )
        .addFields({ name: 'Raisons enregistrées', value: formatCategoryList(categories), inline: false });
}

function backButton() {
    return new ButtonBuilder()
        .setCustomId(id('btn', 'ticket', 'back'))
        .setLabel('Retour')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️');
}

function presetRoleCategoryRows(session) {
    const preset = session.ticketPreset;
    const rows = [
        new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(id('ticket', 'preset'))
                .setPlaceholder('Modèle de raison')
                .addOptions(
                    TICKET_PRESETS.map((p) => ({
                        label: p.label.slice(0, 100),
                        description: p.description.slice(0, 50),
                        value: p.id,
                        default: preset === p.id
                    }))
                )
        ),
        new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder()
                .setCustomId(id('ticket', 'role'))
                .setPlaceholder('Rôle staff')
        ),
        new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId(id('ticket', 'category'))
                .setPlaceholder('Catégorie Discord (dossier)')
                .setChannelTypes(ChannelType.GuildCategory)
        )
    ];

    return rows;
}

function ticketsActionRows(session = {}) {
    const mode = session.ticketMode || MODES.LIST;
    const cfg = config.get();
    const categories = getCategories();

    if (mode === MODES.ADD) {
        return [
            ...presetRoleCategoryRows(session),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(id('btn', 'modal', 'ticket', 'custom'))
                    .setLabel('Texte perso.')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(session.ticketPreset !== 'custom'),
                new ButtonBuilder()
                    .setCustomId(id('btn', 'ticket', 'save'))
                    .setLabel('Enregistrer')
                    .setStyle(ButtonStyle.Success),
                backButton()
            )
        ];
    }

    if (mode === MODES.REMOVE) {
        const rows = [];
        if (categories.length) {
            rows.push(
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(id('ticket', 'remove'))
                        .setPlaceholder('Raison à supprimer…')
                        .addOptions(
                            categories.slice(0, 25).map((c, i) => ({
                                label: c.label.slice(0, 100),
                                description: c.description.slice(0, 50),
                                value: String(i)
                            }))
                        )
                )
            );
        }
        rows.push(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(id('btn', 'ticket', 'clear'))
                    .setLabel('Tout supprimer')
                    .setStyle(ButtonStyle.Danger),
                backButton()
            )
        );
        return rows;
    }

    if (mode === MODES.EDIT_PICK) {
        const rows = [];
        if (categories.length) {
            rows.push(
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(id('ticket', 'edit'))
                        .setPlaceholder('Raison à modifier…')
                        .addOptions(
                            categories.slice(0, 25).map((c, i) => ({
                                label: c.label.slice(0, 100),
                                value: String(i)
                            }))
                        )
                )
            );
        }
        rows.push(new ActionRowBuilder().addComponents(backButton()));
        return rows;
    }

    if (mode === MODES.EDIT_FORM) {
        return [
            ...presetRoleCategoryRows(session),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(id('btn', 'modal', 'ticket', 'custom'))
                    .setLabel('Texte perso.')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(session.ticketPreset !== 'custom'),
                new ButtonBuilder()
                    .setCustomId(id('btn', 'ticket', 'save'))
                    .setLabel('Sauvegarder')
                    .setStyle(ButtonStyle.Success),
                backButton()
            )
        ];
    }

    const rows = [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(id('btn', 'ticket', 'mode', 'add'))
                .setLabel('Ajouter une raison')
                .setStyle(ButtonStyle.Success)
                .setEmoji('➕'),
            new ButtonBuilder()
                .setCustomId(id('btn', 'ticket', 'mode', 'remove'))
                .setLabel('Supprimer')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️')
                .setDisabled(categories.length === 0),
            new ButtonBuilder()
                .setCustomId(id('btn', 'ticket', 'mode', 'edit'))
                .setLabel('Modifier')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('✏️')
                .setDisabled(categories.length === 0)
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(id('btn', 'ticket', 'publish'))
                .setLabel('Publier le panneau')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📋'),
            new ButtonBuilder()
                .setCustomId(id('btn', 'ticket', 'toggle', 'transcript'))
                .setLabel(
                    cfg.Tickets.settings.transcriptEnabled !== false ? 'Transcript: ON' : 'Transcript: OFF'
                )
                .setStyle(ButtonStyle.Secondary)
        ),
        new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(id('ticket', 'max'))
                .setPlaceholder(`Limite : ${cfg.Tickets.settings.maxTicketsPerUser} ticket(s)/joueur`)
                .addOptions(
                    TICKET_LIMITS.map((n) => ({
                        label: `${n} ticket(s) max par joueur`,
                        value: n,
                        default: String(cfg.Tickets.settings.maxTicketsPerUser) === n
                    }))
                )
        ),
        new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(id('ticket', 'cooldown'))
                .setPlaceholder(`Fermeture : ${cfg.Tickets.settings.closeCooldownSeconds ?? 10}s`)
                .addOptions(
                    CLOSE_COOLDOWNS.map((n) => ({
                        label: `${n}s avant suppression`,
                        value: n,
                        default: String(cfg.Tickets.settings.closeCooldownSeconds ?? 10) === n
                    }))
                )
        )
    ];

    return rows;
}

module.exports = { ticketsEmbed, ticketsActionRows, MODES };
