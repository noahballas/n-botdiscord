const config = require('../../../config/manager');
const { id, VIEWS } = require('../constants');
const { MODES } = require('./constants');
const {
    addCategory,
    removeCategoryAt,
    updateCategoryAt,
    loadCategoryIntoSession,
    clearPendingFields
} = require('./manager');
const { patchSession } = require('../session');

function isTicketConfigPart(parts) {
    if (parts[1] === 'ticket') return true;
    if (parts[1] === 'btn' && parts[2] === 'ticket' && parts[3] !== 'modal') return true;
    if (parts[1] === 'btn' && parts[2] === 'ticket' && parts[3] === 'toggle') return true;
    return false;
}

async function handleTicketConfig(interaction, parts, ctx) {
    const { messageId, session, refreshMessage, deny, showEditModal, handlePublishTickets } = ctx;

    if (parts[1] === 'ticket' && parts[2] === 'max') {
        config.set(['Tickets', 'settings', 'maxTicketsPerUser'], Number.parseInt(interaction.values[0], 10));
        return refreshMessage(interaction, VIEWS.TICKETS, {
            ...session,
            ticketMode: MODES.LIST,
            toast: `✅ Limite : **${interaction.values[0]}** ticket(s)/joueur.`
        });
    }

    if (parts[1] === 'ticket' && parts[2] === 'cooldown') {
        config.set(['Tickets', 'settings', 'closeCooldownSeconds'], Number.parseInt(interaction.values[0], 10));
        return refreshMessage(interaction, VIEWS.TICKETS, {
            ...session,
            ticketMode: MODES.LIST,
            toast: `✅ Délai fermeture : **${interaction.values[0]}** seconde(s).`
        });
    }

    if (parts[1] === 'ticket' && parts[2] === 'preset') {
        patchSession(messageId, { ticketPreset: interaction.values[0] });
        return refreshMessage(interaction, VIEWS.TICKETS, { ...ctx.getSession() });
    }

    if (parts[1] === 'ticket' && parts[2] === 'role') {
        const roleId = interaction.roles.first()?.id;
        if (roleId) patchSession(messageId, { ticketRoleId: roleId });
        return refreshMessage(interaction, VIEWS.TICKETS, { ...ctx.getSession() });
    }

    if (parts[1] === 'ticket' && parts[2] === 'category') {
        const categoryId = interaction.channels.first()?.id;
        if (categoryId) patchSession(messageId, { ticketCategoryId: categoryId });
        return refreshMessage(interaction, VIEWS.TICKETS, { ...ctx.getSession() });
    }

    if (parts[1] === 'ticket' && parts[2] === 'remove') {
        const result = removeCategoryAt(interaction.values[0]);
        if (result.error) return deny(interaction, result.error);
        patchSession(messageId, { ticketMode: MODES.LIST, ...clearPendingFields() });
        return refreshMessage(interaction, VIEWS.TICKETS, {
            ...ctx.getSession(),
            toast: `✅ **${result.removed.label}** supprimée. (${result.count} restante(s))`
        });
    }

    if (parts[1] === 'ticket' && parts[2] === 'edit') {
        const index = interaction.values[0];
        const loaded = loadCategoryIntoSession(Number.parseInt(index, 10));
        if (!loaded) return deny(interaction, '❌ Raison introuvable.');
        patchSession(messageId, {
            ticketMode: MODES.EDIT_FORM,
            ticketEditIndex: index,
            ...loaded
        });
        return refreshMessage(interaction, VIEWS.TICKETS, { ...ctx.getSession() });
    }

    if (parts[1] === 'btn' && parts[2] === 'ticket') {
        if (parts[3] === 'publish') {
            return handlePublishTickets(interaction, session, messageId);
        }

        if (parts[3] === 'toggle' && parts[4] === 'transcript') {
            const current = config.get().Tickets.settings.transcriptEnabled !== false;
            config.set(['Tickets', 'settings', 'transcriptEnabled'], !current);
            return refreshMessage(interaction, VIEWS.TICKETS, {
                ...ctx.getSession(),
                ticketMode: MODES.LIST,
                toast: `✅ Transcripts ${!current ? 'activés' : 'désactivés'}.`
            });
        }

        if (parts[3] === 'back') {
            patchSession(messageId, { ticketMode: MODES.LIST, ...clearPendingFields() });
            return refreshMessage(interaction, VIEWS.TICKETS, { ...ctx.getSession() });
        }

        if (parts[3] === 'mode' && parts[4] === 'add') {
            patchSession(messageId, { ticketMode: MODES.ADD, ...clearPendingFields() });
            return refreshMessage(interaction, VIEWS.TICKETS, { ...ctx.getSession() });
        }

        if (parts[3] === 'mode' && parts[4] === 'remove') {
            patchSession(messageId, { ticketMode: MODES.REMOVE, ...clearPendingFields() });
            return refreshMessage(interaction, VIEWS.TICKETS, { ...ctx.getSession() });
        }

        if (parts[3] === 'mode' && parts[4] === 'edit') {
            patchSession(messageId, { ticketMode: MODES.EDIT_PICK, ...clearPendingFields() });
            return refreshMessage(interaction, VIEWS.TICKETS, { ...ctx.getSession() });
        }

        if (parts[3] === 'save') {
            const current = ctx.getSession();
            const isEdit = current.ticketMode === MODES.EDIT_FORM;
            const result = isEdit
                ? updateCategoryAt(current.ticketEditIndex, current)
                : addCategory(current);

            if (result.error === 'CUSTOM_MODAL') {
                return showEditModal(interaction, ['cfg', 'btn', 'modal', 'ticket', 'custom']);
            }
            if (result.error) return deny(interaction, result.error);

            patchSession(messageId, { ticketMode: MODES.LIST, ...clearPendingFields() });
            return refreshMessage(interaction, VIEWS.TICKETS, {
                ...ctx.getSession(),
                toast: isEdit
                    ? `✅ **${result.entry.label}** mise à jour.`
                    : `✅ **${result.entry.label}** ajoutée (${result.count} raison(s)). **Publiez** le panneau.`
            });
        }

        if (parts[3] === 'clear') {
            config.set(['Tickets', 'categories'], []);
            patchSession(messageId, { ticketMode: MODES.LIST, ...clearPendingFields() });
            return refreshMessage(interaction, VIEWS.TICKETS, {
                ...ctx.getSession(),
                toast: '✅ Toutes les raisons ont été supprimées.'
            });
        }
    }

    return true;
}

module.exports = { isTicketConfigPart, handleTicketConfig, MODES };
