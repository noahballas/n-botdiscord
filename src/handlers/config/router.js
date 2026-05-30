const { MessageFlags } = require('discord.js');
const config = require('../../config/manager');
const { isConfigAdmin } = require('../../utils/permissions');
const { publishPanel } = require('../../services/tickets');
const { PREFIX, VIEWS, id } = require('./constants');
const { buildPanel } = require('./views');
const {
    getSession,
    bindMessage,
    setView,
    setLinkPick,
    setRoleList,
    setChannelSlot,
    patchSession
} = require('./session');
const { isTicketConfigPart, handleTicketConfig, MODES: TICKET_MODES } = require('./tickets/router');
const { clearPendingFields } = require('./tickets/manager');
const { showEditModal, handleModalSubmit } = require('./modals');
const { safeDeferUpdate, safeEphemeral, safeUpdate, isExpired } = require('../../utils/safeInteraction');
const { applyBotPresence, STATUS_LABELS, ACTIVITY_LABELS } = require('../../services/botPresence');

function isConfigInteraction(interaction) {
    if (interaction.isModalSubmit() && interaction.customId.startsWith(`${PREFIX}:`)) return true;
    if ('customId' in interaction && interaction.customId?.startsWith(`${PREFIX}:`)) return true;
    return false;
}

function deny(interaction, text) {
    return safeEphemeral(interaction, text);
}

async function refreshMessage(interaction, view, extra = {}) {
    const messageId = interaction.message?.id;
    const session = messageId ? getSession(messageId) : null;
    const { toast, ...sessionPatch } = extra;
    const merged = { ...session, ...sessionPatch };
    const panel = buildPanel(view, {
        userId: interaction.user.id,
        session: merged,
        guild: interaction.guild
    });

    if (messageId) setView(messageId, view);

    if (interaction.isModalSubmit()) {
        await safeEphemeral(interaction, toast ?? '✅ Enregistré.');
        if (interaction.message) await interaction.message.edit(panel).catch(() => {});
        return;
    }

    if (interaction.deferred) {
        await interaction.message?.edit(panel).catch(() => {});
        if (toast) await safeEphemeral(interaction, toast);
        return;
    }

    await safeUpdate(interaction, panel);
    if (toast) await safeEphemeral(interaction, toast);
}

async function openPanel(interaction) {
    if (!isConfigAdmin(interaction.member)) {
        return deny(interaction, '❌ Réservé aux administrateurs du bot.');
    }

    const isPublic = interaction.options?.getBoolean('public') ?? false;
    const panel = buildPanel(VIEWS.HOME, {
        userId: interaction.user.id,
        session: {},
        guild: interaction.guild
    });

    const flags = isPublic ? undefined : MessageFlags.Ephemeral;
    const response = await interaction.reply({
        ...panel,
        flags,
        withResponse: true
    });

    const message = response.resource?.message ?? (await interaction.fetchReply());
    bindMessage(message.id, interaction.user.id, VIEWS.HOME);
}

async function handlePublishTickets(interaction, session, messageId) {
    const deferred = await safeDeferUpdate(interaction);
    if (!deferred && !interaction.deferred) {
        return deny(interaction, '❌ Interaction expirée — recliquez sur **Publier**.');
    }

    try {
        await publishPanel(interaction.client);
        const panel = buildPanel(VIEWS.TICKETS, {
            userId: interaction.user.id,
            session: getSession(messageId) ?? session,
            guild: interaction.guild
        });
        await interaction.message?.edit(panel).catch(() => {});
        await safeEphemeral(interaction, '✅ Panneau tickets publié dans le salon configuré.');
    } catch (err) {
        await safeEphemeral(interaction, `❌ ${err.message}`);
    }
}

