const config = require('../../../config/manager');
const { getTicketPreset, TICKET_PRESETS } = require('../constants');

function getCategories() {
    return [...(config.get().Tickets?.categories ?? [])];
}

function saveCategories(categories) {
    config.set(['Tickets', 'categories'], categories);
    return categories;
}

function formatCategoryLine(cat, index) {
    return (
        `**${index + 1}.** ${cat.label}\n` +
        `╰ ${cat.description}\n` +
        `╰ Staff <@&${cat.roleId}> · Dossier <#${cat.categoryId}>`
    );
}

function formatCategoryList(categories) {
    if (!categories.length) {
        return '_Aucune raison configurée — cliquez **Ajouter une raison**._';
    }
    return categories.map((c, i) => formatCategoryLine(c, i)).join('\n\n');
}

function resolveEntryFromSession(session) {
    const preset = getTicketPreset(session.ticketPreset);
    if (!preset) return { error: '❌ Choisissez un modèle de raison.' };
    if (!session.ticketRoleId) return { error: '❌ Sélectionnez le rôle staff.' };
    if (!session.ticketCategoryId) return { error: '❌ Sélectionnez la catégorie Discord.' };

    if (preset.id === 'custom') {
        if (!session.ticketCustomLabel) return { error: 'CUSTOM_MODAL' };
        return {
            entry: {
                label: session.ticketCustomLabel,
                description: session.ticketCustomDescription || '—',
                roleId: session.ticketRoleId,
                categoryId: session.ticketCategoryId
            }
        };
    }

    return {
        entry: {
            label: preset.label,
            description: preset.description,
            roleId: session.ticketRoleId,
            categoryId: session.ticketCategoryId
        }
    };
}

function addCategory(session) {
    const resolved = resolveEntryFromSession(session);
    if (resolved.error) return resolved;

    const categories = getCategories();
    categories.push(resolved.entry);
    saveCategories(categories);
    return { ok: true, entry: resolved.entry, count: categories.length };
}

function removeCategoryAt(index) {
    const categories = getCategories();
    const i = Number.parseInt(index, 10);
    if (Number.isNaN(i) || i < 0 || i >= categories.length) {
        return { error: '❌ Raison introuvable.' };
    }
    const [removed] = categories.splice(i, 1);
    saveCategories(categories);
    return { ok: true, removed, count: categories.length };
}

function updateCategoryAt(index, session) {
    const resolved = resolveEntryFromSession(session);
    if (resolved.error) return resolved;

    const categories = getCategories();
    const i = Number.parseInt(index, 10);
    if (Number.isNaN(i) || i < 0 || i >= categories.length) {
        return { error: '❌ Raison introuvable.' };
    }

    categories[i] = resolved.entry;
    saveCategories(categories);
    return { ok: true, entry: resolved.entry, count: categories.length };
}

function loadCategoryIntoSession(index) {
    const cat = getCategories()[index];
    if (!cat) return null;

    let ticketPreset = 'custom';
    for (const p of TICKET_PRESETS) {
        if (p.id !== 'custom' && p.label === cat.label) {
            ticketPreset = p.id;
            break;
        }
    }

    return {
        ticketPreset,
        ticketRoleId: cat.roleId,
        ticketCategoryId: cat.categoryId,
        ticketCustomLabel: ticketPreset === 'custom' ? cat.label : undefined,
        ticketCustomDescription: ticketPreset === 'custom' ? cat.description : undefined
    };
}

function clearPendingFields() {
    return {
        ticketPreset: undefined,
        ticketRoleId: undefined,
        ticketCategoryId: undefined,
        ticketCustomLabel: undefined,
        ticketCustomDescription: undefined,
        ticketEditIndex: undefined
    };
}

module.exports = {
    getCategories,
    saveCategories,
    formatCategoryList,
    resolveEntryFromSession,
    addCategory,
    removeCategoryAt,
    updateCategoryAt,
    loadCategoryIntoSession,
    clearPendingFields
};
