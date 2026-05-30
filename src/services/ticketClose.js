const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const config = require('../config/manager');
const { COLORS } = require('../utils/theme');
const {
    buildTranscript,
    deliverTranscript,
    isClosing,
    markClosing,
    unmarkClosing
} = require('./ticketTranscript');

const CUSTOM_IDS = {
    close: 'closeTicket',
    confirmClose: 'confirmClose',
    cancelClose: 'cancelClose'
};

function getCloseCooldownSeconds() {
    const sec = config.get().Tickets?.settings?.closeCooldownSeconds;
    return Number.isFinite(sec) && sec >= 0 ? sec : 10;
}

async function startCloseCountdown(interaction, client) {
    const channel = interaction.channel;
    if (!channel?.isTextBased()) return;

    if (isClosing(channel.id)) {
        return interaction.update({
            content: '⏳ Une fermeture est déjà en cours…',
            embeds: [],
            components: []
        });
    }

    const seconds = getCloseCooldownSeconds();
    markClosing(channel.id);

    await interaction.update({
        content: seconds > 0 ? `✅ Fermeture dans **${seconds}** seconde(s)…` : '✅ Fermeture du ticket…',
        embeds: [],
        components: []
    });

    const transcriptsOn = config.get().Tickets?.settings?.transcriptEnabled !== false;
    const countdownEmbed = new EmbedBuilder()
        .setColor(COLORS.primary)
        .setTitle('🔒 Fermeture du ticket')
        .setDescription(
            seconds > 0
                ? [
                      `Ce ticket sera fermé dans **${seconds} secondes**.`,
                      '',
                      transcriptsOn
                          ? 'Un **transcript** sera envoyé en message privé au créateur du ticket.'
                          : 'Le salon sera supprimé sans transcript.',
                      'Le salon sera ensuite supprimé.'
                  ].join('\n')
                : [
                      transcriptsOn
                          ? 'Génération du **transcript** en cours…'
                          : 'Fermeture du ticket…',
                      'Le salon sera supprimé dans un instant.'
                  ].join('\n')
        )
        .setFooter({ text: `Fermé par ${interaction.user.tag}` })
        .setTimestamp();

    await channel.send({ embeds: [countdownEmbed] }).catch(() => {});

    setTimeout(async () => {
        try {
            const ch = await client.channels.fetch(channel.id).catch(() => null);
            if (!ch?.isTextBased()) return;

            const settings = config.get().Tickets?.settings ?? {};
            if (settings.transcriptEnabled !== false) {
                const transcript = await buildTranscript(ch, interaction.user);
                await deliverTranscript(client, {
                    channel: ch,
                    closedBy: interaction.user,
                    transcript,
                    postInChannel: true
                });
            }

            await ch.delete(`Ticket fermé par ${interaction.user.tag}`);
        } catch (err) {
            console.error('[ticket-close]', err);
            const ch = await client.channels.fetch(channel.id).catch(() => null);
            if (ch?.isTextBased()) {
                await ch
                    .send('❌ Erreur lors de la fermeture. Contactez un administrateur.')
                    .catch(() => {});
            }
        } finally {
            unmarkClosing(channel.id);
        }
    }, seconds * 1000);
}

function transcriptLines() {
    const enabled = config.get().Tickets?.settings?.transcriptEnabled !== false;
    if (!enabled) return [];
    return ['📋 Un transcript sera envoyé en **MP** au joueur', cfgStaffHint()].filter(Boolean);
}

async function handleCloseButton(interaction, client) {
    const { customId } = interaction;

    if (customId === CUSTOM_IDS.close) {
        const seconds = getCloseCooldownSeconds();
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(COLORS.primary)
                    .setTitle('Confirmer la fermeture')
                    .setDescription(
                        [
                            'Voulez-vous fermer ce ticket ?',
                            '',
                            seconds > 0
                                ? `⏱️ Délai avant suppression : **${seconds}s**`
                                : '⏱️ Fermeture immédiate',
                            ...transcriptLines()
                        ].join('\n')
                    )
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(CUSTOM_IDS.confirmClose)
                        .setLabel('Confirmer la fermeture')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(CUSTOM_IDS.cancelClose)
                        .setLabel('Annuler')
                        .setStyle(ButtonStyle.Secondary)
                )
            ],
            flags: MessageFlags.Ephemeral
        });
    }

    if (customId === CUSTOM_IDS.confirmClose) {
        return startCloseCountdown(interaction, client);
    }

    if (customId === CUSTOM_IDS.cancelClose) {
        return interaction.update({
            content: '✅ Fermeture annulée.',
            embeds: [],
            components: []
        });
    }
}

function cfgStaffHint() {
    const staff = config.get().Channels?.staffChannelId;
    return staff ? '📁 Copie également envoyée dans le salon **staff**' : '';
}

module.exports = { CUSTOM_IDS, handleCloseButton, getCloseCooldownSeconds };