async function handleConfigInteraction(interaction) {
    try {
        if (interaction.isModalSubmit()) {
            if (!isConfigAdmin(interaction.member)) {
                return deny(interaction, '❌ Permission refusée.');
            }
            const result = await handleModalSubmit(interaction);
            if (!result.ok) return deny(interaction, result.message);
            return refreshMessage(interaction, result.view ?? VIEWS.HOME, { toast: result.message });
        }

        if (!isConfigAdmin(interaction.member)) {
            return deny(interaction, '❌ Permission refusée.');
        }

        const parts = interaction.customId.split(':');
        const messageId = interaction.message.id;
        const session = getSession(messageId) ?? {
            ownerId: interaction.user.id,
            view: VIEWS.HOME
        };

        if (parts[1] === 'nav') {
            const view = interaction.values[0];
            bindMessage(messageId, session.ownerId, view);
            if (view === VIEWS.TICKETS) {
                patchSession(messageId, {
                    ticketMode: TICKET_MODES.LIST,
                    ...clearPendingFields()
                });
            }
            return refreshMessage(interaction, view, getSession(messageId) ?? session);
        }

        if (isTicketConfigPart(parts)) {
            return handleTicketConfig(interaction, parts, {
                messageId,
                session,
                getSession: () => getSession(messageId) ?? session,
                refreshMessage,
                deny,
                showEditModal,
                handlePublishTickets
            });
        }

        if (parts[1] === 'pick' && parts[2] === 'link') {
            setLinkPick(messageId, interaction.values[0]);
            return refreshMessage(interaction, VIEWS.LINKS, {
                ...session,
                linkKey: interaction.values[0]
            });
        }

        if (parts[1] === 'pick' && parts[2] === 'channel') {
            setChannelSlot(messageId, interaction.values[0]);
            return refreshMessage(interaction, VIEWS.CHANNELS, {
                ...session,
                channelSlot: interaction.values[0]
            });
        }

        if (parts[1] === 'pick' && parts[2] === 'rolelist') {
            setRoleList(messageId, interaction.values[0]);
            return refreshMessage(interaction, VIEWS.ROLES, {
                ...session,
                roleList: interaction.values[0]
            });
        }

        if (parts[1] === 'set' && parts[2] === 'channel') {
            const key = parts[3];
            const channelId = interaction.channels.first()?.id;
            if (channelId) config.set(['Channels', key], channelId);
            return refreshMessage(interaction, VIEWS.CHANNELS, {
                ...session,
                toast: `✅ Salon configuré.`
            });
        }

        if (parts[1] === 'set' && parts[2] === 'suggestion') {
            const roleId = interaction.roles.first()?.id;
            if (roleId) config.set(['Roles', 'acceptSuggestion'], roleId);
            return refreshMessage(interaction, VIEWS.ROLES, { ...session, toast: '✅ Rôle suggestions défini.' });
        }

        if (parts[1] === 'add' && parts[2] === 'role') {
            const listKey = parts[3];
            const roleId = interaction.roles.first()?.id;
            if (roleId) {
                const current = [...(config.get().Roles[listKey] || [])];
                if (!current.includes(roleId)) current.push(roleId);
                config.set(['Roles', listKey], current);
            }
            return refreshMessage(interaction, VIEWS.ROLES, {
                ...session,
                roleList: listKey,
                toast: '✅ Rôle ajouté.'
            });
        }

        if (parts[1] === 'del' && parts[2] === 'role') {
            const listKey = parts[3];
            const removeId = interaction.values[0];
            const next = (config.get().Roles[listKey] || []).filter((rid) => rid !== removeId);
            config.set(['Roles', listKey], next);
            return refreshMessage(interaction, VIEWS.ROLES, {
                ...session,
                roleList: listKey,
                toast: '✅ Rôle retiré.'
            });
        }

        if (parts[1] === 'bot' && parts[2] === 'status') {
            const status = interaction.values[0];
            config.set(['DiscordBot', 'presence', 'status'], status);
            await applyBotPresence(interaction.client);
            return refreshMessage(interaction, VIEWS.BOT, {
                ...session,
                toast: `✅ Statut : **${STATUS_LABELS[status] ?? status}** (appliqué).`
            });
        }

        if (parts[1] === 'bot' && parts[2] === 'activity') {
            const activityType = interaction.values[0];
            config.set(['DiscordBot', 'presence', 'activityType'], activityType);
            await applyBotPresence(interaction.client);
            return refreshMessage(interaction, VIEWS.BOT, {
                ...session,
                toast: `✅ Activité : **${ACTIVITY_LABELS[activityType] ?? activityType}** (appliquée).`
            });
        }

        if (parts[1] === 'btn') {
            if (parts[2] === 'refresh') {
                return refreshMessage(interaction, session.view ?? VIEWS.HOME, session);
            }
            if (parts[2] === 'modal') {
                return showEditModal(interaction, parts);
            }
        }

        return deny(interaction, '❌ Action inconnue.');
    } catch (error) {
        if (isExpired(error)) {
            console.warn('[config] Interaction expirée (bouton/menu trop ancien).');
            return;
        }
        throw error;
    }
}

module.exports = { isConfigInteraction, openPanel, handleConfigInteraction };
