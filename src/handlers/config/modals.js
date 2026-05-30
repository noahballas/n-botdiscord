const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const config = require('../../config/manager');
const { id } = require('./constants');
const { patchSession, getSession } = require('./session');
const { MODES } = require('./tickets/constants');
const { applyBotPresence } = require('../../services/botPresence');

function buildModal(modalId, title, fields) {
    const modal = new ModalBuilder().setCustomId(modalId).setTitle(title.slice(0, 45));

    for (const field of fields) {
        const input = new TextInputBuilder()
            .setCustomId(field.id)
            .setLabel(field.label.slice(0, 45))
            .setStyle(field.style ?? TextInputStyle.Short)
            .setRequired(field.required !== false)
            .setMaxLength(field.max ?? 4000);

        if (field.placeholder) input.setPlaceholder(field.placeholder.slice(0, 100));
        if (field.value) input.setValue(String(field.value).slice(0, field.max ?? 4000));

        modal.addComponents(new ActionRowBuilder().addComponents(input));
    }

    return modal;
}

function openModal(interaction, modalId, title, fields) {
    return interaction.showModal(buildModal(modalId, title, fields));
}

async function showEditModal(interaction, parts) {
    const cfg = config.get();
    const type = parts[3];
    const field = parts[4];

    if (type === 'server') {
        const map = {
            name: { title: 'Nom du serveur', label: 'Nom', value: cfg.Server.name, max: 100 },
            logo: { title: 'Logo URL', label: 'URL', value: cfg.Server.logoUrl, max: 500 },
            banner: { title: 'Bannière', label: 'URL', value: cfg.Server.bannerUrl, max: 500 },
            panelDesc: {
                title: 'Description panneau',
                label: 'Texte',
                value: cfg.Server.ticketSettings?.panelDescription,
                style: TextInputStyle.Paragraph,
                max: 500
            }
        };
        const spec = map[field];
        if (!spec) return;
        return openModal(interaction, id('modal', 'server', field), spec.title, [
            { id: 'value', label: spec.label, value: spec.value, style: spec.style, max: spec.max }
        ]);
    }

    if (type === 'gmod') {
        const map = {
            ip: { title: 'IP GMod', label: 'ip:port', value: cfg.GMod.ip },
            connect: { title: 'Steam', label: 'Commande', value: cfg.GMod.connectCommand }
        };
        const spec = map[field];
        if (!spec) return;
        return openModal(interaction, id('modal', 'gmod', field), spec.title, [
            { id: 'value', label: spec.label, value: spec.value }
        ]);
    }

    if (type === 'link') {
        return openModal(interaction, id('modal', 'link', field), `Lien — ${field}`, [
            {
                id: 'value',
                label: 'URL',
                value: cfg.Commands[field] || '',
                style: TextInputStyle.Paragraph,
                max: 500
            }
        ]);
    }

    if (type === 'bot') {
        const p = cfg.DiscordBot.presence ?? {};
        const map = {
            token: { title: 'Token', label: 'Token', placeholder: 'Nouveau token', max: 200 },
            clientId: { title: 'Client ID', label: 'ID', value: cfg.DiscordBot.clientId },
            guildId: { title: 'Guild ID', label: 'ID', value: cfg.DiscordBot.guildId },
            bio: {
                title: 'Bio / activité',
                label: 'Texte affiché',
                value: p.bio,
                placeholder: 'Ex: Mon serveur GMod — /help',
                style: TextInputStyle.Paragraph,
                max: 128,
                required: false
            },
            stream: {
                title: 'Live Twitch',
                label: 'URL ou pseudo Twitch',
                value: p.streamUrl,
                placeholder: 'https://twitch.tv/ma_chaine ou ma_chaine',
                max: 200,
                required: false
            }
        };
        const spec = map[field];
        if (!spec) return;
        return openModal(interaction, id('modal', 'bot', field), spec.title, [
            {
                id: 'value',
                label: spec.label,
                value: spec.value,
                placeholder: spec.placeholder,
                max: spec.max,
                required: field !== 'token'
            }
        ]);
    }

    if (type === 'ticket' && field === 'custom') {
        const draft = interaction.message?.id ? getSession(interaction.message.id) : null;
        return openModal(interaction, id('modal', 'ticket', 'custom'), 'Catégorie personnalisée', [
            {
                id: 'label',
                label: 'Nom affiché',
                value: draft?.ticketCustomLabel,
                max: 100
            },
            {
                id: 'description',
                label: 'Description',
                value: draft?.ticketCustomDescription,
                style: TextInputStyle.Paragraph,
                max: 200,
                required: false
            }
        ]);
    }
}

async function handleModalSubmit(interaction) {
    const parts = interaction.customId.split(':');
    const value = (key) => interaction.fields.getTextInputValue(key)?.trim() ?? '';

    if (parts[2] === 'server') {
        const field = parts[3];
        const v = value('value');
        if (field === 'panelDesc') {
            config.set(['Server', 'ticketSettings', 'panelDescription'], v);
        } else {
            config.set(['Server', field], v);
        }
        return { ok: true, message: '✅ Serveur mis à jour.', view: 'server' };
    }

    if (parts[2] === 'gmod') {
        const key = parts[3] === 'connect' ? 'connectCommand' : 'ip';
        config.set(['GMod', key], value('value'));
        return { ok: true, message: '✅ GMod mis à jour.', view: 'gmod' };
    }

    if (parts[2] === 'link') {
        config.set(['Commands', parts[3]], value('value'));
        return { ok: true, message: '✅ Lien enregistré.', view: 'links' };
    }

    if (parts[2] === 'bot') {
        const field = parts[3];
        const v = value('value');
        if (field === 'token' && !v) return { ok: false, message: '❌ Token vide.' };

        if (field === 'bio') {
            config.set(['DiscordBot', 'presence', 'bio'], v);
            await applyBotPresence(interaction.client);
            return { ok: true, message: '✅ Bio enregistrée et présence mise à jour.', view: 'bot' };
        }

        if (field === 'stream') {
            config.set(['DiscordBot', 'presence', 'streamUrl'], v);
            await applyBotPresence(interaction.client);
            return { ok: true, message: '✅ URL Twitch enregistrée.', view: 'bot' };
        }

        if (v) {
            config.set(['DiscordBot', field], v);
            config.markConfigured();
        }
        const hint = field === 'token' ? ' Redémarrez le bot.' : '';
        return { ok: true, message: `✅ Bot mis à jour.${hint}`, view: 'bot' };
    }

    if (parts[2] === 'ticket' && parts[3] === 'custom') {
        const messageId = interaction.message?.id;
        if (messageId) {
            const s = getSession(messageId);
            patchSession(messageId, {
                ticketPreset: 'custom',
                ticketCustomLabel: value('label'),
                ticketCustomDescription: value('description'),
                ticketMode: s?.ticketMode ?? MODES.ADD
            });
        }
        return {
            ok: true,
            message: '✅ Texte enregistré. Complétez rôle + catégorie puis **Enregistrer**.',
            view: 'tickets'
        };
    }

    return { ok: false, message: '❌ Modal inconnu.' };
}

module.exports = { showEditModal, handleModalSubmit };
