const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} = require('discord.js');
const config = require('../config/manager');
const { sanitizeUsername, countUserTickets } = require('../utils/strings');
const { COLORS } = require('../utils/theme');
const { CUSTOM_IDS: CLOSE_IDS, handleCloseButton } = require('./ticketClose');

const CUSTOM_IDS = {
    select: 'ticketSelect',
    ...CLOSE_IDS
};

async function publishPanel(client) {
    const cfg = config.get();
    const channelId = cfg.Channels?.ticketChannelId;
    if (!channelId) {
        throw new Error('Salon tickets non configuré (`/config salon tickets`).');
    }

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel?.isTextBased()) {
        throw new Error(`Salon introuvable (${channelId})`);
    }

    const categories = cfg.Tickets?.categories ?? [];
    if (categories.length === 0) {
        throw new Error('Aucune catégorie — `/config ticket-categorie`.');
    }

    const botMessages = (await channel.messages.fetch({ limit: 100 })).filter(
        (m) => m.author.id === client.user.id
    );
    if (botMessages.size) await channel.bulkDelete(botMessages);

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(CUSTOM_IDS.select)
            .setPlaceholder('Sélectionnez une catégorie…')
            .addOptions(
                categories.map((cat, i) => ({
                    label: cat.label.slice(0, 100),
                    description: (cat.description || '').slice(0, 50),
                    value: String(i)
                }))
            )
    );

    const embed = new EmbedBuilder()
        .setColor(COLORS.primary)
        .setTitle(`🎫 Support — ${cfg.Server.name}`)
        .setDescription(
            cfg.Server.ticketSettings?.panelDescription ||
            'Choisissez une catégorie pour ouvrir un ticket.'
        )
        .setThumbnail(cfg.Server.logoUrl || null)
        .setFooter({ text: `${client.user.username} • ${new Date().getFullYear()}` });

    await channel.send({ embeds: [embed], components: [row] });
}

async function createFromSelect(interaction) {
    const cfg = config.get();
    const index = Number.parseInt(interaction.values[0], 10);
    const category = cfg.Tickets.categories[index];
    const max = cfg.Tickets.settings?.maxTicketsPerUser ?? 1;

    if (!category) {
        return interaction.reply({ content: '❌ Catégorie invalide.', flags: MessageFlags.Ephemeral });
    }

    const open = countUserTickets(interaction.guild, interaction.user);
    if (open.size >= max) {
        return interaction.reply({
            content: `❌ Limite de ${max} ticket(s) :\n${open.map((ch) => `- ${ch}`).join('\n')}`,
            flags: MessageFlags.Ephemeral
        });
    }

    const prefix = cfg.Server.ticketSettings?.ticketPrefix ?? 'ticket-';
    const channelName = `${prefix}${sanitizeUsername(interaction.user.username)}`.slice(0, 100);

    const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.categoryId,
        topic: `Ticket — ${interaction.user.id}`,
        permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            {
                id: interaction.user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            },
            {
                id: category.roleId,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ManageChannels
                ]
            }
        ]
    });

    const title = category.label.split('|')[1]?.trim() || category.label;
    const embed = new EmbedBuilder()
        .setColor(COLORS.accent)
        .setTitle(`Ticket ${title}`)
        .setDescription(category.description)
        .addFields(
            { name: 'Utilisateur', value: interaction.user.toString(), inline: true },
            { name: 'Staff', value: `<@&${category.roleId}>`, inline: true }
        )
        .setFooter({ text: `ID: ${interaction.user.id}` });

    await ticketChannel.send({
        content: `${interaction.user} <@&${category.roleId}>`,
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(CUSTOM_IDS.close)
                    .setLabel('Fermer le ticket')
                    .setStyle(ButtonStyle.Danger)
            )
        ]
    });

    return interaction.reply({
        content: `✅ Ticket créé : ${ticketChannel}`,
        flags: MessageFlags.Ephemeral
    });
}

async function handleButton(interaction, client) {
    return handleCloseButton(interaction, client);
}

function isTicketInteraction(interaction) {
    if (interaction.isStringSelectMenu() && interaction.customId === CUSTOM_IDS.select) return true;
    if (
        interaction.isButton() &&
        [CUSTOM_IDS.close, CUSTOM_IDS.confirmClose, CUSTOM_IDS.cancelClose].includes(
            interaction.customId
        )
    ) {
        return true;
    }
    return false;
}

async function handleTicketInteraction(interaction, client) {
    if (interaction.isStringSelectMenu()) return createFromSelect(interaction);
    return handleButton(interaction, client);
}

module.exports = {
    CUSTOM_IDS,
    publishPanel,
    isTicketInteraction,
    handleTicketInteraction
};
